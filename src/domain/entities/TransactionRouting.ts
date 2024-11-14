import CustomError from "./CustomError";
import TransactionRegistrationType from "../../application/registration/TransactionRegistrationType";
import { START_URL } from "../../config/constants";
import { NAME_URL } from "../../application/registration/Routing";

export type TransactionRouting = {
  previousUrl: string;
  currentUrl: string;
  nextUrl: string;
  transactionType: TransactionRegistrationType;
  data?: Record<string, any>;
  errors?: CustomError[];
};

export type TransactionsRouting = Map<
  TransactionRegistrationType,
  TransactionRouting
>;

export const transactionRoutingDefault = {
  previousUrl: "/",
  currentUrl: START_URL,
  nextUrl: NAME_URL,
  transactionType: TransactionRegistrationType.START,
};
