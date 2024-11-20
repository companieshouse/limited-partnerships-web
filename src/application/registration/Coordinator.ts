import { LimitedPartnership } from "@companieshouse/api-sdk-node/dist/services/limited-partnerships";

import {
  TransactionRouting,
  transactionRoutingDefault,
} from "../../domain/entities/TransactionRouting";
import TransactionRegistrationType from "./TransactionRegistrationType";
import registrationsRouting from "./Routing";
import registrationCoordinatorElementList from "./coordination";

export type RegistrationCoordinatorElement = {
  transactionRegistrationType: TransactionRegistrationType;
  callback: any;
};

class RegistrationCoordinator {
  private list: RegistrationCoordinatorElement[] =
    registrationCoordinatorElementList;
  private transactionMap = new Map<TransactionRegistrationType, any>();

  constructor() {
    this.init();
  }

  public execute(
    registrationType: TransactionRegistrationType,
    limitedPartnerShip: LimitedPartnership
  ): TransactionRouting {
    const callback = this.transactionMap.get(registrationType);

    if (!callback) {
      return (
        registrationsRouting.get(registrationType) ?? transactionRoutingDefault
      );
    }

    return callback(limitedPartnerShip);
  }

  private init() {
    this.list.forEach((item) => {
      const { transactionRegistrationType, callback } = item;
      this.addCoordination(transactionRegistrationType, callback);
    });
  }

  private addCoordination(
    transactionRegistrationType: TransactionRegistrationType,
    callback: (limitedPartnerShip: LimitedPartnership) => TransactionRouting
  ) {
    this.transactionMap.set(transactionRegistrationType, callback);
  }
}

export default RegistrationCoordinator;
