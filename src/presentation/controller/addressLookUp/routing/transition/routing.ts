import { PageRouting, PagesRouting } from "../../../PageRouting";
import PageType from "../../../PageType";
import limitedPartnershipTransitionRouting from "./limitedPartnership";
import generalPartnerTransitionRouting from "./generalPartner";
import limitedPartnerTransitionRouting from "./limitedPartner";

export enum AddressCacheKeys {
  addressCacheKey = "addressCacheKey",
  territoryCacheKey = "territoryCacheKey"
}

const transitionAddressRouting: PagesRouting = new Map<PageType, PageRouting>();

[
  ...limitedPartnershipTransitionRouting,
  ...generalPartnerTransitionRouting,
  ...limitedPartnerTransitionRouting
].forEach((routing) => {
  transitionAddressRouting.set(routing.pageType, routing);
});

export default transitionAddressRouting;
