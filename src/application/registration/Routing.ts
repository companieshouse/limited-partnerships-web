import {
  TransactionRouting,
  TransactionsRouting,
} from "../../domain/entities/TransactionRouting";
import {
  BASE_URL,
  START_URL,
  SUBMISSION_ID,
  TRANSACTION_ID,
} from "../../config/constants";
import TransactionRegistrationType from "./TransactionRegistrationType";

export const NAME_TEMPLATE = "name";
export const NEXT_TEMPLATE = "next";

export const NAME_URL = `${BASE_URL}/transaction/${TRANSACTION_ID}/${NAME_TEMPLATE}`;

export const NEXT_URL = `${BASE_URL}/transaction/${TRANSACTION_ID}/submission/${SUBMISSION_ID}/${NEXT_TEMPLATE}`;

export const registrationRoutingStart = {
  previousUrl: "/",
  currentUrl: START_URL,
  nextUrl: NAME_URL,
};

export const registrationRoutingName = {
  previousUrl: START_URL,
  currentUrl: NAME_URL,
  nextUrl: NEXT_URL,
};

export const registrationRoutingNext = {
  previousUrl: NAME_URL,
  currentUrl: NEXT_URL,
  nextUrl: "/",
};

export const registrationsRouting: TransactionsRouting = new Map<
  TransactionRegistrationType,
  TransactionRouting
>();

registrationsRouting.set(
  TransactionRegistrationType.START,
  registrationRoutingStart
);
registrationsRouting.set(
  TransactionRegistrationType.NAME,
  registrationRoutingName
);
registrationsRouting.set(
  TransactionRegistrationType.NEXT,
  registrationRoutingNext
);

export default registrationsRouting;
