import { Request, Response } from "express";

import FindAllContactService from "../../services/ContactServices/FindAllContactsServices";
import CreateCustomerService from "../../services/CustomerServices/CreateCustomerService";
import DocumentCustomerService from "../../services/CustomerServices/DocumentCustomerService";
import ShowCustomerService from "../../services/CustomerServices/ShowCustomerService";
import GetContactService from "../../services/ContactServices/GetContactService";
import ShowContactService from "../../services/ContactServices/ShowContactService";
import UpdateContactService from "../../services/ContactServices/UpdateContactService";

type IndexQuery = {
  searchParam?: string;
  document?: string;
  pageNumber?: string | number;
};

export const store = async (req: Request, res: Response): Promise<Response> => {
  const { fullName, document, email, companyId } =
    req.body;
 

    const dataCustomer = {
      document,
      fullName,
      email: email ? email :document + "@" + document + ".com",
      birthday: '01/01/2000',
      portifolioId: 1,
      customerDefault: false,
      companyId
    }
  const customer = await CreateCustomerService(dataCustomer);

  return res.status(200).json(customer);
};

export const search = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { companyId, document } = req.params;
  
  const customers = await DocumentCustomerService({ document, companyId });

  return res.json(customers);
};

export const contatcs = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { companyId, id } = req.params;
  
  const customers = await ShowCustomerService({ id, companyId });

  return res.json(customers);
};


export const customerContacts = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { document, fullName, firstName, phone, companyId, condominio, typePeople  } = req.body;
  

  const showCustomer = await DocumentCustomerService({ document, companyId });
  const phoneContact = showCustomer.contacts.find(contact => contact.number === phone );
  

  if(!phoneContact) {
    const contact = await GetContactService({
      name: "",
      number: phone,
      companyId
    }); 
    let contactData
    if( phoneContact.extraInfo.length > 0 ) {
      const isTypePeople = phoneContact.extraInfo.find(info => info.name === 'Tipo' && info.value === typePeople);

    } else {

      contactData = {
        name: firstName ? firstName : contact.name ? contact.name : showCustomer.fullName,
        number: contact.number,
        customerId: showCustomer.id,
        extraInfo: [ {
          name: "Condominio",
          value: condominio
        }, {
          name: "Tipo",
          value: typePeople
        }, {
          name: "Nome Completo",
          value: fullName
        }, {
          name: typePeople === 'Sindico' ? "CNPJ" : "CPF",
          value: document
        }]     
      }
    }

    const contactUpdate = await UpdateContactService({
      contactData,
      contactId: contact.id.toString(),
      companyId: Number(companyId)
      
    });
    
    showCustomer.contacts.push(contactUpdate);
  } else {
    phoneContact.customerId = showCustomer.id;

    const contactData = {
      name: fullName,
      number: phoneContact.number,
      customerId: showCustomer.id         
    }
    
    const contactUpdate = await UpdateContactService({
      contactData,
      contactId: phoneContact.id.toString(),
      companyId: Number(companyId)
      
    });
    showCustomer.contacts.push(contactUpdate);
  }

  return res.json(showCustomer);
};

export const createContact = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { document, fullName, firstName, phone, companyId, condominio, apartament, typePeople  } = req.body;
  
  const contact = await GetContactService({
    name: "",
    number: phone,
    companyId
  }); 

  const contactData = {
    name: firstName,
    number: contact.number,
    extraInfo: [ {
      name: typePeople == "Sindico" ? "CNPJ" : "CPF",
      value: document
    },{
      name: "Condominio",
      value: condominio
    }, {
      name: "Apartamento",
      value: apartament
    }, {
      name: "Tipo",
      value: typePeople
    }, {
      name: "Nome Completo",
      value: fullName
    }]     
  }

  const contactUpdate = await UpdateContactService({
    contactData,
    contactId: contact.id.toString(),
    companyId: Number(companyId)
    
  });

  return res.json(contactUpdate);
};