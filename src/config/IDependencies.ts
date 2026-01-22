import AddressLookUpController from "../presentation/controller/addressLookUp/Controller";
import GlobalController from "../presentation/controller/global/Controller";

import LimitedPartnershipRegistrationController from "../presentation/controller/registration/LimitedPartnershipController";
import GeneralPartnerRegistrationController from "../presentation/controller/registration/GeneralPartnerController";
import LimitedPartnerRegistrationController from "../presentation/controller/registration/LimitedPartnerController";

import LimitedPartnershipTransitionController from "../presentation/controller/transition/LimitedPartnershipController";
import GeneralPartnerTransitionController from "../presentation/controller/transition/GeneralPartnerController";
import LimitedPartnerTransitionController from "../presentation/controller/transition/LimitedPartnerController";

import LimitedPartnershipPostTransitionController from "../presentation/controller/postTransition/LimitedPartnershipController";
import GeneralPartnerPostTransitionController from "../presentation/controller/postTransition/GeneralPartnerController";
import LimitedPartnerPostTransitionController from "../presentation/controller/postTransition/LimitedPartnerController";

import LimitedPartnershipService from "../application/service/LimitedPartnershipService";
import TransactionService from "application/service/TransactionService";

export type IDependencies = {
  limitedPartnershipService: LimitedPartnershipService;
  transactionService: TransactionService;

  globalController: GlobalController;
  addressLookUpController: AddressLookUpController;

  limitedPartnershipRegistrationController: LimitedPartnershipRegistrationController;
  generalPartnerRegistrationController: GeneralPartnerRegistrationController;
  limitedPartnerRegistrationController: LimitedPartnerRegistrationController;

  limitedPartnershipTransitionController: LimitedPartnershipTransitionController;
  generalPartnerTransitionController: GeneralPartnerTransitionController;
  limitedPartnerTransitionController: LimitedPartnerTransitionController;

  limitedPartnershipPostTransitionController: LimitedPartnershipPostTransitionController;
  generalPartnerPostTransitionController: GeneralPartnerPostTransitionController;
  limitedPartnerPostTransitionController: LimitedPartnerPostTransitionController;
};
