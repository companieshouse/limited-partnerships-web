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

export const NAME_TEMPLATE = TransactionRegistrationType.NAME.toLowerCase();
export const NEXT_TEMPLATE = TransactionRegistrationType.NEXT.toLowerCase();
// Only for demo - to be removed
export const NEXT2_TEMPLATE = `${TransactionRegistrationType.NEXT.toLowerCase()}-2`;

export const NAME_URL = `${BASE_URL}/transaction/${TRANSACTION_ID}/${NAME_TEMPLATE}`;

export const NEXT_URL = `${BASE_URL}/transaction/${TRANSACTION_ID}/submission/${SUBMISSION_ID}/${NEXT_TEMPLATE}`;
// Only for demo - to be removed
export const NEXT2_URL = `${BASE_URL}/transaction/${TRANSACTION_ID}/submission/${SUBMISSION_ID}/${NEXT2_TEMPLATE}`;

export const registrationRoutingStart = {
  previousUrl: "/",
  currentUrl: START_URL,
  nextUrl: NAME_URL,
  transactionType: TransactionRegistrationType.START,
};

export const registrationRoutingName = {
  previousUrl: START_URL,
  currentUrl: NAME_URL,
  nextUrl: NEXT_URL,
  transactionType: TransactionRegistrationType.NAME,
};

const registrationRoutingNext = {
  previousUrl: NAME_URL,
  currentUrl: NEXT_URL,
  nextUrl: "/",
  transactionType: TransactionRegistrationType.NEXT,
};

// Only for demo - to be removed
const registrationRoutingNext2 = {
  previousUrl: NAME_URL,
  currentUrl: NEXT2_URL,
  nextUrl: "/",
  transactionType:
    `${TransactionRegistrationType.NEXT}_2` as TransactionRegistrationType,
};

const list = [
  registrationRoutingStart,
  registrationRoutingName,
  registrationRoutingNext,
  registrationRoutingNext2,
];

export const registrationsRouting: TransactionsRouting = new Map<
  TransactionRegistrationType,
  TransactionRouting
>();

list.forEach((routing) => {
  registrationsRouting.set(routing.transactionType, routing);
});

export default registrationsRouting;
