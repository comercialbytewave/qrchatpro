// src/services/BudGetServices/CreateBudGetService.ts
import * as Yup from "yup";
import AppError from "../../errors/AppError";
import StatusBudGets from "../../models/StatusBudGets";
import Customer from "../../models/Customer";
import CustomerAddress from "../../models/CustomerAddress";
import BudGets from "../../models/BudGet";
import BudGetItens from "../../models/BudGetItem";
import BudGetNegociations from "../../models/BudGetNegociation";
import BudGetAdressRouters from "../../models/BudGetAdressRouter";
import { da } from "date-fns/locale";

export interface IBudGetFinance {
  method: {
    id: number;
    code: string;
    name: string;
    typePaymentId: number;
    companyId: number;
    typePayment: {
      id: number;
      code: string;
      change: boolean;
      installments: boolean;
    }
  };
  value: number;
  change: number;
  installments: number;
}
export interface IBudGetItens {
  name: string;
  price: number;
  amount: number;
  total: number;
  productId: number;
  mediaPath: string;
  mediaName: string;
  budGetId?: number;
}
export interface IBudGet {
  storeId: number;
  storeName: string;
  customerId: number;
  customerName: string;
  customerPhone: string;
  customerEmail: string;  
  sellerId: number;
  ticketId: number;
  itens: IBudGetItens[];
  typeDelivery: string;
  number?: string;
  addressId: number;
  coupon: string;
  total: number;
  payments: IBudGetFinance[];
  observation: string;  
}

interface Request {
  data: IBudGet;
  companyId: number;
}

const CreateBudGetService = async ({
  data,
  companyId
}: Request): Promise<BudGets> => {
  const schema = Yup.object().shape({
    storeId: Yup.number().required(),
    customerId: Yup.number().required(),
    type: Yup.number().required(),
    route: Yup.string().required(),
    channel: Yup.string().required(),
    statusBudGetId: Yup.number().required(),
    total: Yup.number().required(),
    userId: Yup.number().required(),
    companyId: Yup.number().required()
  });

  const now = new Date();
  const protocol = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(
    2,
    "0"
  )}${String(now.getDate()).padStart(2, "0")}${String(now.getHours()).padStart(
    2,
    "0"
  )}${String(now.getMinutes()).padStart(2, "0")}${String(
    now.getSeconds()
  ).padStart(2, "0")}`;

  const status = await StatusBudGets.findOne({ where: { code: "1" } });
  if (!status) throw new AppError("Status não encontrado.");

  const customer = await Customer.findByPk(data.customerId);
  if (!customer) throw new AppError("ERR_NO_CUSTOMER_FOUND", 404);

  const customerAddress = await CustomerAddress.findOne({
    where: { customerId: customer.id, id: data.addressId, isActive: true }
  });

  if (data.typeDelivery !== "retirada" && !customerAddress) {
    throw new AppError("Cliente sem endereço cadastrado.");
  }

  const budgetCreate = {
    storeId: data.storeId,
    customerId: data.customerId,
    emissionDate: now,
    number: protocol,
    type: 1,
    route: data.typeDelivery === "retirada" ? "retirada" : "entrega",
    channel: "online",
    ticketId: data.ticketId || null,
    statusBudGetId: status.id,
    userId: Number(data.sellerId),
    observation: data.coupon || "",
    subTotal: data.itens.reduce((acc, item) => acc + item.total, 0),
    freigh: 0,
    discount: 0,
    increase: 0,
    total: data.total,
    companyId
  };

  // delete budgetCreate.BudGetItens;

  try {
    await schema.validate({ ...budgetCreate, companyId });
  } catch (err: any) {
    throw new AppError(err.message);
  }

  try {
    const budGet = await BudGets.create(budgetCreate, {
      include: [BudGetItens]
    });

    /**
     * Salva Itens
     */
    try {

      await Promise.all(
        data.itens.map(async item => {
          await BudGetItens.create({
            productId: item.productId,
            isActive: true,
            amount: item.amount,
            unitary: item.price,
            discount: 0,
            // increase: 0,
            total: item.total,
            canceled: null,
            companyId,
            budGetId: budGet.id
          });
        })
      );

    } catch (error) {
      budGet.destroy();
      throw new AppError(error.message);
    }

    /**
     * Salva Pagamentos
     */
    try {

      await Promise.all(
        data.payments.map(async payment => {
          if (payment.installments > 1) {
            const installments = payment.value / payment.installments;
            for (let index = 0; index < payment.installments; index++) {
              await BudGetNegociations.create({
                status: "pending",
                paymentId: payment.method.id,
                emissionDate: new Date(),
                value: installments,
                installments:  payment.installments,
                number: `${index + 1}/${payment.installments}`,
                dueDate: new Date(new Date().setMonth(new Date().getMonth() + index + 1)),
                days: (index + 1) * 30,
                change: 0,
                paidDate: null,
                companyId,
                budGetId: budGet.id
              });
            }
          } else {
            await BudGetNegociations.create({
              paymentId: payment.method.id,
              status: "paid",
              value: payment.value,
              emissionDate: new Date(),
              installments: payment.installments,
              number: `1/1`,
              dueDate: new Date(),
              change: payment.change,
              paidDate: null,
              days: 0,
              companyId,
              budGetId: budGet.id
            });
          }
        })
      );

    } catch (error) {
      budGet.destroy();
      throw new AppError(error.message);
    }
    /**
     * Salva Endereço
     */

    try {

      if(customerAddress) {

        await BudGetAdressRouters.create({
          zipCode: customerAddress.zipCode,
          address: customerAddress.address,
          number: customerAddress.number,
          complement: customerAddress.complement,
          neighborhood: customerAddress.neighborhood,
          city: customerAddress.city,
          state: customerAddress.state,
          budGetId: budGet.id,
          companyId
        });
        
      }
    } catch (error) {
      budGet.destroy();
      throw new AppError(error.message);
    }

    await budGet.reload({
      include: [
        { model: BudGetItens, as: "BudGetItens" },
        { model: BudGetNegociations, as: "BudGetNegotiations" },
        { model: BudGetAdressRouters, as: "BudGetAdressRouters" }
      ]
    });

    return budGet;
  } catch (error) {
    throw new AppError(error.message);
  }
};

export default CreateBudGetService;
