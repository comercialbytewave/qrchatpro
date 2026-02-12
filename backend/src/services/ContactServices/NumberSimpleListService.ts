import Contact from "../../models/Contact";
import AppError from "../../errors/AppError";
import { FindOptions, Op } from "sequelize";
import ContactCustomField from "../../models/ContactCustomField";
import Tag from "../../models/Tag";

export interface SearchContactParams {
  companyId: string | number;
  number: string;
}

const NumberSimpleListService = async ({
  number,
  companyId
}: SearchContactParams): Promise<Contact[]> => {
  let options: FindOptions = {
    order: [["name", "ASC"]],

    include: [
      {
        model: Tag,
        as: "tags",
        attributes: ["id", "name", "color", "updatedAt"]
      },
      {
        model: ContactCustomField,
        as: "extraInfo",
        attributes: ["id", "name", "value"]
      }
    ]
  };

  if (number) {
    options.where = {
      number: {
        [Op.like]: `%${number}%`
      }
    };
  }

  options.where = {
    ...options.where,
    companyId
  };

  const contacts = await Contact.findAll(options);

  if (!contacts) {
    throw new AppError("ERR_NO_CONTACT_FOUND", 404);
  }

  return contacts;
};

export default NumberSimpleListService;
