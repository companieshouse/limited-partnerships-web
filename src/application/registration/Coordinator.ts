import {
  LimitedPartnership,
  NameEndingType,
} from "@companieshouse/api-sdk-node/dist/services/limited-partnerships";

import {
  TransactionRouting,
  transactionRoutingDefault,
} from "../../domain/entities/TransactionRouting";
import TransactionRegistrationType from "./TransactionRegistrationType";
import registrationsRouting, { NEXT2_URL } from "./Routing";

class RegistrationCoordinator {
  private transactionMap = new Map<TransactionRegistrationType, any>();

  constructor() {
    // Only for demo - to be removed
    this.transactionMap.set(TransactionRegistrationType.NAME, this.nameEnding);
  }

  public execute(
    registrationType: TransactionRegistrationType,
    limitedPartnerShip: LimitedPartnership
  ): TransactionRouting {
    const coordination = this.transactionMap.get(registrationType);

    if (!coordination) {
      return (
        registrationsRouting.get(registrationType) ?? transactionRoutingDefault
      );
    }

    return coordination(limitedPartnerShip);
  }

  // Only for demo - to be removed
  private nameEnding(
    limitedPartnerShip: LimitedPartnership
  ): TransactionRouting {
    const nameRouting = registrationsRouting.get(
      TransactionRegistrationType.NAME
    ) as TransactionRouting;

    if (
      limitedPartnerShip.data?.name_ending ===
      NameEndingType.LIMITED_PARTNERSHIP
    ) {
      return nameRouting;
    }

    return { ...nameRouting, nextUrl: NEXT2_URL };
  }
}

export default RegistrationCoordinator;
