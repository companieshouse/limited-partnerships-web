import {
  ADD_LIMITED_PARTNER_LEGAL_ENTITY_URL,
  ADD_LIMITED_PARTNER_PERSON_URL,
  LIMITED_PARTNER_CHOICE_URL
} from "../../../../controller/postTransition/url";

import PostTransitionPageType from "../../../../controller/postTransition/pageType";

import { runLimitedPartnerChoiceTests } from "../../shared/limitedPartner/limitedPartnerChoice";

it("should run limited partner choice tests for post-transition journey", () => {
  expect(ADD_LIMITED_PARTNER_PERSON_URL).toContain("update");
});

runLimitedPartnerChoiceTests({
  url: LIMITED_PARTNER_CHOICE_URL,
  pageType: PostTransitionPageType.limitedPartnerType,
  redirectUrlPerson: ADD_LIMITED_PARTNER_PERSON_URL,
  redirectUrlLegalEntity: ADD_LIMITED_PARTNER_LEGAL_ENTITY_URL,
  translateExclude: ["isPersonOrLegalEntityHint"],
  serviceTitleTranslationKey: { serviceName: "addLimitedPartner" }
});
