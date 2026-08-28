import { customerFeedbackUrlMap } from "../../../../../middlewares/customer-feedback.middleware";
import PostTransitionPageType from "../../../../controller/postTransition/pageType";
import { LIMITED_PARTNER_CHOICE_URL, LIMITED_PARTNER_CONTINUE_SAVED_FILING_URL } from "../../../../controller/postTransition/url";
import { runContinueSavedFilingTests } from "../../shared/continueSavedFilingTestSuite";

it("should run continue saved filing tests for post-transition journey", () => {
  expect(LIMITED_PARTNER_CONTINUE_SAVED_FILING_URL).toContain("update");
});

runContinueSavedFilingTests({
  continueUrl: LIMITED_PARTNER_CONTINUE_SAVED_FILING_URL,
  pageType: PostTransitionPageType.limitedPartnerContinueSavedFiling,
  serviceTitleTranslationKey: { serviceName: "addLimitedPartner" },
  noRedirectUrl: LIMITED_PARTNER_CHOICE_URL,
  customerFeedbackUrl: customerFeedbackUrlMap.addLimitedPartner
});
