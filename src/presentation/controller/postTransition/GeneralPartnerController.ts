import GeneralPartnerService from "../../../application/service/GeneralPartnerService";
import LimitedPartnerService from "../../../application/service/LimitedPartnerService";
import LimitedPartnershipService from "../../../application/service/LimitedPartnershipService";
import GeneralPartnerController from "../common/GeneralPartnerController";
import { ADD_GENERAL_PARTNER_LEGAL_ENTITY_URL, ADD_GENERAL_PARTNER_PERSON_URL } from "./url";

class GeneralPartnerPostTransitionController extends GeneralPartnerController {
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

  generalPartnerChoice() {
    return super.generalPartnerChoice({
      addPersonUrl: ADD_GENERAL_PARTNER_PERSON_URL,
      addLegalEntityUrl: ADD_GENERAL_PARTNER_LEGAL_ENTITY_URL
    });
  }
}

export default GeneralPartnerPostTransitionController;
