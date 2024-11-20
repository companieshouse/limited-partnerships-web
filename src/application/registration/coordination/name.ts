import {
  LimitedPartnership,
  NameEndingType,
} from "@companieshouse/api-sdk-node/dist/services/limited-partnerships";

import registrationsRouting, { NEXT2_URL } from "../Routing";
import PageRegistrationType from "../PageRegistrationType";
import { PageRouting } from "../../../domain/entities/PageRouting";
import { RegistrationCoordinatorElement } from "../Coordinator";

// Only for demo - to be removed
const callback = (limitedPartnerShip: LimitedPartnership): PageRouting => {
  const nameRouting = registrationsRouting.get(
    PageRegistrationType.name
  ) as PageRouting;

  if (
    limitedPartnerShip.data?.name_ending === NameEndingType.LIMITED_PARTNERSHIP
  ) {
    return nameRouting;
  }

  return { ...nameRouting, nextUrl: NEXT2_URL };
};

export const nameEnding: RegistrationCoordinatorElement = {
  pageRegistrationType: PageRegistrationType.name,
  callback,
};
