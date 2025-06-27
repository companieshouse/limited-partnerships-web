import { PageRouting, PagesRouting } from "../PageRouting";
import PageType from "../PageType";

import limitedPartnershipRouting from "./routing/limitedPartnership";
import generalPartnerRouting from "./routing/generalPartner";
import limitedPartnerRouting from "./routing/limitedPartner";

export const transitionRouting: PagesRouting = new Map<PageType, PageRouting>();

[...limitedPartnershipRouting, ...generalPartnerRouting, ...limitedPartnerRouting].forEach((routing) => {
  transitionRouting.set(routing.pageType, routing);
});

export default transitionRouting;
