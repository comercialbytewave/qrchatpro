import express from "express";
import isAuth from "../middleware/isAuth";

import * as ProductStoreController from "../controllers/ProductStoreController";

const productStoresRoutes = express.Router();

productStoresRoutes.get(`/productStores/list`, isAuth, ProductStoreController.list);

productStoresRoutes.get("/productStores/all/:productId", isAuth, ProductStoreController.index);

productStoresRoutes.post("/productStores", isAuth, ProductStoreController.store);

productStoresRoutes.put("/productStores/:productStoreId", isAuth, ProductStoreController.update);

productStoresRoutes.get("/productStores/:productStoreId", isAuth, ProductStoreController.show);

productStoresRoutes.delete("/productStores/:productStoreId", isAuth, ProductStoreController.remove);

productStoresRoutes.get(`/productStores/:storeId/search`, isAuth, ProductStoreController.search);

productStoresRoutes.get(`/productStores/:storeId/:productId`, isAuth, ProductStoreController.searchId);

export default productStoresRoutes;
