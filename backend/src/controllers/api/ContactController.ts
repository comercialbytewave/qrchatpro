import { Request, Response } from "express";

import FindAllContactService from "../../services/ContactServices/FindAllContactsServices";
import NumberSimpleListService from "../../services/ContactServices/NumberSimpleListService";

type IndexQuery = {
   number?: string;
   companyId: number;
};

export const show = async (req: Request, res: Response): Promise<Response> => {
   const { companyId } = req.body as IndexQuery;

   const contacts = await FindAllContactService({ companyId });

   return res.json({ count: contacts.length, contacts });
}

export const count = async (req: Request, res: Response): Promise<Response> => {
   const { companyId } = req.body as IndexQuery;

   const contacts = await FindAllContactService({ companyId });

   return res.json({ count: contacts.length });
}

export const showContact = async (req: Request, res: Response): Promise<Response> => {
   const { number, typePeople, companyId } = req.params;

   const contacts = await NumberSimpleListService({ number, companyId });
   let isCpf = false;
   if (contacts.length === 1 && typePeople === 'Morador') {
      isCpf = contacts[0].extraInfo.some(info => {
         const key = info.name || info.value || "";
         const value = info.value || "";

         return key.toLowerCase().includes('cpf') && value.replace(/\D/g, '').length === 11;
      });
   } else if (contacts.length === 1 && typePeople === 'Sindico') {
      isCpf = contacts[0].extraInfo.some(info => {
         const key = info.name || info.value || "";
         const value = info.value || "";

         return key.toLowerCase().includes('cnpj') && value.replace(/\D/g, '').length === 14;
      });
   }


   return res.json({ count: contacts.length, contacts, isCpf });
}

export const showContactPropriedades = async (
   req: Request,
   res: Response
): Promise<Response> => {

   const { number, typePeople, companyId } = req.params;

   const contacts = await NumberSimpleListService({ number, companyId });

   let isCpf = false;

   if (contacts.length === 1) {
      const extraInfo = contacts[0].extraInfo || [];

      if (typePeople === "Morador") {
         isCpf = extraInfo.some(info => {
            const key = (info.name || "").toLowerCase();
            const value = (info.value || "").replace(/\D/g, "");
            return key.includes("cpf") && value.length === 11;
         });
      }

      if (typePeople === "Sindico") {
         isCpf = extraInfo.some(info => {
            const key = (info.name || "").toLowerCase();
            const value = (info.value || "").replace(/\D/g, "");
            return key.includes("cnpj") && value.length === 14;
         });
      }
   }

   // 🔹 FUNÇÃO PARA FLATTEN DO extraInfo
   const flattenExtraInfo = (extraInfo: any[] = []) => {
      const result: Record<string, string> = {};

      extraInfo.forEach(info => {
         if (!info?.name) return;

         const key = info.name
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/\s+/g, "_");

         result[key] = info.value || "";
      });

      return result;
   };

   // 🔹 Aplica somente se houver 1 contato
   const extraInfoFlat =
      contacts.length === 1
         ? flattenExtraInfo(contacts[0].extraInfo)
         : {};

   return res.json({
      count: contacts.length,
      isCpf: contacts.length ? true : false,
      contact: contacts[0] || null,
      extraInfo: extraInfoFlat
   });
};

