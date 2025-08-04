import { PageRouting, PagesRouting } from "../../../PageRouting";
import PageType from "../../../PageType";
import generalPartnerTransitionRouting from "./generalPartner";

export enum AddressCacheKeys {
  addressCacheKey = "addressCacheKey",
  territoryCacheKey = "territoryCacheKey"
}

const transitionAddresssRouting: PagesRouting = new Map<PageType, PageRouting>();

[...generalPartnerTransitionRouting].forEach((routing) => {
  transitionAddresssRouting.set(routing.pageType, routing);
});

export default transitionAddresssRouting;
