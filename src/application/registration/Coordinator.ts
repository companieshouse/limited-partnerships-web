import { LimitedPartnership } from "@companieshouse/api-sdk-node/dist/services/limited-partnerships";

import {
  PageRouting,
  pageRoutingDefault,
} from "../../domain/entities/PageRouting";
import PageRegistrationType from "./PageRegistrationType";
import registrationsRouting from "./Routing";
import registrationCoordinatorElementList from "./coordination";

export type RegistrationCoordinatorElement = {
  pageRegistrationType: PageRegistrationType;
  callback: any;
};

class RegistrationCoordinator {
  private list: RegistrationCoordinatorElement[] =
    registrationCoordinatorElementList;
  private callbackMap = new Map<PageRegistrationType, any>();

  constructor() {
    this.init();
  }

  public execute(
    registrationType: PageRegistrationType,
    limitedPartnerShip: LimitedPartnership
  ): PageRouting {
    const callback = this.callbackMap.get(registrationType);

    if (!callback) {
      return registrationsRouting.get(registrationType) ?? pageRoutingDefault;
    }

    return callback(limitedPartnerShip);
  }

  private init() {
    this.list.forEach((item) => {
      const { pageRegistrationType, callback } = item;
      this.addCoordination(pageRegistrationType, callback);
    });
  }

  private addCoordination(
    pageRegistrationType: PageRegistrationType,
    callback: (limitedPartnerShip: LimitedPartnership) => PageRouting
  ) {
    this.callbackMap.set(pageRegistrationType, callback);
  }
}

export default RegistrationCoordinator;
