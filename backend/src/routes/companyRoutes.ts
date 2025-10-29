import express from "express";
import isAuth from "../middleware/isAuth";
import multer from "multer";
import uploadConfig from "../config/upload";

import * as CompanyController from "../controllers/CompanyController";

const upload = multer(uploadConfig);
const companyRoutes = express.Router();

companyRoutes.get("/companies/list", isAuth, CompanyController.list);
companyRoutes.get("/companies", isAuth, CompanyController.index);
companyRoutes.get("/companies/:id", isAuth, CompanyController.show);
companyRoutes.post("/companies", isAuth, CompanyController.store);
companyRoutes.put("/companies/:id", isAuth, CompanyController.update);
companyRoutes.put("/companies/:id/schedules",isAuth,CompanyController.updateSchedules);
companyRoutes.delete("/companies/:id", isAuth, CompanyController.remove);
companyRoutes.post("/companies/cadastro", CompanyController.store);
companyRoutes.put("/companies/token/:id", isAuth,  CompanyController.CompanyGenerationToken);
companyRoutes.post("/companies/:id/media-upload", isAuth, upload.array("file"), CompanyController.mediaUpload );
companyRoutes.delete("/companies/:id/media-upload", isAuth, CompanyController.deleteMedia);

// Rota para listar o plano da empresa
companyRoutes.get("/companies/listPlan/:id", isAuth, CompanyController.listPlan);
companyRoutes.get("/companiesPlan", isAuth, CompanyController.indexPlan);

export default companyRoutes;
