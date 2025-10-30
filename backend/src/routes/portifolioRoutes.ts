import express from "express";
import isAuth from "../middleware/isAuth";

import * as PortifolioController from "../controllers/PortifolioController";

const portifolioRoutes = express.Router();

portifolioRoutes.get("/portifolios/list", isAuth, PortifolioController.list);

portifolioRoutes.get("/portifolios/all", PortifolioController.all);


portifolioRoutes.get("/portifolios", isAuth, PortifolioController.index);

portifolioRoutes.post("/portifolios", isAuth, PortifolioController.store);

portifolioRoutes.put("/portifolios/:portifolioId", isAuth, PortifolioController.update);

portifolioRoutes.get("/portifolios/:portifolioId", isAuth, PortifolioController.show);

portifolioRoutes.delete("/portifolios/:portifolioId", isAuth, PortifolioController.remove);

export default portifolioRoutes;
