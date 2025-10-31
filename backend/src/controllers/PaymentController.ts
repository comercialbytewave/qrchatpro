import { Request, Response } from "express";
import { getIO } from "../libs/socket";

import AppError from "../errors/AppError";

import FindAllPaymentService from "../services/PaymentServices/FindAllPaymentService";
import Payment from "../models/Payment";
import ListPaymentService from "../services/PaymentServices/ListPaymentService";
import CreatePaymentService from "../services/PaymentServices/CreatePaymentService";
import PaymentShowService from "../services/PaymentServices/PaymentShowService";
import UpdatePaymentService from "../services/PaymentServices/UpdatePaymentService";
import DeletePaymentService from "../services/PaymentServices/DeletePaymentService";
import SimpleListPaymentService from "../services/PaymentServices/SimpleListPaymentService";


type IndexQuery = {
  searchParam?: string;
  pageNumber?: string | number;
};

export const index = async (req: Request, res: Response): Promise<Response> => {
  const { pageNumber, searchParam } = req.query as IndexQuery;
  const { companyId } = req.user;

  const { payments, count, hasMore } = await ListPaymentService({
    searchParam,
    pageNumber,
    companyId,
  });

  return res.json({ payments, count, hasMore });
};


export const all = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;

  const payments: Payment[] = await FindAllPaymentService(companyId);

  return res.status(200).json(payments);
};

export const store = async (req: Request, res: Response): Promise<Response> => {
  const { code, name, typePaymentId } = req.body;
  const { companyId } = req.user;

  const payment = await CreatePaymentService({
    code,
    name,
    typePaymentId,
    companyId
  });

  const io = getIO();
  io.of(String(companyId)).emit(`company-${companyId}-payment`, {
    action: "update",
    payment: payment
  });

  return res.status(200).json(payment);
};

export const show = async (req: Request, res: Response): Promise<Response> => {
  const { paymentId } = req.params;

  const payment = await PaymentShowService(paymentId);

  return res.status(200).json(payment);
};

export const update = async (
  req: Request,
  res: Response
): Promise<Response> => {
  if (req.user.profile !== "admin") {
    throw new AppError("ERR_NO_PERMISSION", 403);
  }
  
  const { companyId } = req.user;
  const { paymentId } = req.params;
  const paymentData = req.body;

  const payment = await UpdatePaymentService({ paymentData, id: paymentId });

  const io = getIO();
  io.of(String(companyId))
  .emit(`company-${companyId}-payment`, {
    action: "update",
    payment
  });

  return res.status(200).json(payment);
};

export const remove = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { paymentId } = req.params;
  const { companyId } = req.user;
  await DeletePaymentService(paymentId);

  const io = getIO();
  io.of(String(companyId)).emit(`company-${companyId}-payment`, {
    action: "delete",
    paymentId: +paymentId
  });
  

  return res.status(200).json({ message: "Pagamento deleted" });
};

export const list = async (req: Request, res: Response): Promise<Response> => {
  const { searchParam } = req.query as IndexQuery;
  const { companyId } = req.user;

  const payments = await SimpleListPaymentService({ searchParam, companyId });

  return res.json(payments);
};
