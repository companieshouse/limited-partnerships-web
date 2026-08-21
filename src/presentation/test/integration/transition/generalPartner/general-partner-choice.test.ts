import {
  ADD_GENERAL_PARTNER_LEGAL_ENTITY_URL,
  ADD_GENERAL_PARTNER_PERSON_URL,
  GENERAL_PARTNER_CHOICE_URL
} from "../../../../controller/transition/url";

import TransitionPageType from "../../../../../presentation/controller/transition/PageType";

import { runGeneralPartnerChoiceTests } from "../../shared/generalPartnerChoice";

it("should run general partner choice tests for transition journey", () => {
  expect(ADD_GENERAL_PARTNER_PERSON_URL).toContain("transition");
});

runGeneralPartnerChoiceTests({
  url: GENERAL_PARTNER_CHOICE_URL,
  pageType: TransitionPageType.generalPartnerType,
  redirectUrlPerson: ADD_GENERAL_PARTNER_PERSON_URL,
  redirectUrlLegalEntity: ADD_GENERAL_PARTNER_LEGAL_ENTITY_URL,
  translateExclude: [],
  serviceTitleTranslationKey: "serviceTransition"
});
