import { PageRouting, PagesRouting } from "../PageRouting";
import PageType from "../PageType";

import limitedPartnershipRouting from "./routing/limitedPartnership";
import generalPartnerRouting from "./routing/generalPartner";
import limitedPartnerRouting from "./routing/limitedPartner";
import personWithSignificantControlRouting from "./routing/personWithSignificantControl";

const registrationsRouting: PagesRouting = new Map<PageType, PageRouting>();

[...limitedPartnershipRouting, ...generalPartnerRouting, ...limitedPartnerRouting, ...personWithSignificantControlRouting].forEach((routing) => {
  registrationsRouting.set(routing.pageType, routing);
});

export default registrationsRouting;
