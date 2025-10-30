import express from "express";
import isAuth from "../middleware/isAuth";

import * as CustomerController from "../controllers/CustomerController";

import * as CustomerAddressController from "../controllers/CustomerAddressController";

const customersRoutes = express.Router();


customersRoutes.get("/customers/search/:document", isAuth, CustomerController.search);

customersRoutes.get("/customers/list", isAuth, CustomerController.list);

customersRoutes.get("/customers/all", CustomerController.all);

customersRoutes.get("/customers", isAuth, CustomerController.index);

customersRoutes.post("/customers", isAuth, CustomerController.store);

customersRoutes.put("/customers/:customerId", isAuth, CustomerController.update);

customersRoutes.get("/customers/:customerId", isAuth, CustomerController.show);

customersRoutes.delete("/customers/:customerId", isAuth, CustomerController.remove);

// Address Customer
customersRoutes.get(`/customers/address/list`, isAuth, CustomerAddressController.list);

customersRoutes.get("/customers/address/all/:customerId", isAuth, CustomerAddressController.index);

customersRoutes.post("/customers/address", isAuth, CustomerAddressController.store);

customersRoutes.put("/customers/address/:customerAddressId", isAuth, CustomerAddressController.update);

customersRoutes.get("/customers/address/:customerAddressId", isAuth, CustomerAddressController.show);

customersRoutes.delete("/customers/address/:customerAddressId", isAuth, CustomerAddressController.remove);


customersRoutes.post("/customers/integracao", isAuth, CustomerController.store);


export default customersRoutes;
