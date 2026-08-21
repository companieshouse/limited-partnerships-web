import {
  ADD_GENERAL_PARTNER_LEGAL_ENTITY_URL,
  ADD_GENERAL_PARTNER_PERSON_URL,
  GENERAL_PARTNER_CHOICE_URL
} from "../../../../controller/postTransition/url";

import PostTransitionPageType from "../../../../controller/postTransition/pageType";

import { runGeneralPartnerChoiceTests } from "../../shared/generalPartnerChoice";

it("should run general partner choice tests for post-transition journey", () => {
  expect(ADD_GENERAL_PARTNER_PERSON_URL).toContain("update");
});

runGeneralPartnerChoiceTests({
  url: GENERAL_PARTNER_CHOICE_URL,
  pageType: PostTransitionPageType.generalPartnerType,
  redirectUrlPerson: ADD_GENERAL_PARTNER_PERSON_URL,
  redirectUrlLegalEntity: ADD_GENERAL_PARTNER_LEGAL_ENTITY_URL,
  translateExclude: ["hint"],
  serviceTitleTranslationKey: { serviceName: "addGeneralPartner" }
});
