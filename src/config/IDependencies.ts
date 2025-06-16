import AddressLookUpController from "../presentation/controller/addressLookUp/Controller";
import GlobalController from "../presentation/controller/global/Controller";

import LimitedPartnershipRegistrationController from "../presentation/controller/registration/LimitedPartnershipController";
import LimitedPartnershipTransitionController from "../presentation/controller/transition/LimitedPartnershipController";
import GeneralPartnerController from "../presentation/controller/registration/GeneralPartnerController";
import LimitedPartnerController from "../presentation/controller/registration/LimitedPartnerController";

export type IDependencies = {
  globalController: GlobalController;
  limitedPartnershipRegistrationController: LimitedPartnershipRegistrationController;
  generalPartnerController: GeneralPartnerController;
  limitedPartnerController: LimitedPartnerController;
  addressLookUpController: AddressLookUpController;
  limitedPartnershipTransitionController: LimitedPartnershipTransitionController;
};
