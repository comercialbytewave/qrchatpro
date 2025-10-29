import express from "express";
import isAuth from "../middleware/isAuth";

import multer from "multer";
import uploadConfig from "../config/upload";
import * as ProductController from "../controllers/ProductController";

const upload = multer(uploadConfig);
const productsRoutes = express.Router();

productsRoutes.get("/products/list", isAuth, ProductController.list);

productsRoutes.get("/products", isAuth, ProductController.index);

productsRoutes.post("/products", isAuth, ProductController.store);

productsRoutes.put("/products/:productId", isAuth, ProductController.update);

productsRoutes.get("/products/:productId", isAuth, ProductController.show);

productsRoutes.delete("/products/:productId", isAuth, ProductController.remove);

productsRoutes.post("/products/:id/media-upload", isAuth, upload.array("file"), ProductController.mediaUpload );
  
productsRoutes.delete("/products/:id/media-upload", isAuth, ProductController.deleteMedia);

export default productsRoutes;
