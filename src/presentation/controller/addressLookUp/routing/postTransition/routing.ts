import { PageRouting, PagesRouting } from "../../../PageRouting";
import PageType from "../../../PageType";

import generalPartnerPostTransitionAddressRouting from "./generalPartner";
import limitedPartnerPostTransitionAddressRouting from "./limitedPartner";

export enum AddressCacheKeys {
  addressCacheKey = "addressCacheKey",
  territoryCacheKey = "territoryCacheKey"
}

const postTransitionAddressRouting: PagesRouting = new Map<PageType, PageRouting>();

[...generalPartnerPostTransitionAddressRouting, ...limitedPartnerPostTransitionAddressRouting].forEach((routing) => {
  postTransitionAddressRouting.set(routing.pageType, routing);
});

export default postTransitionAddressRouting;
