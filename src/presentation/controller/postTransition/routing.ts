import { PageRouting, PagesRouting } from "../PageRouting";
import PageType from "../PageType";

import limitedPartnershipRouting from "./routing/limitedPartnership";
import generalPartnerRouting from "./routing/generalPartner";

export const postTransitionRouting: PagesRouting = new Map<PageType, PageRouting>();

[...limitedPartnershipRouting, ...generalPartnerRouting].forEach((routing) => {
  postTransitionRouting.set(routing.pageType, routing);
});

export default postTransitionRouting;
