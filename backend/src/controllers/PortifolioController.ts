import { Request, Response } from "express";
import { getIO } from "../libs/socket";

import AppError from "../errors/AppError";
import ListPortifolioService from "../services/PortifolioServices/ListPortifolioService";
import FindAllPortifolioService from "../services/PortifolioServices/FindAllPortifolioService";
import Portifolio from "../models/Portifolio";
import CreatePortifolioService from "../services/PortifolioServices/CreatePortifolioService";
import ShowPortifolioService from "../services/PortifolioServices/ShowPortifolioService";
import UpdatePortifolioService from "../services/PortifolioServices/UpdatePortifolioService";
import DeletePortifolioService from "../services/PortifolioServices/DeletePortifolioService";
import SimpleListPortifolioService from "../services/PortifolioServices/SimpleListPortifolioService";

type IndexQuery = {
  searchParam?: string;
  pageNumber?: string | number;
};

export const index = async (req: Request, res: Response): Promise<Response> => {
  const { pageNumber, searchParam } = req.query as IndexQuery;
  const { companyId } = req.user;

  const { portifolios, count, hasMore } = await ListPortifolioService({
    searchParam,
    pageNumber,
    companyId
  });
  console.log(portifolios);

  return res.json({ portifolios, count, hasMore });
};

export const all = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;

  const portifolios: Portifolio[] = await FindAllPortifolioService(companyId);

  return res.status(200).json(portifolios);
};

export const store = async (req: Request, res: Response): Promise<Response> => {
  const { name, userId } = req.body;
  const { companyId } = req.user;

  const portifolio = await CreatePortifolioService({
    name,
    userId,
    companyId
  });

  const io = getIO();
  io.of(String(companyId)).emit(`company-${companyId}-portifolios`, {
    action: "update",
    portifolio: portifolio
  });

  return res.status(200).json(portifolio);
};

export const show = async (req: Request, res: Response): Promise<Response> => {
  const { portifolioId } = req.params;
  const { companyId } = req.user;

  const portifolio = await ShowPortifolioService({
    id: portifolioId,
    companyId
  });

  return res.status(200).json(portifolio);
};

export const update = async (
  req: Request,
  res: Response
): Promise<Response> => {
  if (req.user.profile !== "admin") {
    throw new AppError("ERR_NO_PERMISSION", 403);
  }

  const { portifolioId } = req.params;
  const { companyId } = req.user;
  const portifolioData = req.body;

  const portifolio = await UpdatePortifolioService({
    portifolioData,
    id: portifolioId,
    companyId
  });
  console.log(portifolio);

  const io = getIO();
  io.of(String(companyId)).emit(`company-${companyId}-portifolios`, {
    action: "update",
    portifolio
  });

  return res.status(200).json(portifolio);
};

export const remove = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { portifolioId } = req.params;
  const { companyId } = req.user;

  await DeletePortifolioService(portifolioId);

  const io = getIO();
  io.of(String(companyId)).emit(`company-${companyId}-portifolios`, {
    action: "delete",
    portifolioId: +portifolioId
  });
  return res.status(200).json({ message: "Portifolio deleted" });
};

export const list = async (req: Request, res: Response): Promise<Response> => {
  const { searchParam } = req.query as IndexQuery;
  const { companyId } = req.user;

  const portifolios = await SimpleListPortifolioService({
    searchParam,
    companyId
  });

  return res.json(portifolios);
};
