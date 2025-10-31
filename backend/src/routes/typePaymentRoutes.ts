import express from "express";
import isAuth from "../middleware/isAuth";

import * as TypePaymentController from "../controllers/TypePaymentController";

const typePaymentRoutes = express.Router();

typePaymentRoutes.get("/typePayments/list", isAuth, TypePaymentController.list);

typePaymentRoutes.get("/typePayments/all", TypePaymentController.all);

typePaymentRoutes.get("/typePayments", isAuth, TypePaymentController.index);

typePaymentRoutes.get("/typePayments/:categoryId", isAuth, TypePaymentController.show);


export default typePaymentRoutes;
