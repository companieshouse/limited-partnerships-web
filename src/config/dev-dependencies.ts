import { buildDependencies } from "./build-dependencies";

const {
  limitedPartnershipGateway,
  generalPartnerGateway,
  limitedPartnerGateway,
  transactionGateway,
  incorporationGateway,
  addressLookUpGateway,
  paymentGateway,
  companyGateway,
  cacheRepository,

  addressLookUpService,
  limitedPartnershipService,
  generalPartnerService,
  limitedPartnerService,
  companyService,
  paymentService,
  transactionService,

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
} = buildDependencies(true);

export const appDevDependencies = {
  limitedPartnershipGateway,
  generalPartnerGateway,
  limitedPartnerGateway,
  transactionGateway,
  incorporationGateway,
  addressLookUpGateway,
  paymentGateway,
  companyGateway,
  cacheRepository,

  addressLookUpService,
  limitedPartnershipService,
  generalPartnerService,
  limitedPartnerService,
  companyService,
  paymentService,
  transactionService,

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
