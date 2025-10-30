import { Request, Response } from "express";
import { getIO } from "../libs/socket";

import AppError from "../errors/AppError";

import ListStoreService from "../services/StoreServices/ListStoreService";
import CreateStoreService from "../services/StoreServices/CreateStoreService";
import ShowStoreService from "../services/StoreServices/ShowStoreService";
import UpdateStoreService from "../services/StoreServices/UpdateStoreService";
import DeleteStoreService from "../services/StoreServices/DeleteStoreService";
import SimpleListStoreService from "../services/StoreServices/SimpleListStoesService";
import LisByStoreService from "../services/StoreServices/ListByStoreIdService";

type IndexQuery = {
  searchParam?: string;
  pageNumber?: string | number;
};

export const index = async (req: Request, res: Response): Promise<Response> => {
  const { pageNumber, searchParam } = req.query as IndexQuery;
  const { companyId } = req.user;

  const { stores, count, hasMore } = await ListStoreService({
    searchParam,
    pageNumber,
    companyId
  });

  return res.json({ stores, count, hasMore });
};

export const store = async (req: Request, res: Response): Promise<Response> => {
  const {
    document,
    name,
    fantasy,
    zipCode,
    address,
    number,
    complement,
    neighborhood,
    city,
    state,
    latitude,
    longitude,
    isActive,
  } = req.body;
  const { companyId } = req.user;

  const store = await CreateStoreService({
    document,
    name,
    fantasy,
    zipCode,
    address,
    number,
    complement,
    neighborhood,
    city,
    state,
    latitude,
    longitude,
    isActive,
    companyId
  });

  const io = getIO();
  io.of(String(companyId)).emit(`company-${companyId}-store`, {
    action: "update",
    store: store
  });

  return res.status(200).json(store);
};

export const show = async (req: Request, res: Response): Promise<Response> => {
  const { storeId } = req.params;

  const store = await ShowStoreService(storeId);

  return res.status(200).json(store);
};

export const update = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { companyId } = req.user;

  if (req.user.profile !== "admin") {
    throw new AppError("ERR_NO_PERMISSION", 403);
  }

  const { storeId } = req.params;
  const storeData = req.body;

  const store = await UpdateStoreService({
    storeData,
    id: storeId
  });

  const io = getIO();
  io.of(String(companyId))
  .emit(`company-${companyId}-store`, {
    action: "update",
    store
  });

  return res.status(200).json(store);
};

export const remove = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { storeId } = req.params;
  const { companyId } = req.user;
  await DeleteStoreService(storeId);

  const io = getIO();
  io.of(String(companyId)).emit(`company-${companyId}-store`, {
    action: "delete",
    storeId: +storeId
  });

  return res.status(200).json({ message: "Loja deleted" });
};

export const list = async (req: Request, res: Response): Promise<Response> => {
  const { searchParam } = req.query as IndexQuery;
  const { companyId } = req.user;

  const stores = await SimpleListStoreService({
    searchParam,
    companyId
  });

  return res.json(stores);
};

export const listByCompanyId = async (req: Request, res: Response): Promise<Response> => {
  
  const { companyId } = req.user;

  const stores = await LisByStoreService(
    companyId
  );

  return res.json(stores);
};
