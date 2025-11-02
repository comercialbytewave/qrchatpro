import express from "express";
import isAuth from "../middleware/isAuth";

import * as BudGetController from "../controllers/BudGetController";

const budGetRoutes = express.Router();

budGetRoutes.get("/budgets", isAuth, BudGetController.index);

//budGetRoutes.get("/budgets/customer/customerId", isAuth, BudGetController.index);

budGetRoutes.post("/budgets", isAuth, BudGetController.store);

//budGetRoutes.put("/budgets/:budgetId", isAuth, BudGetController.update);

//budGetRoutes.get("/budgets/:budgetId", isAuth, BudGetController.show);

budGetRoutes.delete("/budgets/:budgetId", isAuth, BudGetController.remove);

export default budGetRoutes;
