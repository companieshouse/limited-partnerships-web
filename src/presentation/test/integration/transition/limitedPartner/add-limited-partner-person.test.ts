import { SERVICE_NAME_KEY_TRANSITION, TRANSITION_WITH_IDS_URL } from "../../../../../config/index";

import { ADD_LIMITED_PARTNER_PERSON_URL, ADD_LIMITED_PARTNER_PERSON_WITH_ID_URL } from "../../../../controller/transition/url";

import {
  CONFIRM_LIMITED_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL,
  TERRITORY_CHOICE_LIMITED_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL
} from "../../../../controller/addressLookUp/url/transition";

import TransitionPageType from "../../../../controller/transition/PageType";
import TransitionRouting from "../../../../controller/transition/Routing";

import { runAddLimitedPartnerPersonTests } from "../../shared/limitedPartner/addLimitedPartnerPerson";

it("should run add limited partner person tests for transition journey", () => {
  expect(ADD_LIMITED_PARTNER_PERSON_URL).toContain("transition");
});

runAddLimitedPartnerPersonTests({
  url: ADD_LIMITED_PARTNER_PERSON_URL,
  urlWithIds: ADD_LIMITED_PARTNER_PERSON_WITH_ID_URL,
  pageType: {
    addLimitedPartnerPerson: TransitionPageType.addLimitedPartnerPerson,
    reviewLimitedPartners: TransitionPageType.reviewLimitedPartners,
    limitedPartnerType: TransitionPageType.limitedPartnerType
  },
  pageRouting: TransitionRouting,
  redirectUrl: TERRITORY_CHOICE_LIMITED_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL,
  confirmRedirectUrl: CONFIRM_LIMITED_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL,
  baseUrlWithIds: TRANSITION_WITH_IDS_URL,
  translateExclude: ["errorMessages", "generalPartner", "dateEffectiveFrom", "dateHint", "dateDay", "dateMonth", "dateYear"],
  serviceTitleTranslationKey: SERVICE_NAME_KEY_TRANSITION
});
