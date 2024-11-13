import CustomError from "./CustomError";
import TransactionRegistrationType from "../../application/registration/TransactionRegistrationType";

export type TransactionRouting = {
  previousUrl: string;
  currentUrl: string;
  nextUrl: string;
  data?: Record<string, any>;
  errors?: CustomError[];
};

export type TransactionsRouting = Map<
  TransactionRegistrationType,
  TransactionRouting
>;

export const transactionRoutingDefault = {
  previousUrl: "/",
  currentUrl: "/start",
  nextUrl: "/name",
};
