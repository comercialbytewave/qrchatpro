export type PaymentDetail = {
    id: number;
    minimumValue: string;
    installments: number;
    paymentId: number;
    companyId: number;
    createdAt: string;
    updatedAt: string;
};

export type TypePayment = {
    id: number;
    code: string;
    change: boolean;
    installments: boolean;
    createdAt: string;
    updatedAt: string;
};

export type Payment = {
    id: number;
    code: string;
    name: string;
    typePaymentId: number;
    companyId: number;
    createdAt: string;
    updatedAt: string;
    typePayment: TypePayment;
    paymentDetails: PaymentDetail[];
};
