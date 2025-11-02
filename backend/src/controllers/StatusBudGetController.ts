import { Request, Response } from "express";
import { getIO } from "../libs/socket";

import AppError from "../errors/AppError";
import ListStatusBudGetService from "../services/StatusBudGetServices/ListStatusBudGetService";
import FindAllStatusBudGetService from "../services/StatusBudGetServices/FindAllStatusBudGetService";
import StatusBudGets from "../models/StatusBudGets";
import CreateStatusBudGetService from "../services/StatusBudGetServices/CreateStatusBudGetService";
import ShowStatusBudGetService from "../services/StatusBudGetServices/ShowStatusBudGetService";
import UpdateStatuBudGetService from "../services/StatusBudGetServices/UpdateStatusBudGetService";
import DeleteStatusBudGetService from "../services/StatusBudGetServices/DeleteStatusBudGetService";
import SimpleListStatusBudGetService from "../services/StatusBudGetServices/SimpleListStatusBudGetService";




type IndexQuery = {
  searchParam?: string;
  pageNumber?: string | number;
};

export const index = async (req: Request, res: Response): Promise<Response> => {
  const { pageNumber, searchParam } = req.query as IndexQuery;
  const { companyId } = req.user;

  const { statusBudGets, count, hasMore } = await ListStatusBudGetService({
    searchParam,
    pageNumber,
    companyId,
  });

  return res.json({ statusBudGets, count, hasMore });
};


export const all = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;

  const statusBudGets: StatusBudGets[] = await FindAllStatusBudGetService(companyId);

  return res.status(200).json(statusBudGets);
};

export const store = async (req: Request, res: Response): Promise<Response> => {
  const { name,code } = req.body;
  const { companyId } = req.user;

  const statusBudGet = await CreateStatusBudGetService({
    name,
    code,
    companyId
  });

  const io = getIO();
  io.of(String(companyId)).emit(`company-${companyId}-statusBudGets`, {
    action: "update",
    statusBudGet: statusBudGet
  });

  return res.status(200).json(statusBudGet);
};

export const show = async (req: Request, res: Response): Promise<Response> => {
  const { statusBudGetId } = req.params;
  const { companyId } = req.user;

  const statusBudGet = await ShowStatusBudGetService({id: statusBudGetId,companyId});

  return res.status(200).json(statusBudGet);
};

export const update = async (
  req: Request,
  res: Response
): Promise<Response> => {
  if (req.user.profile !== "admin") {
    throw new AppError("ERR_NO_PERMISSION", 403);
  }

  const { statusBudGetId } = req.params;
  const { companyId } = req.user;
  const statusBudGetData = req.body;

  const statusBudGet = await UpdateStatuBudGetService({ statusBudGetData, id: statusBudGetId ,companyId});

  const io = getIO();
  io.of(String(companyId))
  .emit(`company-${companyId}-statusBudGets`, {
    action: "update",
    statusBudGet
  });

  return res.status(200).json(statusBudGet);
};

export const remove = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { statusBudGetId } = req.params;
  const { companyId } = req.user;

  await DeleteStatusBudGetService(statusBudGetId);

  const io = getIO();
  io.of(String(companyId)).emit(`company-${companyId}-product`, {
    action: "delete",
    statusBudGetId: +statusBudGetId
  });
  

  return res.status(200).json({ message: "Category deleted" });
};

export const list = async (req: Request, res: Response): Promise<Response> => {
  const { searchParam } = req.query as IndexQuery;
  const { companyId } = req.user;

  const statusBudGets = await SimpleListStatusBudGetService({ searchParam, companyId });

  return res.json(statusBudGets);
};
