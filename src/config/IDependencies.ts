import AddressLookUpController from "../presentation/controller/addressLookUp/Controller";
import GlobalController from "../presentation/controller/global/Controller";

import TransitionController from "../presentation/controller/transition/TransitionController";
import LimitedPartnershipController from "../presentation/controller/registration/LimitedPartnershipController";
import GeneralPartnerController from "../presentation/controller/registration/GeneralPartnerController";
import LimitedPartnerController from "../presentation/controller/registration/LimitedPartnerController";

export type IDependencies = {
  globalController: GlobalController;
  limitedPartnershipController: LimitedPartnershipController;
  generalPartnerController: GeneralPartnerController;
  limitedPartnerController: LimitedPartnerController;
  addressLookUpController: AddressLookUpController;
  transitionController: TransitionController;
};
