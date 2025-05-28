import { PageRouting, PagesRouting } from "../PageRouting";
import PageType from "../PageType";

import limitedPartnershipRouting from "./routing/limitedPartnership";
import generalPartnerRouting from "./routing/generalPartner";
import limitedPartnerRouting from "./routing/limitedPartner";

export enum AddressCacheKeys {
  addressCacheKey = "addressCacheKey",
  territoryCacheKey = "territoryCacheKey"
}

export const addressLookUpRouting: PagesRouting = new Map<PageType, PageRouting>();
[...limitedPartnershipRouting, ...generalPartnerRouting, ...limitedPartnerRouting].forEach((routing) => {
  addressLookUpRouting.set(routing.pageType, routing);
});

export default addressLookUpRouting;
