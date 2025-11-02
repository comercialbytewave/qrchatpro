import express from "express";
import isAuth from "../middleware/isAuth";

import * as StatusBudGetController from "../controllers/StatusBudGetController";

const statusBudGetRoutes = express.Router();

statusBudGetRoutes.get("/statusBudGets/list", isAuth, StatusBudGetController.list);

statusBudGetRoutes.get("/statusBudGets/all", StatusBudGetController.all);


statusBudGetRoutes.get("/statusBudGets", isAuth, StatusBudGetController.index);

statusBudGetRoutes.post("/statusBudGets", isAuth, StatusBudGetController.store);

statusBudGetRoutes.put("/statusBudGets/:statusBudGetId", isAuth, StatusBudGetController.update);

statusBudGetRoutes.get("/statusBudGets/:statusBudGetId", isAuth, StatusBudGetController.show);

statusBudGetRoutes.delete("/statusBudGets/:statusBudGetId", isAuth, StatusBudGetController.remove);

export default statusBudGetRoutes;
