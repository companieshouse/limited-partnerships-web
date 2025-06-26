import LimitedPartnershipService from "../../../application/service/LimitedPartnershipService";
import LimitedPartnerService from "../../../application/service/LimitedPartnerService";

import { ADD_LIMITED_PARTNER_PERSON_URL, LIMITED_PARTNERS_URL } from "./url";
import LimitedPartnerController from "../common/LimitedPartnerController";

class LimitedPartnerTransitionController extends LimitedPartnerController {
  constructor(limitedPartnershipService: LimitedPartnershipService, limitedPartnerService: LimitedPartnerService) {
    super(limitedPartnershipService, limitedPartnerService);
  }

  getPageRouting() {
    return super.getPageRouting();
  }

  limitedPartnerChoice() {
    return super.limitedPartnerChoice({
      addPersonUrl: ADD_LIMITED_PARTNER_PERSON_URL,
      addLegalEntityUrl: "/" // TODO set to ADD_LIMITED_PARTNER_LEGAL_ENTITY_URL
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
      confirmLimitedPartnerUsualResidentialAddressUrl: "/", // TODO set to CONFIRM_LIMITED_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL
      confirmLimitedPartnerPrincipalOfficeAddressUrl: "/" // TODO set to CONFIRM_LIMITED_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL
    });
  }

  postReviewPage() {
    return super.postReviewPage({
      addLimitedPartnerPersonUrl: ADD_LIMITED_PARTNER_PERSON_URL,
      addLimitedPartnerLegalEntityUrl: "/", // TODO set to ADD_LIMITED_PARTNER_LEGAL_ENTITY_URL
      checkYourAnswersUrl: "/" // TODO set to CHECK_YOUR_ANSWERS_URL
    });
  }

  postRemovePage() {
    return super.postRemovePage();
  }
}

export default LimitedPartnerTransitionController;
