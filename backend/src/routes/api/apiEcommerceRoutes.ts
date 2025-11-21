import express from "express";


import * as CategoryController from "../../controllers/CategoryController";
import * as CompanyController from "../../controllers/CompanyController";
import * as ContactController from "../../controllers/ContactController";
//import * as ContactAddressController from "../../controllers/contactAddressController";
//import * as DeliveryFeeController from "../../controllers/DeliveryFeeController";
import * as PaymentController from "../../controllers/PaymentController";
import * as ProductController from "../../controllers/ProductController";
import * as EcommerceController from "../../controllers/api/EcommerceController";

import isAuthCompany from "../../middleware/isAuthCompany";

const apiEcommerceRoutes = express.Router();
/*
apiEcommerceRoutes.get("/addresses/list/:contactId", isAuthCompany, ContactAddressController.list);
apiEcommerceRoutes.put("/addresses/:contactAddressId", isAuthCompany, ContactAddressController.updateEcommerce);
apiEcommerceRoutes.post("/addresses", isAuthCompany, ContactAddressController.store);

apiEcommerceRoutes.get("/categories/list", isAuthCompany, CategoryController.listEcommerce);

apiEcommerceRoutes.get("/companies/:slug",  CompanyController.showBySlug);

apiEcommerceRoutes.get("/contacts/:document/:number", isAuthCompany, ContactController.showByDocumentAndPhone);
apiEcommerceRoutes.get("/contacts", isAuthCompany, ContactController.showByIdCrypto);
apiEcommerceRoutes.post("/contacts", isAuthCompany, ContactController.storeEcommerce);


apiEcommerceRoutes.get("/delivery-fee/list", isAuthCompany, DeliveryFeeController.list);
apiEcommerceRoutes.post("/delivery-fee", isAuthCompany, DeliveryFeeController.store);
apiEcommerceRoutes.put("/delivery-fee/:id", isAuthCompany, DeliveryFeeController.update);
apiEcommerceRoutes.get("/delivery-fee/:id", isAuthCompany, DeliveryFeeController.show);
apiEcommerceRoutes.delete("/delivery-fee/:id", isAuthCompany, DeliveryFeeController.remove);

apiEcommerceRoutes.get("/payments/list", isAuthCompany, PaymentController.list);

apiEcommerceRoutes.get("/products/list", isAuthCompany, ProductController.listByCategoryIdAndStoreId);
apiEcommerceRoutes.get("/products/:storeId/:productId", isAuthCompany, ProductController.showWithPrice);

apiEcommerceRoutes.get("/orders/list", isAuthCompany, OrderController.listByContact);
apiEcommerceRoutes.get("/orders/:orderId", isAuthCompany, OrderController.showIntegration);
apiEcommerceRoutes.post("/orders", isAuthCompany, OrderController.store);
*/
apiEcommerceRoutes.get("/ecommerce/payments/list", isAuthCompany, PaymentController.list);


apiEcommerceRoutes.get("/ecommerce/contacts", isAuthCompany, EcommerceController.showByIdCrypto);
apiEcommerceRoutes.get("/ecommerce/contacts/:document/:number", isAuthCompany, EcommerceController.showByDocumentAndPhone);
apiEcommerceRoutes.post("/ecommerce/contacts", isAuthCompany, EcommerceController.storeEcommerce);

apiEcommerceRoutes.get("/ecommerce/categories/list", isAuthCompany, EcommerceController.listEcommerce);


apiEcommerceRoutes.get("/ecommerce/products/list", isAuthCompany, EcommerceController.listByCategoryIdAndStoreId);
apiEcommerceRoutes.get("/ecommerce/products/:storeId/:productId", isAuthCompany, EcommerceController.showWithPrice);

apiEcommerceRoutes.get("/ecommerce/companies/:slug", EcommerceController.showBySlug);
apiEcommerceRoutes.get("/ecommerce/stores/list", isAuthCompany, EcommerceController.listByCompanyId);

export default apiEcommerceRoutes;