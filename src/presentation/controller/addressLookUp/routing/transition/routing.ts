import { PageRouting, PagesRouting } from "../../../PageRouting";
import PageType from "../../../PageType";
import limitedPartnershipTransitionRouting from "./limitedPartnership";

export enum AddressCacheKeys {
  addressCacheKey = "addressCacheKey",
  territoryCacheKey = "territoryCacheKey"
}

const addresssRouting: PagesRouting = new Map<PageType, PageRouting>();

[...limitedPartnershipTransitionRouting].forEach((routing) => {
  addresssRouting.set(routing.pageType, routing);
});

export default addresssRouting;
