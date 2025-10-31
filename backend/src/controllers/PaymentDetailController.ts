import { Request, Response } from "express";
import { getIO } from "../libs/socket";

import AppError from "../errors/AppError";
import ListPaymentDetailService from "../services/PaymntDetailsServices/ListPaymentDetailService";
import CreatePaymentDetailService from "../services/PaymntDetailsServices/CreatePaymentDetailService";
import PaymentDetailShowService from "../services/PaymntDetailsServices/PaymentDetailShowService";
import UpdatePaymentDetailService from "../services/PaymntDetailsServices/UpdatePaymentDetailService";
import DeletePaymentDetailService from "../services/PaymntDetailsServices/DeletePaymentDetailService";
import SimpleListPaymentDetailService from "../services/PaymntDetailsServices/SimpleListPaymentDetailService";

type IndexQuery = {
  paymentId: string | number;
  searchParam?: string;
  pageNumber?: string | number;
};

export const index = async (req: Request, res: Response): Promise<Response> => {
  const { pageNumber, searchParam } = req.query as IndexQuery;
  const { paymentId } = req.params;
  const { companyId } = req.user;

  const { paymentDetails, count, hasMore } = await ListPaymentDetailService({
    paymentId,
    companyId,
    searchParam,
    pageNumber
  });

  return res.json({ paymentDetails, count, hasMore });
};

export const store = async (req: Request, res: Response): Promise<Response> => {
  const {
    paymentDetailId,
   minimumValue,
    installments,
    paymentId,
  } = req.body;
  
  const { companyId } = req.user;

  const payload = {
    paymentDetailId,
   minimumValue,
    installments,
    paymentId,
    companyId
  };

  const paymentDetails = await CreatePaymentDetailService(payload);

  const io = getIO();
  io.of(String(companyId)).emit(`company-${companyId}-paymentDetail`, {
    action: "update",
    paymentDetails: paymentDetails
  });
  
  return res.status(200).json(paymentDetails);
};

export const show = async (req: Request, res: Response): Promise<Response> => {
  const { paymentDetailId } = req.params;

  const paymentDetails = await PaymentDetailShowService(paymentDetailId);

  return res.status(200).json(paymentDetails);
};

export const update = async (
  req: Request,
  res: Response
): Promise<Response> => {
  if (req.user.profile !== "admin") {
    throw new AppError("ERR_NO_PERMISSION", 403);
  }

  const { companyId } = req.user;
  const { paymentDetailId } = req.params;
  const paymentDetailData = req.body;

  const paymentDetails = await UpdatePaymentDetailService({
    paymentDetailData,
    id: paymentDetailId
  });

  const io = getIO();
  io.of(String(companyId))
  .emit(`company-${companyId}-paymentDetail`, {
    action: "update",
    paymentDetails
  });
  return res.status(200).json(paymentDetails);
};

export const remove = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { paymentDetailId } = req.params;
  const { companyId } = req.user;

  await DeletePaymentDetailService(paymentDetailId);

  
  const io = getIO();
  io.of(String(companyId)).emit(`company-${companyId}-payment`, {
    action: "delete",
    paymentDetailId: +paymentDetailId
  });

  return res.status(200).json({ message: "Parcelamento deleted" });
};

export const list = async (req: Request, res: Response): Promise<Response> => {
  const { searchParam } = req.query as IndexQuery;
  const { paymentId } = req.params;
  const { companyId } = req.user;

  const paymentDetails = await SimpleListPaymentDetailService({
    companyId,
    paymentId,
    searchParam
  });

  return res.json(paymentDetails);
};

export const updateEcommerce = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { paymentDetailId } = req.params;
  const paymentDetailData = req.body;

  const paymentDetails = await UpdatePaymentDetailService({
    paymentDetailData,
    id: paymentDetailId
  });

  return res.status(200).json(paymentDetails);
};
