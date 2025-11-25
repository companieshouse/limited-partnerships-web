import LimitedPartnershipService from "../../../application/service/LimitedPartnershipService";
import GeneralPartnerService from "../../../application/service/GeneralPartnerService";
import LimitedPartnerService from "../../../application/service/LimitedPartnerService";
import PartnerController, { PartnerType } from "../common/PartnerController";

import {
  ADD_LIMITED_PARTNER_LEGAL_ENTITY_URL,
  ADD_LIMITED_PARTNER_PERSON_URL,
  CHECK_YOUR_ANSWERS_URL,
  LIMITED_PARTNERS_URL,
  REVIEW_LIMITED_PARTNERS_URL
} from "./url";
import {
  CONFIRM_LIMITED_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL,
  CONFIRM_LIMITED_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL
} from "../addressLookUp/url/transition";

class LimitedPartnerTransitionController extends PartnerController {
  constructor(
    limitedPartnershipService: LimitedPartnershipService,
    generalPartnerService: GeneralPartnerService,
    limitedPartnerService: LimitedPartnerService
  ) {
    super(limitedPartnershipService, generalPartnerService, limitedPartnerService);
  }

  getPageRouting() {
    return super.getPageRouting();
  }

  getLimitedPartner() {
    return super.getPartner(PartnerType.limitedPartner, { reviewPartnersUrl: REVIEW_LIMITED_PARTNERS_URL });
  }

  limitedPartnerChoice() {
    return super.partnerType({
      addPersonUrl: ADD_LIMITED_PARTNER_PERSON_URL,
      addLegalEntityUrl: ADD_LIMITED_PARTNER_LEGAL_ENTITY_URL
    });
  }

  getReviewPage() {
    return super.getReviewPage(PartnerType.limitedPartner, { partnersUrl: LIMITED_PARTNERS_URL });
  }

  createLimitedPartner() {
    return super.createPartner(PartnerType.limitedPartner);
  }

  sendPageData() {
    return super.sendPageData(PartnerType.limitedPartner, {
      confirmPartnerUsualResidentialAddressUrl: CONFIRM_LIMITED_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL,
      confirmPartnerPrincipalOfficeAddressUrl: CONFIRM_LIMITED_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL
    });
  }

  postReviewPage() {
    return super.postReviewPage(PartnerType.limitedPartner, {
      addPartnerPersonUrl: ADD_LIMITED_PARTNER_PERSON_URL,
      addPartnerLegalEntityUrl: ADD_LIMITED_PARTNER_LEGAL_ENTITY_URL,
      redirectUrl: CHECK_YOUR_ANSWERS_URL
    });
  }

  postRemovePage() {
    return super.postRemovePage(PartnerType.limitedPartner);
  }
}

export default LimitedPartnerTransitionController;
