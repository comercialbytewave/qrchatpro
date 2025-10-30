import { Request, Response } from "express";
import { getIO } from "../libs/socket";
import { head } from "lodash";
import fs from "fs";
import path from "path";

import AppError from "../errors/AppError";
import Product from "../models/Product";
import ListProductService from "../services/ProductServices/ListProductService";
import CreateProductService from "../services/ProductServices/CreateProductService";
import ShowProductService from "../services/ProductServices/ShowProductService";
import UpdateProductService from "../services/ProductServices/UpdateProductService";
import DeleteProductService from "../services/ProductServices/DeleteProductService";
import SimpleListProductService from "../services/ProductServices/SimpleListProductService";


type IndexQuery = {
  searchParam?: string;
  pageNumber?: string | number;
};

export const index = async (req: Request, res: Response): Promise<Response> => {
  const { pageNumber, searchParam } = req.query as IndexQuery;
  const { companyId } = req.user;

  const { products, count, hasMore } = await ListProductService({
    searchParam,
    pageNumber,
    companyId
  });

  return res.json({ products, count, hasMore });
};

export const store = async (req: Request, res: Response): Promise<Response> => {
  const { ean, name, code, description, isActive, categoryId, mediaPath, mediaName } = req.body;
  const { companyId } = req.user;

  const payload = {
    ean,
    name,
    code,
    description,
    isActive,
    categoryId,
    companyId
  };

  const product = await CreateProductService(payload);

  const io = getIO();
  io.of(String(companyId)).emit(`company-${companyId}-product`, {
    action: "update",
    product: product
  });
 
  return res.status(200).json(product);
};

export const show = async (req: Request, res: Response): Promise<Response> => {
  const { productId } = req.params;
  const { companyId } = req.user;
  const product = await ShowProductService({id: productId, companyId});

  return res.status(200).json(product);
};

export const update = async (
  req: Request,
  res: Response
): Promise<Response> => {
  if (req.user.profile !== "admin") {
    throw new AppError("ERR_NO_PERMISSION", 403);
  }

  const { companyId } = req.user;
  const { productId } = req.params;
  const productData = req.body;
  const product = await UpdateProductService({
    productData,
    id: productId,
    companyId: req.user.companyId
  });

  
  const io = getIO();
  io.of(String(companyId))
  .emit(`company-${companyId}-product`, {
    action: "update",
    product
  });
  return res.status(200).json(product);
};

export const remove = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { companyId } = req.user;
  const { productId } = req.params;

  await DeleteProductService(productId);

  const io = getIO();
  io.of(String(companyId)).emit(`company-${companyId}-product`, {
    action: "delete",
    productId: +productId
  });
  
  return res.status(200).json({ message: "Product deleted" });
};

export const list = async (req: Request, res: Response): Promise<Response> => {
  const { searchParam } = req.query as IndexQuery;
  const { companyId } = req.user;

  const tags = await SimpleListProductService({ searchParam, companyId });

  return res.json(tags);
};

export const mediaUpload = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { id } = req.params;
  const files = req.files as Express.Multer.File[];
  const file = head(files);

  try {
    const product = await Product.findByPk(id);
    product.mediaPath = file.filename;
    product.mediaName = file.originalname;
    await product.save();
    return res.send({ mensagem: "Mensagem enviada" });
  } catch (err: any) {
    throw new AppError(err.message);
  }
};

export const deleteMedia = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { id } = req.params;

  try {
    const product = await Product.findByPk(id);
    const filePath = path.resolve("public", product.mediaPath);
    const fileExists = fs.existsSync(filePath);
    if (fileExists) {
      fs.unlinkSync(filePath);
    }
    product.mediaPath = null;
    product.mediaName = null; 
    await product.save();
    return res.send({ mensagem: "Arquivo excluído" });
  } catch (err: any) {
    throw new AppError(err.message);
  }
};
