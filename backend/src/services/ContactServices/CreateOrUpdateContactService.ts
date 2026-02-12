import { getIO } from "../../libs/socket";
import CompaniesSettings from "../../models/CompaniesSettings";
import Contact from "../../models/Contact";
import fs from "fs";
import path, { join } from "path";
import logger from "../../utils/logger";
import Whatsapp from "../../models/Whatsapp";
import * as Sentry from "@sentry/node";
import { Op } from "sequelize";
import { isNil } from "lodash";

const axios = require("axios");

/* ======================================================
   Utils
====================================================== */

const hasValidValue = (value?: string | null): boolean =>
  typeof value === "string" && value.trim().length > 0;

const extractNumberFromRemoteJid = (remoteJid?: string): string | null => {
  if (!remoteJid) return null;

  if (remoteJid.includes("@s.whatsapp.net")) {
    return remoteJid.replace(/\D/g, "");
  }

  if (remoteJid.includes("@g.us")) {
    return remoteJid.replace("@g.us", "");
  }

  if (remoteJid.includes("@lid")) {
    return remoteJid.replace(/\D/g, "");
  }

  return null;
};

const downloadProfileImage = async ({ profilePicUrl, companyId }) => {
  const publicFolder = path.resolve(__dirname, "..", "..", "..", "public");
  const folder = path.resolve(publicFolder, `company${companyId}`, "contacts");

  if (!fs.existsSync(folder)) {
    fs.mkdirSync(folder, { recursive: true });
    fs.chmodSync(folder, 0o777);
  }

  try {
    const response = await axios.get(profilePicUrl, {
      responseType: "arraybuffer"
    });

    const filename = `${Date.now()}.jpeg`;
    fs.writeFileSync(join(folder, filename), response.data);
    return filename;
  } catch {
    return null;
  }
};

/* ======================================================
   Service
====================================================== */

const CreateOrUpdateContactService = async ({
  name,
  number: rawNumber,
  lid,
  profilePicUrl = "",
  isGroup,
  email = "",
  channel = "whatsapp",
  companyId,
  customerId,
  remoteJid = "",
  whatsappId,
  wbot
}): Promise<Contact> => {
  try {
    const io = getIO();
    let createContact = false;

    /* =====================================
       NUMBER RESOLUTION (SAFE)
    ====================================== */

    const incomingNumber = isGroup
      ? rawNumber
      : rawNumber
      ? rawNumber.replace(/\D/g, "")
      : null;

    const resolvedFromRemoteJid = extractNumberFromRemoteJid(remoteJid);

    const numberForCreate =
      incomingNumber ||
      (hasValidValue(lid) ? lid.replace(/\D/g, "") : null) ||
      resolvedFromRemoteJid;

    /* =====================================
       FIND CONTACT
    ====================================== */

    const whereOr: any[] = [];

    if (hasValidValue(lid)) whereOr.push({ lid });
    if (hasValidValue(incomingNumber))
      whereOr.push({ number: incomingNumber });
    if (!incomingNumber && resolvedFromRemoteJid)
      whereOr.push({ number: resolvedFromRemoteJid });

    const contact = await Contact.findOne({
      where: {
        companyId,
        ...(whereOr.length ? { [Op.or]: whereOr } : {})
      }
    });

    let updateImage =
      !!wbot &&
      profilePicUrl &&
      (!contact || contact.profilePicUrl !== profilePicUrl);

    /* =====================================
       UPDATE CONTACT
    ====================================== */

    if (contact) {
      const dataUpdate: any = {};

      // 🔒 Nunca sobrescrever telefone real por LID
      if (
        hasValidValue(incomingNumber) &&
        contact.number !== incomingNumber
      ) {
        dataUpdate.number = incomingNumber;
      }

      // 🔒 Só salva lid se ainda não existir
      if (!hasValidValue(contact.lid) && hasValidValue(lid)) {
        dataUpdate.lid = lid;
      }

      if (
        hasValidValue(name) &&
        (!hasValidValue(contact.name) || contact.name === contact.lid)
      ) {
        dataUpdate.name = name;
      }

      contact.remoteJid = contact.remoteJid  ? contact.remoteJid :remoteJid;
      contact.isGroup = isGroup;

      if (hasValidValue(profilePicUrl)) {
        contact.profilePicUrl = profilePicUrl;
      }

      if (isNil(contact.whatsappId) && whatsappId) {
        const whatsapp = await Whatsapp.findOne({
          where: { id: whatsappId, companyId }
        });
        if (whatsapp) contact.whatsappId = whatsappId;
      }

      if (
        wbot &&
        channel === "whatsapp" &&
        (!contact.urlPicture || contact.profilePicUrl === "")
      ) {
        try {
          contact.profilePicUrl = await wbot.profilePictureUrl(
            remoteJid,
            "image"
          );
          updateImage = true;
        } catch (e) {
          Sentry.captureException(e);
          contact.profilePicUrl = `${process.env.FRONTEND_URL}/nopicture.png`;
        }
      }

      if (Object.keys(dataUpdate).length) {
        await contact.update(dataUpdate);
      }

      await contact.save();
      await contact.reload();
    }

    /* =====================================
       CREATE CONTACT
    ====================================== */

    else {
      let newRemoteJid = remoteJid;

      if (!remoteJid && numberForCreate) {
        newRemoteJid = isGroup
          ? `${numberForCreate}@g.us`
          : `${numberForCreate}@s.whatsapp.net`;
      }

      if (wbot && channel === "whatsapp") {
        try {
          profilePicUrl = await wbot.profilePictureUrl(newRemoteJid, "image");
        } catch (e) {
          Sentry.captureException(e);
          profilePicUrl = `${process.env.FRONTEND_URL}/nopicture.png`;
        }
      }

      const settings = await CompaniesSettings.findOne({ where: { companyId } });

      const contactCreated = await Contact.create({
        name,
        number: numberForCreate!,
        lid,
        email,
        isGroup,
        companyId,
        customerId,
        channel,
        acceptAudioMessage:
          settings?.acceptAudioMessageContact === "enabled",
        remoteJid: newRemoteJid,
        profilePicUrl,
        urlPicture: "",
        whatsappId
      });

      createContact = true;
      await contactCreated.reload();
      return contactCreated;
    }

    /* =====================================
       IMAGE DOWNLOAD
    ====================================== */

    if (updateImage && contact) {
      const filename = await downloadProfileImage({
        profilePicUrl: contact.profilePicUrl,
        companyId
      });

      if (filename) {
        await contact.update({
          urlPicture: filename,
          pictureUpdated: true
        });
        await contact.reload();
      }
    }

    /* =====================================
       SOCKET
    ====================================== */

    io.of(String(companyId)).emit(`company-${companyId}-contact`, {
      action: createContact ? "create" : "update",
      contact
    });

    return contact!;
  } catch (error) {
    logger.error("Error creating or updating contact:", error);
    throw error;
  }
};

export default CreateOrUpdateContactService;