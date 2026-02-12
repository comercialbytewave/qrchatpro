import express from "express";

import * as CustomerController from "../../controllers/api/CustomerController";
import * as ContactController from "../../controllers/api/ContactController";

import isAuthApi from "../../middleware/tokenAuth";

const apiBotRoutes = express.Router();

apiBotRoutes.get("/bot/customers/search/:companyId/:document", isAuthApi, CustomerController.search);
apiBotRoutes.post("/bot/customers", isAuthApi, CustomerController.store);
apiBotRoutes.get("/bot/customers/contacts/:companyId/:id", isAuthApi, CustomerController.contatcs);
apiBotRoutes.post("/bot/customers/contacts", isAuthApi, CustomerController.customerContacts);
apiBotRoutes.get("/bot/contacts/:companyId/:number/:typePeople", isAuthApi, ContactController.showContact);
apiBotRoutes.get("/bot/contacts/:companyId/:number/typeople", isAuthApi, ContactController.showContactPropriedades);
apiBotRoutes.post("/bot/contact", isAuthApi, CustomerController.createContact);


export default apiBotRoutes;