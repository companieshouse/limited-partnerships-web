import { PageRouting, PagesRouting } from "../PageRouting";
import PageType from "../PageType";

import limitedPartnershipRouting from "./routing/limitedPartnership";

export const postTransitionRouting: PagesRouting = new Map<PageType, PageRouting>();

[...limitedPartnershipRouting].forEach((routing) => {
  postTransitionRouting.set(routing.pageType, routing);
});

export default postTransitionRouting;
