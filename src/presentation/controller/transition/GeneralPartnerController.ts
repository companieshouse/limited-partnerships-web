import LimitedPartnershipService from "../../../application/service/LimitedPartnershipService";
import GeneralPartnerService from "../../../application/service/GeneralPartnerService";
import LimitedPartnerService from "../../../application/service/LimitedPartnerService";
import PartnerController, { PartnerType } from "../common/PartnerController";

import {
  ADD_GENERAL_PARTNER_LEGAL_ENTITY_URL,
  ADD_GENERAL_PARTNER_PERSON_URL,
  GENERAL_PARTNERS_URL,
  LIMITED_PARTNERS_URL,
  REVIEW_GENERAL_PARTNERS_URL,
  REVIEW_LIMITED_PARTNERS_URL
} from "./url";
import {
  CONFIRM_GENERAL_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL,
  CONFIRM_GENERAL_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL
} from "../addressLookUp/url/transition";

class GeneralPartnerTransitionController extends PartnerController {
  constructor(
    limitedPartnershipService: LimitedPartnershipService,
    generalPartnerService: GeneralPartnerService,
    limitedPartnerService: LimitedPartnerService
  ) {
    super(limitedPartnershipService, generalPartnerService, limitedPartnerService);
  }

  getPageRouting() {
    return super.getPageRouting(PartnerType.generalPartner);
  }

  getGeneralPartner() {
    return super.getGeneralPartner({ reviewGeneralPartnersUrl: REVIEW_GENERAL_PARTNERS_URL });
  }

  generalPartnerChoice() {
    return super.partnerChoice({
      addPersonUrl: ADD_GENERAL_PARTNER_PERSON_URL,
      addLegalEntityUrl: ADD_GENERAL_PARTNER_LEGAL_ENTITY_URL
    });
  }

  getReviewPage() {
    return super.getReviewPage(PartnerType.generalPartner, { generalPartnersUrl: GENERAL_PARTNERS_URL });
  }

  createGeneralPartner() {
    return super.createGeneralPartner();
  }

  sendPageData() {
    return super.sendPageData(PartnerType.generalPartner, {
      confirmPartnerUsualResidentialAddressUrl: CONFIRM_GENERAL_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL,
      confirmPartnerPrincipalOfficeAddressUrl: CONFIRM_GENERAL_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL
    });
  }

  postReviewPage() {
    return super.postReviewPage({
      addGeneralPartnerPersonUrl: ADD_GENERAL_PARTNER_PERSON_URL,
      addGeneralPartnerLegalEntityUrl: ADD_GENERAL_PARTNER_LEGAL_ENTITY_URL,
      reviewLimitedPartnersUrl: REVIEW_LIMITED_PARTNERS_URL,
      limitedPartnerUrl: LIMITED_PARTNERS_URL
    });
  }

  postRemovePage() {
    return super.postRemovePage();
  }
}

export default GeneralPartnerTransitionController;
