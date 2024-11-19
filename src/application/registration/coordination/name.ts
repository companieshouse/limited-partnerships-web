import {
  LimitedPartnership,
  NameEndingType,
} from "@companieshouse/api-sdk-node/dist/services/limited-partnerships";

import registrationsRouting, { NEXT2_URL } from "../Routing";
import TransactionRegistrationType from "../TransactionRegistrationType";
import { TransactionRouting } from "../../../domain/entities/TransactionRouting";
import { RegistrationCoordinatorElement } from "../Coordinator";

// Only for demo - to be removed
const callback = (
  limitedPartnerShip: LimitedPartnership
): TransactionRouting => {
  const nameRouting = registrationsRouting.get(
    TransactionRegistrationType.name
  ) as TransactionRouting;

  if (
    limitedPartnerShip.data?.name_ending === NameEndingType.LIMITED_PARTNERSHIP
  ) {
    return nameRouting;
  }

  return { ...nameRouting, nextUrl: NEXT2_URL };
};

export const nameEnding: RegistrationCoordinatorElement = {
  transactionRegistrationType: TransactionRegistrationType.name,
  callback,
};
