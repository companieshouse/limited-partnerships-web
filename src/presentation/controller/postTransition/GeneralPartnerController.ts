import CacheService from "../../../application/service/CacheService";
import CompanyService from "../../../application/service/CompanyService";
import GeneralPartnerService from "../../../application/service/GeneralPartnerService";
import LimitedPartnerService from "../../../application/service/LimitedPartnerService";
import LimitedPartnershipService from "../../../application/service/LimitedPartnershipService";
import GeneralPartnerController from "../common/GeneralPartnerController";
import { ADD_GENERAL_PARTNER_LEGAL_ENTITY_URL, ADD_GENERAL_PARTNER_PERSON_URL } from "./url";

class GeneralPartnerPostTransitionController extends GeneralPartnerController {
  constructor(
    limitedPartnershipService: LimitedPartnershipService,
    generalPartnerService: GeneralPartnerService,
    limitedPartnerService: LimitedPartnerService,
    companyService: CompanyService,
    cacheService: CacheService
  ) {
    super(limitedPartnershipService, generalPartnerService, limitedPartnerService, companyService, cacheService);
  }

  getPageRouting() {
    return super.getPageRouting();
  }

  generalPartnerChoice() {
    return super.generalPartnerChoice({
      addPersonUrl: ADD_GENERAL_PARTNER_PERSON_URL,
      addLegalEntityUrl: ADD_GENERAL_PARTNER_LEGAL_ENTITY_URL
    });
  }
}

export default GeneralPartnerPostTransitionController;
