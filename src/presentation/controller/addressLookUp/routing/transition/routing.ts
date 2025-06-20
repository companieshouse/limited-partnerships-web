import { PageRouting, PagesRouting } from "../../../PageRouting";
import PageType from "../../../PageType";
import limitedPartnershipTransitionRouting from "./limitedPartnership";
import generalPartnerTransitionRouting from "./generalPartner";

export enum AddressCacheKeys {
  addressCacheKey = "addressCacheKey",
  territoryCacheKey = "territoryCacheKey"
}

const transitionAddresssRouting: PagesRouting = new Map<PageType, PageRouting>();

[
  ...limitedPartnershipTransitionRouting,
  ...generalPartnerTransitionRouting
].forEach((routing) => {
  transitionAddresssRouting.set(routing.pageType, routing);
});

export default transitionAddresssRouting;
