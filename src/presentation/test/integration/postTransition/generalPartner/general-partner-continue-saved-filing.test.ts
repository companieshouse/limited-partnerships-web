import { customerFeedbackUrlMap } from "../../../../../middlewares/customer-feedback.middleware";
import PostTransitionPageType from "../../../../controller/postTransition/pageType";
import { GENERAL_PARTNER_CHOICE_URL, GENERAL_PARTNER_CONTINUE_SAVED_FILING_URL } from "../../../../controller/postTransition/url";
import { runContinueSavedFilingTests } from "../../shared/continueSavedFilingTestSuite";

it("should run continue saved filing tests for post-transition journey", () => {
  expect(GENERAL_PARTNER_CONTINUE_SAVED_FILING_URL).toContain("update");
});

runContinueSavedFilingTests({
  continueUrl: GENERAL_PARTNER_CONTINUE_SAVED_FILING_URL,
  pageType: PostTransitionPageType.generalPartnerContinueSavedFiling,
  serviceTitleTranslationKey: { serviceName: "addGeneralPartner" },
  noRedirectUrl: GENERAL_PARTNER_CHOICE_URL,
  customerFeedbackUrl: customerFeedbackUrlMap.addGeneralPartner
});
