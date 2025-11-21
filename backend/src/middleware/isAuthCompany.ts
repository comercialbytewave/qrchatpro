import { Request, Response, NextFunction } from "express";

import AppError from "../errors/AppError";
import Company from "../models/Company";
import Plan from "../models/Plan";

const isAuthCompany = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    throw new AppError("ERR_SESSION_EXPIRED", 401);
  }
  
  try {

    const [, token] = authHeader.split(" ");
   
    const companies = await Company.findOne({
      where: { token},
      attributes: [
        "id",
        "name",
        "email",
        "status",
        "dueDate",
        "createdAt",
        "phone",
        "document",
        "lastLogin",
        "slug",
        "token"
      ],
      order: [["name", "ASC"]],
      include: [
        {
          model: Plan,
          as: "plan",
          attributes: [
            "id",
            "name",
            "users",
            "connections",
            "queues",
            "amount",
            "useWhatsapp",
            "useFacebook",
            "useInstagram",
            "useCampaigns",
            "useSchedules",
            "useInternalChat",
            "useExternalApi",
            "useKanban",
            "useOpenAi",
            "useIntegrations"
          ]
        }
      ]
    });
    
    if(companies === null) {
      throw new AppError("ERR_SESSION_EXPIRED", 401);
    }
    const getToken = companies.token;
    
    if (!getToken) {
      throw new AppError("ERR_SESSION_EXPIRED", 401);
    }

    if (getToken !== token) {
      throw new AppError("ERR_SESSION_EXPIRED", 401);
    }

    req.user = {
      id: "",
      profile: "",
      companyId: companies.id
    };
  
  } catch (err) {
    throw new AppError(
      "Invalid token. We'll try to assign a new one on next request",
      403
    );
  }

  
  return next();
};

export default isAuthCompany;
