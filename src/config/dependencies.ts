import CacheRepository from "../infrastructure/repository/CacheRepository";
import AddressLookUpGateway from "../infrastructure/gateway/addressLookUp/AddressLookUpGateway";
import LimitedPartnershipGateway from "../infrastructure/gateway/limitedPartnership/LimitedPartnershipGateway";
import GeneralPartnerGateway from "../infrastructure/gateway/generalPartner/GeneralPartnerGateway";
import LimitedPartnerGateway from "../infrastructure/gateway/limitedPartner/LimitedPartnerGateway";
import TransactionGateway from "../infrastructure/gateway/transaction/TransactionGateway";
import IncorporationGateway from "../infrastructure/gateway/incorporation/IncorporationGateway";
import CompanyGateway from "../infrastructure/gateway/companyProfile/CompanyGateway";
import PaymentGateway from "../infrastructure/gateway/payment/PaymentGateway";

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

import LimitedPartnershipPostTransitionController from "../presentation/controller/postTransition/LimitedPartnershipController";
import GeneralPartnerPostTransitionController from "../presentation/controller/postTransition/GeneralPartnerController";
import LimitedPartnerPostTransitionController from "../presentation/controller/postTransition/LimitedPartnerController";

// GATEWAYS
const limitedPartnershipGateway: LimitedPartnershipGateway = new LimitedPartnershipGateway();
const transactionGateway: TransactionGateway = new TransactionGateway();
const addressLookUpGateway: AddressLookUpGateway = new AddressLookUpGateway();
const incorporationGateway: IncorporationGateway = new IncorporationGateway();
const generalPartnerGateway: GeneralPartnerGateway = new GeneralPartnerGateway();
const limitedPartnerGateway: LimitedPartnerGateway = new LimitedPartnerGateway();
const companyGateway: CompanyGateway = new CompanyGateway();
const paymentGateway: PaymentGateway = new PaymentGateway();

// REPOSITORIES
const cacheRepository = new CacheRepository();

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
  transactionService,
  companyService,
  generalPartnerService,
  limitedPartnerService
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
  new LimitedPartnershipTransitionController(
    companyService,
    cacheService,
    limitedPartnershipService,
    generalPartnerService,
    limitedPartnerService
  );
const generalPartnerTransitionController: GeneralPartnerTransitionController = new GeneralPartnerTransitionController(
  limitedPartnershipService,
  generalPartnerService,
  limitedPartnerService
);
const limitedPartnerTransitionController: LimitedPartnerTransitionController = new LimitedPartnerTransitionController(
  limitedPartnershipService,
  limitedPartnerService
);

const limitedPartnershipPostTransitionController: LimitedPartnershipPostTransitionController =
  new LimitedPartnershipPostTransitionController(
    addressLookUpService,
    companyService,
    cacheService,
    limitedPartnershipService,
    transactionService,
    paymentService
  );
const generalPartnerPostTransitionController: GeneralPartnerPostTransitionController =
  new GeneralPartnerPostTransitionController(
    limitedPartnershipService,
    generalPartnerService,
    limitedPartnerService,
    companyService,
    transactionService
  );
const limitedPartnerPostTransitionController: LimitedPartnerPostTransitionController =
  new LimitedPartnerPostTransitionController(
    limitedPartnershipService,
    limitedPartnerService,
    companyService,
    transactionService
  );

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
