import { Request, Response } from "express";
import { getIO } from "../libs/socket";

import AppError from "../errors/AppError";
import CreateBudGetService from "../services/BudGetServices/CreateBudGetService";
import DeleteBudGetService from "../services/BudGetServices/DeleteBudGetService";
import FindAllBudGetService from "../services/BudGetServices/FindAllBudGetService";
import ListBudGetService from "../services/BudGetServices/ListBudGetService";

import BudGet from "../models/BudGet";

type IndexQuery = {
  searchParam?: string;
  customerId?: number, 
  statusBudGetId?: number;
  pageNumber?: string | number;
};


export const index = async (req: Request, res: Response): Promise<Response> => {
  const { customerId, statusBudGetId, pageNumber, searchParam } = req.query as IndexQuery;
  const { companyId } = req.user;

  const { budGets, count, hasMore } = await ListBudGetService({
    searchParam,
    customerId, 
    statusBudGetId,
    pageNumber,
    companyId,
  });

  return res.json({ budGets, count, hasMore });
};


export const all = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;

  const customers: BudGet[] = await FindAllBudGetService(companyId);

  return res.status(200).json(customers);
};

export const store = async (req: Request, res: Response): Promise<Response> => {
  try {
    const data = req.body;

    const { companyId, id: userId } = req.user;

    const budGet = await CreateBudGetService({
      data,
      companyId
    });

    const io = getIO();
    io.emit("budGet", {
      action: "create",
      budGet
    });

    return res.status(201).json(budGet);
  } catch (error: any) {
    throw new AppError(error.message || "Erro ao criar orçamento", 500);
  }
};

export const remove = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { id } = req.params;

  const budGet = await DeleteBudGetService(id);

  return res.status(200).json(budGet);
};

