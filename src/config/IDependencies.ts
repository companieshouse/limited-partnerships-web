import AddressLookUpController from "../presentation/controller/addressLookUp/Controller";
import GlobalController from "../presentation/controller/global/Controller";

import LimitedPartnershipRegistrationController from "../presentation/controller/registration/LimitedPartnershipController";
import GeneralPartnerRegistrationController from "../presentation/controller/registration/GeneralPartnerController";
import LimitedPartnerController from "../presentation/controller/registration/LimitedPartnerController";

import LimitedPartnershipTransitionController from "../presentation/controller/transition/LimitedPartnershipController";
import GeneralPartnerTransitionController from "../presentation/controller/transition/GeneralPartnerController";

export type IDependencies = {
  globalController: GlobalController;
  addressLookUpController: AddressLookUpController;

  limitedPartnershipRegistrationController: LimitedPartnershipRegistrationController;
  generalPartnerRegistrationController: GeneralPartnerRegistrationController;
  limitedPartnerController: LimitedPartnerController;

  limitedPartnershipTransitionController: LimitedPartnershipTransitionController;
  generalPartnerTransitionController: GeneralPartnerTransitionController;
};
