import LimitedPartnershipService from "../../../application/service/LimitedPartnershipService";
import LimitedPartnerService from "../../../application/service/LimitedPartnerService";
import LimitedPartnerController from "../common/LimitedPartnerController";
import { ADD_LIMITED_PARTNER_LEGAL_ENTITY_URL, ADD_LIMITED_PARTNER_PERSON_URL } from "./url";
import CompanyService from "../../../application/service/CompanyService";

class LimitedPartnerPostTransitionController extends LimitedPartnerController {
  constructor(
    limitedPartnershipService: LimitedPartnershipService,
    limitedPartnerService: LimitedPartnerService,
    companyService: CompanyService,
  ) {
    super(limitedPartnershipService, limitedPartnerService, companyService);
  }

  getPageRouting() {
    return super.getPageRouting();
  }

  limitedPartnerChoice() {
    return super.limitedPartnerChoice({
      addPersonUrl: ADD_LIMITED_PARTNER_PERSON_URL,
      addLegalEntityUrl: ADD_LIMITED_PARTNER_LEGAL_ENTITY_URL,
    });
  }
}

export default LimitedPartnerPostTransitionController;
