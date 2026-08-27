import {
  LIMITED_PARTNER_CHOICE_URL,
  ADD_LIMITED_PARTNER_PERSON_URL,
  ADD_LIMITED_PARTNER_LEGAL_ENTITY_URL
} from "../../../../controller/transition/url";

import TransitionPageType from "../../../../controller/transition/PageType";

import { SERVICE_NAME_KEY_TRANSITION } from "../../../../../config/constants";

import { runLimitedPartnerChoiceTests } from "../../shared/limitedPartner/limitedPartnerChoice";

it("should run limited partner choice tests for transition journey", () => {
  expect(ADD_LIMITED_PARTNER_PERSON_URL).toContain("transition");
});

runLimitedPartnerChoiceTests({
  url: LIMITED_PARTNER_CHOICE_URL,
  pageType: TransitionPageType.limitedPartnerType,
  redirectUrlPerson: ADD_LIMITED_PARTNER_PERSON_URL,
  redirectUrlLegalEntity: ADD_LIMITED_PARTNER_LEGAL_ENTITY_URL,
  translateExclude: [],
  serviceTitleTranslationKey: SERVICE_NAME_KEY_TRANSITION
});
