import { SERVICE_NAME_KEY_TRANSITION, TRANSITION_WITH_IDS_URL } from "../../../../../config/index";

import {
  ADD_LIMITED_PARTNER_LEGAL_ENTITY_URL,
  ADD_LIMITED_PARTNER_LEGAL_ENTITY_WITH_ID_URL
} from "../../../../controller/transition/url";

import {
  CONFIRM_LIMITED_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL,
  TERRITORY_CHOICE_LIMITED_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL
} from "../../../../controller/addressLookUp/url/transition";

import TransitionPageType from "../../../../controller/transition/PageType";
import TransitionRouting from "../../../../controller/transition/Routing";

import { runAddLimitedPartnerLegalEntityTests } from "../../shared/limitedPartner/addLimitedPartnerLegalEntity";

it("should run add limited partner legal entity tests for transition journey", () => {
  expect(ADD_LIMITED_PARTNER_LEGAL_ENTITY_URL).toContain("transition");
});

runAddLimitedPartnerLegalEntityTests({
  url: ADD_LIMITED_PARTNER_LEGAL_ENTITY_URL,
  urlWithIds: ADD_LIMITED_PARTNER_LEGAL_ENTITY_WITH_ID_URL,
  pageType: {
    addLimitedPartnerLegalEntity: TransitionPageType.addLimitedPartnerLegalEntity,
    reviewLimitedPartners: TransitionPageType.reviewLimitedPartners,
    limitedPartnerType: TransitionPageType.limitedPartnerType
  },
  pageRouting: TransitionRouting,
  redirectUrl: TERRITORY_CHOICE_LIMITED_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL,
  confirmRedirectUrl: CONFIRM_LIMITED_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL,
  baseUrlWithIds: TRANSITION_WITH_IDS_URL,
  translateExclude: [
    "errorMessages",
    "generalPartner",
    "dateEffectiveFrom",
    "dateHint",
    "dateDay",
    "dateMonth",
    "dateYear",
    "updateTitle"
  ],
  serviceTitleTranslationKey: SERVICE_NAME_KEY_TRANSITION
});
