import { Request, Response } from "express";
import { getIO } from "../libs/socket";

import AppError from "../errors/AppError";
import ListTypePaymentService from "../services/TypePaymentServices/ListTypePaymentService";
import FindAllTypePaymentService from "../services/TypePaymentServices/FindAllTypePaymentService";
import TypePayments from "../models/TypePayment";
import TypePaymentShowService from "../services/TypePaymentServices/ShowTypePaymentService";
import SimpleListTypePaymentService from "../services/TypePaymentServices/SimpleListTypePaymentService";

type IndexQuery = {
  searchParam?: string;
  pageNumber?: string | number;
};

export const index = async (req: Request, res: Response): Promise<Response> => {
  const { pageNumber, searchParam } = req.query as IndexQuery;
  

  const { typePayments, count, hasMore } = await ListTypePaymentService({
    searchParam,
    pageNumber
  });

  return res.json({ typePayments, count, hasMore });
};


export const all = async (req: Request, res: Response): Promise<Response> => {
  const typePayments: TypePayments[] = await FindAllTypePaymentService();

  return res.status(200).json(typePayments);
};


export const show = async (req: Request, res: Response): Promise<Response> => {
  const { typePaymentId  } = req.params;
  

  const typePayment = await TypePaymentShowService({id: typePaymentId});

  return res.status(200).json(typePayment);
};

export const list = async (req: Request, res: Response): Promise<Response> => {
  const { searchParam } = req.query as IndexQuery;

  const typePayments = await SimpleListTypePaymentService({ searchParam });

  return res.json(typePayments);
};
