import LimitedPartnershipService from "../../../application/service/LimitedPartnershipService";
import LimitedPartnerService from "../../../application/service/LimitedPartnerService";

import {
  ADD_LIMITED_PARTNER_LEGAL_ENTITY_URL,
  ADD_LIMITED_PARTNER_PERSON_URL,
  CHECK_YOUR_ANSWERS_URL,
  LIMITED_PARTNERS_URL,
  REVIEW_LIMITED_PARTNERS_URL
} from "./url";
import LimitedPartnerController from "../common/LimitedPartnerController";
import {
  CONFIRM_LIMITED_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL,
  CONFIRM_LIMITED_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL
} from "../addressLookUp/url/transition";

class LimitedPartnerTransitionController extends LimitedPartnerController {
  constructor(limitedPartnershipService: LimitedPartnershipService, limitedPartnerService: LimitedPartnerService) {
    super(limitedPartnershipService, limitedPartnerService);
  }

  getPageRouting() {
    return super.getPageRouting();
  }

  getLimitedPartner() {
    return super.getLimitedPartner({ reviewLimitedPartnersUrl: REVIEW_LIMITED_PARTNERS_URL });
  }

  limitedPartnerChoice() {
    return super.limitedPartnerChoice({
      addPersonUrl: ADD_LIMITED_PARTNER_PERSON_URL,
      addLegalEntityUrl: ADD_LIMITED_PARTNER_LEGAL_ENTITY_URL
    });
  }

  getReviewPage() {
    return super.getReviewPage({ limitedPartnersUrl: LIMITED_PARTNERS_URL });
  }

  createLimitedPartner() {
    return super.createLimitedPartner();
  }

  sendPageData() {
    return super.sendPageData({
      confirmLimitedPartnerUsualResidentialAddressUrl: CONFIRM_LIMITED_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL,
      confirmLimitedPartnerPrincipalOfficeAddressUrl: CONFIRM_LIMITED_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL
    });
  }

  postReviewPage() {
    return super.postReviewPage({
      addLimitedPartnerPersonUrl: ADD_LIMITED_PARTNER_PERSON_URL,
      addLimitedPartnerLegalEntityUrl: ADD_LIMITED_PARTNER_LEGAL_ENTITY_URL,
      checkYourAnswersUrl: CHECK_YOUR_ANSWERS_URL
    });
  }

  postRemovePage() {
    return super.postRemovePage();
  }
}

export default LimitedPartnerTransitionController;
