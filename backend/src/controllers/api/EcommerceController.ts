import { Request, Response } from "express";
import GetMessageRangeService from "../../services/MessageServices/GetMessageRangeService";
import LisByStoreService from "../../services/StoreServices/ListByStoreIdService";
import ShowBySlugCompanyService from "../../services/CompanyService/ShowBySlugCompanyService";
import { FilterProductListSchema } from "../../schemas/ProductSchema";
import ListOffersByStoreIdProductService from "../../services/ProductServices/ListOffersByStoreIdProductService";
import ListByCategoryIdAndStoreIdProductService from "../../services/ProductServices/ListByCategoryIdAndStoreIdProductService";
import AppError from "../../errors/AppError";
import { formatZodErrors } from "../../utils/format-zod-errors";
import ShowWithPriceProductService from "../../services/ProductServices/ShowWithPriceProductService";
import ListEcommerceService from "../../services/CategoryServices/ListEcommerceService";
import ShowByDocumentAndPhoneContactService from "../../services/ContactServices/ShowByDocumentAndPhoneContactService";
import ShowByIdCryptoContactService from "../../services/ContactServices/ShowByIdCryptoContactService";
import { ContactCreateSchema } from "../../schemas/ContactSchema";
import CreateContactEcommerceService from "../../services/ContactServices/CreateContactEcommerceService";

type IndexQuery = {
  companyId: number;
};

interface IContactCreate {
  name: string;
  number: string;
  email: string;
  document: string;
  companyId: number;
}

interface IFilterListByCategoryIdAndStoreId {
  companyId: number;
  storeId: number;
  categoryId?: number;
  searchParam?: string;
  pageNumber?: number;
  pageSize?: number;
}


export const listByCompanyId = async (
  req: Request,
  res: Response
): Promise<Response> => {
  //const { companyId } = req.body as IndexQuery;
  const { companyId } = req.user;

  const stores = await LisByStoreService(companyId);

  return res.json({ count: stores.length, stores });
};

export const showBySlug = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { slug } = req.params;

  const company = await ShowBySlugCompanyService(slug);

  return res.json({ count: 1, company });
};



export const listByCategoryIdAndStoreId = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const CATEGORY_OFFER = 0

  const { companyId } = req.user;

  const parseResult = FilterProductListSchema.safeParse(req.query);

  if (!parseResult.success) {
    const errorMessages = formatZodErrors(parseResult.error);
    throw new AppError(errorMessages.join("\n"), 400);
  }

  const filters = {
    ...parseResult.data,
    companyId
  } as IFilterListByCategoryIdAndStoreId;
  
  if(filters.categoryId == CATEGORY_OFFER){
    const result = await ListOffersByStoreIdProductService(filters);
    
    return res.json(result);
  }
  
  const result = await ListByCategoryIdAndStoreIdProductService(filters);
    
  return res.json(result);
};

export const showWithPrice = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { companyId } = req.user;
  const { productId, storeId } = req.params;
  
  const result = await ShowWithPriceProductService({productId: +productId, storeId: +storeId, companyId: +companyId});
    
  return res.json(result);
};

export const listEcommerce = async (req: Request, res: Response): Promise<Response> => {
  const { storeId } = req.query as any;
  const { companyId } = req.user;

  const categories = await ListEcommerceService({ storeId, companyId });

  return res.json(categories);
};


export const showByDocumentAndPhone = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { document, number } = req.params;
  const { companyId } = req.user;

  const contacts = await ShowByDocumentAndPhoneContactService({
    number,
    document,
    companyId
  });

  return res.json(contacts);
};

export const showByIdCrypto = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { id } = req.query;
  const { companyId } = req.user;

  const contacts = await ShowByIdCryptoContactService({
    id: id as any,
    companyId
  });

  return res.json(contacts);
};


export const storeEcommerce = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { companyId } = req.user;

  const parseResult = ContactCreateSchema.safeParse(req.body);

  if (!parseResult.success) {
    const errorMessages = formatZodErrors(parseResult.error);
    throw new AppError(errorMessages.join("\n"), 400);
  }

  const data = {
    ...parseResult.data,
    number: "55" + parseResult.data.number,
    companyId
  } as IContactCreate;

  const contact = await CreateContactEcommerceService(data);

  return res.status(200).json(contact);
};