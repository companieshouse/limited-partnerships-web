import { PageRouting, PagesRouting } from "../PageRouting";
import PageType from "../PageType";

import limitedPartnershipRouting from "./routing/limitedPartnership";
import generalPartnerRouting from "./routing/generalPartner";
import limitedPartnerRouting from "./routing/limitedPartner";

const list = [...limitedPartnershipRouting, ...generalPartnerRouting, ...limitedPartnerRouting];

export const registrationsRouting: PagesRouting = new Map<PageType, PageRouting>();

list.forEach((routing) => {
  registrationsRouting.set(routing.pageType, routing);
});

export default registrationsRouting;
