import { PaymentIntentStatus } from "./payment_intent";

export interface PaymentMethod {
  id: string;
  acctLastFour: number;
  brand: string;
  name: string;
  token: string;
  metadata: any;
  createdAt: string;
  updatedAt: string;
  addressLine1Check: string;
  addressPostalCodeCheck: string;
}

export interface PaymentMethods {
  card: PaymentMethod;
  bankAccount: PaymentMethod;
  customerId: string;
  signature: string;
}

export interface CreateCard {
  name: string;
  number: string;
  verification: string;
  month: string;
  year: string;
  addressLine1: string;
  addressLine2: string;
  addressCity: string;
  addressState: string;
  addressPostalCode: string;
  addressCountry: string;
  brand: string;
  metadata: any;
}

export enum PaymentCaptureStrategy {
  Manual = "manual",
  Automatic = "automatic",
}

export interface ApplicationFee {
  id: string;
  amount: number;
  currency: string;
  createdAt: string;
  updatedAt: string;
}

export interface Payment {
  id: string;
  accountId: string;
  amount: number;
  amountDisputed: number;
  amountRefunded: number;
  amountRefundable: number;
  balance: number;
  feeAmount: number;
  captured: boolean;
  captureStrategy: PaymentCaptureStrategy;
  currency: string;
  description: string;
  disputed: boolean;
  disputes: any;
  errorCode: string;
  errorDescription: string;
  isTest: boolean;
  metadata: any;
  paymentIntentId: string;
  paymentMethod: PaymentMethods;
  applicationFee: ApplicationFee;
  refunded: boolean;
  status: PaymentIntentStatus;
  createdAt: string;
  updatedAt: string;
}
