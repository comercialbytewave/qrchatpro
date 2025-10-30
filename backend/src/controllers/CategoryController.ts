import { Request, Response } from "express";
import { getIO } from "../libs/socket";

import AppError from "../errors/AppError";

import Category from "../models/Category";
import ListCategoryService from "../services/CategoryServices/ListCategoryService";
import FindAllCategoryService from "../services/CategoryServices/FindAllCategoryService";
import CreateCategoryService from "../services/CategoryServices/CreateCategoryService";
import ShowCategoryService from "../services/CategoryServices/ShowCategoryService";
import UpdateCategoryService from "../services/CategoryServices/UpdateCategoryService";
import DeleteCategoryService from "../services/CategoryServices/DeleteCategoryService";
import SimpleListCategoryService from "../services/CategoryServices/SimpleListCategoryService";


type IndexQuery = {
  searchParam?: string;
  pageNumber?: string | number;
};

export const index = async (req: Request, res: Response): Promise<Response> => {
  const { pageNumber, searchParam } = req.query as IndexQuery;
  const { companyId } = req.user;

  const { categories, count, hasMore } = await ListCategoryService({
    searchParam,
    pageNumber,
    companyId,
  });

  return res.json({ categories, count, hasMore });
};


export const all = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  console.log(`all ${companyId}` + companyId);
  const categories: Category[] = await FindAllCategoryService(companyId);

  return res.status(200).json(categories);
};

export const store = async (req: Request, res: Response): Promise<Response> => {
  const { name,code } = req.body;
  const { companyId } = req.user;

  const category = await CreateCategoryService({
    name,
    code,
    companyId
  });

  const io = getIO();
  io.of(String(companyId)).emit(`company-${companyId}-category`, {
    action: "update",
    category: category
  });

 
  return res.status(200).json(category);
};

export const show = async (req: Request, res: Response): Promise<Response> => {
  const { categoryId } = req.params;
  const { companyId } = req.user;

  const category = await ShowCategoryService({id: categoryId,companyId});

  return res.status(200).json(category);
};

export const update = async (
  req: Request,
  res: Response
): Promise<Response> => {
  if (req.user.profile !== "admin") {
    throw new AppError("ERR_NO_PERMISSION", 403);
  }

  const { categoryId } = req.params;
  const { companyId } = req.user;
  const categoryData = req.body;

  const category = await UpdateCategoryService({ categoryData, id: categoryId ,companyId});

  const io = getIO();
  io.of(String(companyId))
  .emit(`company-${companyId}-category`, {
    action: "update",
    category
  });

  return res.status(200).json(category);
};

export const remove = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { categoryId } = req.params;
  const { companyId } = req.user;
  await DeleteCategoryService(categoryId);

  const io = getIO();
  io.emit(`company-${companyId}-category`, {
    action: "delete",
    categoryId
  });

  return res.status(200).json({ message: "Category deleted" });
};

export const list = async (req: Request, res: Response): Promise<Response> => {
  const { searchParam } = req.query as IndexQuery;
  const { companyId } = req.user;

  const categories = await SimpleListCategoryService({ searchParam, companyId });

  return res.json(categories);
};
