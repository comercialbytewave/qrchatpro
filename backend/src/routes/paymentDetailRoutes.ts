import express from "express";
import isAuth from "../middleware/isAuth";

import * as PaymentDetailController from "../controllers/PaymentDetailController";

const paymentDetailRoutes = express.Router();

paymentDetailRoutes.get(`/paymentDetails/list`, isAuth, PaymentDetailController.list);

paymentDetailRoutes.get("/paymentDetails/all/:paymentId", isAuth, PaymentDetailController.index);

paymentDetailRoutes.post("/paymentDetails", isAuth, PaymentDetailController.store);

paymentDetailRoutes.put("/paymentDetails/:paymentDetailId", isAuth, PaymentDetailController.update);

paymentDetailRoutes.get("/paymentDetails/:paymentDetailId", isAuth, PaymentDetailController.show);

paymentDetailRoutes.delete("/paymentDetails/:paymentDetailId", isAuth, PaymentDetailController.remove);

export default paymentDetailRoutes;
