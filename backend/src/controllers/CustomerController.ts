import { Request, Response } from "express";
import { getIO } from "../libs/socket";

import AppError from "../errors/AppError";
import ListCustomerService from "../services/CustomerServices/ListCustomerService";
import Customer from "../models/Customer";
import FindAllCustomerService from "../services/CustomerServices/FindAllCustomerService";
import CreateCustomerService from "../services/CustomerServices/CreateCustomerService";
import ShowCustomerService from "../services/CustomerServices/ShowCustomerService";
import UpdateCustomerService from "../services/CustomerServices/UpdateCustomerService";
import DeleteCustomerService from "../services/CustomerServices/DeleteCustomerService";
import SimpleListCustomerService from "../services/CustomerServices/SimpleListCustomerService";
import DocumentCustomerService from "../services/CustomerServices/DocumentCustomerService";

type IndexQuery = {
  searchParam?: string;
  document?: string;
  pageNumber?: string | number;
};

export const index = async (req: Request, res: Response): Promise<Response> => {
  const { pageNumber, searchParam } = req.query as IndexQuery;
  const { companyId } = req.user;

  const { customers, count, hasMore } = await ListCustomerService({
    searchParam,
    pageNumber,
    companyId,
  });

  return res.json({ customers, count, hasMore });
};


export const all = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;

  const customers: Customer[] = await FindAllCustomerService(companyId);

  return res.status(200).json(customers);
};

export const store = async (req: Request, res: Response): Promise<Response> => {
  const { fullName, document, email, birthday, portifolioId, customerDefault } = req.body;
  const { companyId } = req.user;

  const customer = await CreateCustomerService({
    document,
    fullName,
    email,
    birthday,
    portifolioId,
    customerDefault,
    companyId
  });

  const io = getIO();
  io.of(String(companyId)).emit(`company-${companyId}-customers`, {
    action: "update",
    customer: customer
  });
  
  return res.status(200).json(customer);
};

export const show = async (req: Request, res: Response): Promise<Response> => {
  const { customerId } = req.params;
  const { companyId } = req.user;

  const customer = await ShowCustomerService({id: customerId,companyId});

  return res.status(200).json(customer);
};

export const update = async (
  req: Request,
  res: Response
): Promise<Response> => {
  if (req.user.profile !== "admin") {
    throw new AppError("ERR_NO_PERMISSION", 403);
  }

  const { customerId } = req.params;
  const { companyId } = req.user;
  const customerData = req.body;

  const customer = await UpdateCustomerService({ customerData, id: customerId ,companyId});

  const io = getIO();
  io.of(String(companyId)).emit(`company-${companyId}-customers`, {
    action: "update",
    customer
  });

  return res.status(200).json(customer);
};

export const remove = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { customerId } = req.params;
  const { companyId } = req.user;
  await DeleteCustomerService(customerId);

  const io = getIO();
  io.of(String(companyId)).emit(`company-${companyId}-portifolios`, {
    action: "delete",
    customerId: +customerId
  });

  return res.status(200).json({ message: "Customer deleted" });
};

export const list = async (req: Request, res: Response): Promise<Response> => {
  const { searchParam } = req.query as IndexQuery;
  const { companyId } = req.user;

  const customers = await SimpleListCustomerService({ searchParam, companyId });

  return res.json(customers);
};

export const search = async (req: Request, res: Response): Promise<Response> => {
  const { document } = req.params;
  const { companyId } = req.user;

  const customers = await DocumentCustomerService({ document, companyId });

  return res.json(customers);
};
