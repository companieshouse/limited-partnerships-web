import { buildDependencies } from "./build-dependencies";

const {
  globalController,
  addressLookUpController,

  limitedPartnershipRegistrationController,
  generalPartnerRegistrationController,
  limitedPartnerRegistrationController,

  limitedPartnershipTransitionController,
  generalPartnerTransitionController,
  limitedPartnerTransitionController,

  limitedPartnershipPostTransitionController,
  generalPartnerPostTransitionController,
  limitedPartnerPostTransitionController
} = buildDependencies();

export const appDependencies = {
  globalController,
  addressLookUpController,

  limitedPartnershipRegistrationController,
  generalPartnerRegistrationController,
  limitedPartnerRegistrationController,

  limitedPartnershipTransitionController,
  generalPartnerTransitionController,
  limitedPartnerTransitionController,

  limitedPartnershipPostTransitionController,
  generalPartnerPostTransitionController,
  limitedPartnerPostTransitionController
};
