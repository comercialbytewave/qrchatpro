import { Request, Response } from "express";
import { getIO } from "../libs/socket";

import AppError from "../errors/AppError";
import ListCustomerAddressService from "../services/CustomerAddressService/ListCustomerAddressService";
import CreateCustomerAddressService from "../services/CustomerAddressService/CreateCustomerAddressService";
import CustomerAddressShowService from "../services/CustomerAddressService/CustomerAddressShowService";
import UpdateCustomerAddressService from "../services/CustomerAddressService/UpdateCustomerAddressService";
import DeleteCustomerAddressService from "../services/CustomerAddressService/DeleteCustomerAddressService";
import SimpleListCustomerAddressService from "../services/CustomerAddressService/SimpleListCustomerAddressService";


type IndexQuery = {
  customerId: string | number;
  searchParam?: string;
  pageNumber?: string | number;
};

export const index = async (req: Request, res: Response): Promise<Response> => {
  const { pageNumber, searchParam } = req.query as IndexQuery;
  const { customerId } = req.params;
  const { companyId } = req.user;

  const { customerAddress, count, hasMore } = await ListCustomerAddressService({
    customerId,
    companyId,
    searchParam,
    pageNumber
  });

  return res.json({ customerAddress, count, hasMore });
};

export const store = async (req: Request, res: Response): Promise<Response> => {
  const {
    customerId,
    name,
    zipCode,
    address,
    number,
    complement,
    neighborhood,
    city,
    state,
    longitude,
    latitude,
    isActive
  } = req.body;
  const { companyId } = req.user;

  const payload = {
    customerId,
    name,
    zipCode,
    address,
    number,
    complement,
    neighborhood,
    city,
    state,
    longitude,
    latitude,
    isActive,
    companyId
  };


  const customerAddress = await CreateCustomerAddressService(payload);

  const io = getIO();
  io.of(String(companyId)).emit(`company-${companyId}-customerAddress`, {
    action: "update",
    customerAddress: customerAddress
  });

  return res.status(200).json(customerAddress);
};

export const show = async (req: Request, res: Response): Promise<Response> => {
  const { customerAddressId } = req.params;

  const customerAddress = await CustomerAddressShowService(customerAddressId);

  return res.status(200).json(customerAddress);
};

export const update = async (
  req: Request,
  res: Response
): Promise<Response> => {
  if (req.user.profile !== "admin") {
    throw new AppError("ERR_NO_PERMISSION", 403);
  }
  const { companyId } = req.user;
  const { customerAddressId } = req.params;
  const customerAddressData = req.body;

  const customerAddress = await UpdateCustomerAddressService({
    customerAddressData,
    id: customerAddressId,
    companyId
  });

  const io = getIO();
  io.of(String(companyId)).emit(`company-${companyId}-customerAddress`, {
    action: "update",
    customerAddress
  });

  return res.status(200).json(customerAddress);
};

export const remove = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { customerAddressId } = req.params;
  const { companyId } = req.user;
  await DeleteCustomerAddressService(customerAddressId);

  const io = getIO();
  io.of(String(companyId)).emit(`company-${companyId}-portifolios`, {
    action: "delete",
    customerAddressId: +customerAddressId
  });

  return res.status(200).json({ message: "Address customer deleted" });
};

export const list = async (req: Request, res: Response): Promise<Response> => {
  const { searchParam } = req.query as IndexQuery;
  const { customerId } = req.params;
  const { companyId } = req.user;

  const customerAddress = await SimpleListCustomerAddressService({
    companyId,
    customerId,
    searchParam
  });

  return res.json(customerAddress);
};
