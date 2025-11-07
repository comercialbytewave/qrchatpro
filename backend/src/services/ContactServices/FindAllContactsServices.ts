import Contact from "../../models/Contact";
import ContactCustomField from "../../models/ContactCustomField";
import Customer from "../../models/Customer";
import Tag from "../../models/Tag";

type Param = {
  companyId: number
};

const FindAllContactService = async ({
  companyId
}: Param): Promise<Contact[]> => {
  let where: any = {
    companyId
  };
  const contacts = await Contact.findAll({
    where,
    order: [["name", "ASC"]],
    include: [
      { model: Tag, as: "tags", attributes: ["id", "name", "color", "updatedAt"] },
      { model: Customer, as: "customer", attributes: ["id", "fullname"] },
      { model: ContactCustomField, as: "extraInfo", attributes: ["id", "name", "value"] }
    ]
  });

  return contacts;
};

export default FindAllContactService;