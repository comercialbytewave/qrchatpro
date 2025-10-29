import express from "express";
import isAuth from "../middleware/isAuth";

import * as CategoryController from "../controllers/CategoryController";

const categoriesRoutes = express.Router();

categoriesRoutes.get("/categories/list", isAuth, CategoryController.list);

categoriesRoutes.get("/categories/all", CategoryController.all);


categoriesRoutes.get("/categories", isAuth, CategoryController.index);

categoriesRoutes.post("/categories", isAuth, CategoryController.store);

categoriesRoutes.put("/categories/:categoryId", isAuth, CategoryController.update);

categoriesRoutes.get("/categories/:categoryId", isAuth, CategoryController.show);

categoriesRoutes.delete("/categories/:categoryId", isAuth, CategoryController.remove);

export default categoriesRoutes;
