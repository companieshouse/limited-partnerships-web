import CacheInMemoryRepository from "../infrastructure/repository/CacheInMemoryRepository";
import AddressLookUpInMemoryGateway from "../infrastructure/gateway/addressLookUp/AddressLookUpInMemoryGateway";
import RegistrationInMemoryGateway from "../infrastructure/gateway/limitedPartnership/LimitedPartnershipInMemoryGateway";
import GeneralPartnerInMemoryGateway from "../infrastructure/gateway/generalPartner/GeneralPartnerInMemoryGateway";
import LimitedPartnerInMemoryGateway from "../infrastructure/gateway/limitedPartner/LimitedPartnerInMemoryGateway";
import IncorporationInMemoryGateway from "../infrastructure/gateway/incorporation/IncorporationInMemoryGateway";
import CompanyInMemoryGateway from "../infrastructure/gateway/companyProfile/CompanyInMemoryGateway";
import PaymentInMemoryGateway from "../infrastructure/gateway/payment/PaymentInMemoryGateway";
import TransactionInMemoryGateway from "../infrastructure/gateway/transaction/TransactionInMemoryGateway";

import CacheService from "../application/service/CacheService";
import AddressLookUpService from "../application/service/AddressService";
import LimitedPartnershipService from "../application/service/LimitedPartnershipService";
import GeneralPartnerService from "../application/service/GeneralPartnerService";
import LimitedPartnerService from "../application/service/LimitedPartnerService";
import CompanyService from "../application/service/CompanyService";
import PaymentService from "../application/service/PaymentService";
import TransactionService from "../application/service/TransactionService";

import GlobalController from "../presentation/controller/global/Controller";
import AddressLookUpController from "../presentation/controller/addressLookUp/Controller";
import LimitedPartnershipRegistrationController from "../presentation/controller/registration/LimitedPartnershipController";
import GeneralPartnerRegistrationController from "../presentation/controller/registration/GeneralPartnerController";
import LimitedPartnerRegistrationController from "../presentation/controller/registration/LimitedPartnerController";
import LimitedPartnershipTransitionController from "../presentation/controller/transition/LimitedPartnershipController";
import GeneralPartnerTransitionController from "../presentation/controller/transition/GeneralPartnerController";
import LimitedPartnerTransitionController from "../presentation/controller/transition/LimitedPartnerController";

// GATEWAYS
const limitedPartnershipGateway: RegistrationInMemoryGateway = new RegistrationInMemoryGateway();
const transactionGateway: TransactionInMemoryGateway = new TransactionInMemoryGateway();
const addressLookUpGateway: AddressLookUpInMemoryGateway = new AddressLookUpInMemoryGateway();
const incorporationGateway: IncorporationInMemoryGateway = new IncorporationInMemoryGateway();
const generalPartnerGateway: GeneralPartnerInMemoryGateway = new GeneralPartnerInMemoryGateway();
const limitedPartnerGateway: LimitedPartnerInMemoryGateway = new LimitedPartnerInMemoryGateway();
const companyGateway: CompanyInMemoryGateway = new CompanyInMemoryGateway();
const paymentGateway: PaymentInMemoryGateway = new PaymentInMemoryGateway();

// REPOSITORIES
const cacheRepository = new CacheInMemoryRepository();

// SERVICES
const limitedPartnershipService: LimitedPartnershipService = new LimitedPartnershipService(
  limitedPartnershipGateway,
  transactionGateway,
  incorporationGateway
);
const addressLookUpService: AddressLookUpService = new AddressLookUpService(addressLookUpGateway);
const cacheService = new CacheService(cacheRepository);
const generalPartnerService: GeneralPartnerService = new GeneralPartnerService(generalPartnerGateway);
const limitedPartnerService: LimitedPartnerService = new LimitedPartnerService(limitedPartnerGateway);
const companyService = new CompanyService(companyGateway);
const paymentService = new PaymentService(paymentGateway);
const transactionService = new TransactionService(transactionGateway);

// CONTROLLERS
const globalController: GlobalController = new GlobalController(
  limitedPartnershipService,
  paymentService,
  transactionService
);
const limitedPartnershipRegistrationController: LimitedPartnershipRegistrationController =
  new LimitedPartnershipRegistrationController(
    limitedPartnershipService,
    generalPartnerService,
    limitedPartnerService,
    cacheService,
    paymentService
  );
const addressLookUpController: AddressLookUpController = new AddressLookUpController(
  addressLookUpService,
  limitedPartnershipService,
  generalPartnerService,
  limitedPartnerService,
  cacheService
);
const generalPartnerRegistrationController: GeneralPartnerRegistrationController =
  new GeneralPartnerRegistrationController(limitedPartnershipService, generalPartnerService, limitedPartnerService);
const limitedPartnerRegistrationController: LimitedPartnerRegistrationController =
  new LimitedPartnerRegistrationController(limitedPartnershipService, limitedPartnerService);

const limitedPartnershipTransitionController: LimitedPartnershipTransitionController =
  new LimitedPartnershipTransitionController(companyService, cacheService, limitedPartnershipService, generalPartnerService, limitedPartnerService);
const generalPartnerTransitionController: GeneralPartnerTransitionController = new GeneralPartnerTransitionController(
  limitedPartnershipService,
  generalPartnerService,
  limitedPartnerService
);
const limitedPartnerTransitionController: LimitedPartnerTransitionController = new LimitedPartnerTransitionController(
  limitedPartnershipService,
  limitedPartnerService
);

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
  limitedPartnerTransitionController
};
