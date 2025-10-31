import express from "express";
import isAuth from "../middleware/isAuth";

import * as PaymentController from "../controllers/PaymentController";

const paymentsRoutes = express.Router();

paymentsRoutes.get("/payments/list", isAuth, PaymentController.list);

paymentsRoutes.get("/payments/all", PaymentController.all);

paymentsRoutes.get("/payments", isAuth, PaymentController.index);

paymentsRoutes.post("/payments", isAuth, PaymentController.store);

paymentsRoutes.put("/payments/:paymentId", isAuth, PaymentController.update);

paymentsRoutes.get("/payments/:paymentId", isAuth, PaymentController.show);

paymentsRoutes.delete("/payments/:paymentId", isAuth, PaymentController.remove);

export default paymentsRoutes;
