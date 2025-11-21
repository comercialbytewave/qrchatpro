export type PaginatedOrders = {
  first: number;
  prev: number | null;
  next: number | null;
  last: number;
  pages: number;
  items: number;
  data: OrderData[];
};

export type OrderData = {
  id: number;
  number: string;
  typeRoute: 'ENTREGA' | 'RETIRADA' | string;
  channel: 'WHATSAPP' | 'ECOMMERCE' | string;
  emission: string; // ISO date string
  subTotal: string;
  freight: string;
  discount: string;
  increase: string;
  total: string;
  status: {
    id: number;
    name: string;
    color: string;
  };
  store: {
    id: number;
    name: string;
    address:string;
    zipCode: string;
    number: string;
    complement: string;
    neighborhood:string;
    city: string;
    state: string;
  };
  company: {
    id: number;
    name: string;
  };
  orderItems: OrderItem[];
  address: Address;
  contact: Contact;
  payments: Payments;
};

export type OrderItem = {
  id: number;
  amount: string;
  unitary: string;
  unitaryGross: string;
  discount: string;
  total: string;
  status: string;
  emission: string; // ISO date string
  canceled: string | null;
  product: {
    id: number;
    name: string;
    ean: string;
    code: string;
  };
};

export type Address = {
  id: number;
  type: string;
  zipCode: string;
  address: string;
  number: string;
  complement: string;
  neighborhood: string;
  city: string;
  state: string;
};

export type Contact = {
  id: number;
  name: string;
  email: string;
  number: string;
  document: string;
  fullName: string;
};

export type Payments = {
  prepaid: number;
  pending: number;
  methods: PaymentMethod[];
};

export type PaymentMethod = {
  id: number;
  code: string;
  value: string;
  status: string;
  type: string;
  name: string;
  installments: string
};



export type OrderCreate = {
  typeRoute: 'ENTREGA' | 'RETIRADA' | string;
  channel: 'WHATSAPP' | 'SITE' | 'APP' | string;
  subTotal: number;
  freight: number;
  discount: number;
  increase: number;
  total: number;
  contactId: number;
  contactAddressId: number | null;
  paymentId: number;
  userId: number |null;
  storeId: number;
  payments: {
    prepaid: number;
    pending: number;
    methods: {
      id: number;
      value: number;
      changeFor: number;
      installments: number;
    }[];
  };
  orderItems: {
    productId: number;
    amount: number;
    unitary: number;
    unitaryGross: number;
    discount: number;
    total: number;
  }[];
};

