import { LimitedPartnership } from "@companieshouse/api-sdk-node/dist/services/limited-partnerships";

import {
  TransactionRouting,
  transactionRoutingDefault,
} from "../../domain/entities/TransactionRouting";
import TransactionRegistrationType from "./TransactionRegistrationType";
import registrationsRouting from "./Routing";

class RegistrationCoordinator {
  private transactionMap = new Map<TransactionRegistrationType, any>();

  constructor() {}

  public execute(
    transactionRegistrationType: TransactionRegistrationType,
    limitedPartnerShip: LimitedPartnership
  ): TransactionRouting {
    const coordination = this.transactionMap.get(transactionRegistrationType);

    if (!coordination) {
      return (
        registrationsRouting.get(transactionRegistrationType) ??
        transactionRoutingDefault
      );
    }

    return coordination(limitedPartnerShip);
  }
}

export default RegistrationCoordinator;
