import express from "express";
import isAuth from "../middleware/isAuth";

import * as StoreController from "../controllers/StoreController";

const storeRoutes = express.Router();

storeRoutes.get("/stores/list", isAuth, StoreController.list);

storeRoutes.get("/stores", isAuth, StoreController.index);

storeRoutes.post("/stores", isAuth, StoreController.store);

storeRoutes.put("/stores/:storeId", isAuth, StoreController.update);

storeRoutes.get("/stores/:storeId", isAuth, StoreController.show);

storeRoutes.delete("/stores/:storeId", isAuth, StoreController.remove);

export default storeRoutes;
