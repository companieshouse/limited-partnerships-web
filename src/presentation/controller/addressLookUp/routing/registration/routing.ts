import { PageRouting, PagesRouting } from "../../../PageRouting";
import PageType from "../../../PageType";
import limitedPartnershipRegistrationRouting from "./limitedPartnership";
import generalPartnerRegistrationRouting from "./generalPartner";
import limitedPartnerRegistrationRouting from "./limitedPartner";

export enum AddressCacheKeys {
  addressCacheKey = "addressCacheKey",
  territoryCacheKey = "territoryCacheKey"
}

const registrationAddressRouting: PagesRouting = new Map<PageType, PageRouting>();

[
  ...limitedPartnershipRegistrationRouting,
  ...generalPartnerRegistrationRouting,
  ...limitedPartnerRegistrationRouting
].forEach((routing) => {
  registrationAddressRouting.set(routing.pageType, routing);
});

export default registrationAddressRouting;
