import { PageRouting, PagesRouting } from "../../../PageRouting";
import PageType from "../../../PageType";

import generalPartnerPostTransitionRouting from "./generalPartner";
import limitedPartnerPostTransitionRouting from "./limitedPartner";

export enum AddressCacheKeys {
  addressCacheKey = "addressCacheKey",
  territoryCacheKey = "territoryCacheKey"
}

const postTransitionAddresssRouting: PagesRouting = new Map<PageType, PageRouting>();

[...generalPartnerPostTransitionRouting, ...limitedPartnerPostTransitionRouting].forEach((routing) => {
  postTransitionAddresssRouting.set(routing.pageType, routing);
});

export default postTransitionAddresssRouting;
