import { Request, Response } from "express";
import { getIO } from "../libs/socket";

import AppError from "../errors/AppError";
import ListProductStoreService from "../services/ProductStoresService/ListProductStoreService";
import CreateProductStoreService from "../services/ProductStoresService/CreateProductStoreService";
import ProductStoreShowService from "../services/ProductStoresService/ShowProductStoreService";
import UpdateProductStoreService from "../services/ProductStoresService/UpdateProductStoreService";
import DeleteProductStoreService from "../services/ProductStoresService/DeleteProductStoreService";
import SimpleListProductStoreService from "../services/ProductStoresService/SimpleListProductStoreService";
import SearchProductStoreService from "../services/ProductStoresService/SearchProductStoreService";
import SimpleListProductStoreProductService from "../services/ProductStoresService/SimpleListProductStoreProductService";


type IndexQuery = {
  productId: string | number;
  searchParam?: string;
  pageNumber?: string | number;
};

export const index = async (req: Request, res: Response): Promise<Response> => {
  const { pageNumber, searchParam } = req.query as IndexQuery;
  const { productId } = req.params;
  const { companyId } = req.user;

  const { productStores, count, hasMore } = await ListProductStoreService({
    productId,
    companyId,
    searchParam,
    pageNumber
  });

  return res.json({ productStores, count, hasMore });
};

export const store = async (req: Request, res: Response): Promise<Response> => {
  const { productId, storeId, stock, costPrice, sellingPrice, promotionPrice } =
    req.body;
  const { companyId } = req.user;

  const payload = {
    productId,
    storeId,
    stock,
    costPrice,
    sellingPrice,
    promotionPrice,
    companyId
  };

  const productStore = await CreateProductStoreService(payload);

  const io = getIO();
  io.emit("productStore", {
    action: "create",
    productStore
  });

  return res.status(200).json(productStore);
};

export const show = async (req: Request, res: Response): Promise<Response> => {
  const { productStoreId } = req.params;

  const productStore = await ProductStoreShowService(productStoreId);

  return res.status(200).json(productStore);
};

export const update = async (
  req: Request,
  res: Response
): Promise<Response> => {
  if (req.user.profile !== "admin") {
    throw new AppError("ERR_NO_PERMISSION", 403);
  }

  const { productStoreId } = req.params;
  const producStoreData = req.body;

  const productStore = await UpdateProductStoreService({
    producStoreData,
    id: productStoreId
  });

  const io = getIO();
  io.emit("productStore", {
    action: "update",
    productStore
  });

  return res.status(200).json(productStore);
};

export const remove = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { productStoreId } = req.params;

  await DeleteProductStoreService(productStoreId);

  const io = getIO();
  io.emit("productStore", {
    action: "delete",
    productStoreId
  });

  return res.status(200).json({ message: "Preço do Product deleted" });
};

export const list = async (req: Request, res: Response): Promise<Response> => {
  const { searchParam } = req.query as IndexQuery;
  const { companyId } = req.user;

  const tags = await SimpleListProductStoreService({companyId,  searchParam });

  return res.json(tags);
};

export const search = async (req: Request, res: Response): Promise<Response> => {
  const { searchParam, pageNumber } = req.query as IndexQuery; // Adicionamos storeId e pageNumber aqui
  const { companyId } = req.user;
  const { storeId } = req.params;
  const { productStores, count, hasMore } = await SearchProductStoreService({
    companyId,
    searchParam,
    pageNumber,
    storeId: storeId ? parseInt(storeId, 10) : undefined 
  });

  return res.json({ productStores, count, hasMore });
};

export const searchId = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { storeId, productId } = req.params;
  const productStores = await SimpleListProductStoreProductService({
    companyId,
    storeId,
    productId
  });

  return res.json({ productStores});
};
