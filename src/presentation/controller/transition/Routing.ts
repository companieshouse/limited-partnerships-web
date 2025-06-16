import { PageRouting, PagesRouting } from "../PageRouting";
import PageType from "../PageType";

import limitedPartnershipRouting from "./routing/limitedPartnership";

export const transitionRouting: PagesRouting = new Map<PageType, PageRouting>();

[...limitedPartnershipRouting].forEach((routing) => {
  transitionRouting.set(routing.pageType, routing);
});

export default transitionRouting;
