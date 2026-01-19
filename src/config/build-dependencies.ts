import CacheRepository from "../infrastructure/repository/CacheRepository";
import CacheInMemoryRepository from "../infrastructure/repository/CacheInMemoryRepository";
import AddressLookUpGateway from "../infrastructure/gateway/addressLookUp/AddressLookUpGateway";
import AddressLookUpInMemoryGateway from "../infrastructure/gateway/addressLookUp/AddressLookUpInMemoryGateway";
import LimitedPartnershipGateway from "../infrastructure/gateway/limitedPartnership/LimitedPartnershipGateway";
import RegistrationInMemoryGateway from "../infrastructure/gateway/limitedPartnership/LimitedPartnershipInMemoryGateway";
import GeneralPartnerGateway from "../infrastructure/gateway/generalPartner/GeneralPartnerGateway";
import GeneralPartnerInMemoryGateway from "../infrastructure/gateway/generalPartner/GeneralPartnerInMemoryGateway";
import LimitedPartnerGateway from "../infrastructure/gateway/limitedPartner/LimitedPartnerGateway";
import LimitedPartnerInMemoryGateway from "../infrastructure/gateway/limitedPartner/LimitedPartnerInMemoryGateway";
import TransactionGateway from "../infrastructure/gateway/transaction/TransactionGateway";
import TransactionInMemoryGateway from "../infrastructure/gateway/transaction/TransactionInMemoryGateway";
import IncorporationGateway from "../infrastructure/gateway/incorporation/IncorporationGateway";
import IncorporationInMemoryGateway from "../infrastructure/gateway/incorporation/IncorporationInMemoryGateway";
import CompanyGateway from "../infrastructure/gateway/companyProfile/CompanyGateway";
import CompanyInMemoryGateway from "../infrastructure/gateway/companyProfile/CompanyInMemoryGateway";
import PaymentGateway from "../infrastructure/gateway/payment/PaymentGateway";
import PaymentInMemoryGateway from "../infrastructure/gateway/payment/PaymentInMemoryGateway";

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
import PostTransitionPartnerController from "../presentation/controller/postTransition/PostTransitionPartnerController";
import GeneralPartnerPostTransitionController from "../presentation/controller/postTransition/GeneralPartnerController";
import LimitedPartnerPostTransitionController from "../presentation/controller/postTransition/LimitedPartnerController";

export type BuiltDependencies = {
  // Gateways / repositories
  limitedPartnershipGateway: any;
  transactionGateway: any;
  addressLookUpGateway: any;
  incorporationGateway: any;
  generalPartnerGateway: any;
  limitedPartnerGateway: any;
  companyGateway: any;
  paymentGateway: any;
  cacheRepository: any;

  // Services
  addressLookUpService: AddressLookUpService;
  limitedPartnershipService: LimitedPartnershipService;
  generalPartnerService: GeneralPartnerService;
  limitedPartnerService: LimitedPartnerService;
  companyService: CompanyService;
  paymentService: PaymentService;
  transactionService: TransactionService;

  // Controllers (subset)
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

export function buildDependencies(useInMemory = false): BuiltDependencies {
  // Gateways
  const limitedPartnershipGateway = useInMemory
    ? new RegistrationInMemoryGateway()
    : new LimitedPartnershipGateway();
  const transactionGateway = useInMemory ? new TransactionInMemoryGateway() : new TransactionGateway();
  const addressLookUpGateway = useInMemory ? new AddressLookUpInMemoryGateway() : new AddressLookUpGateway();
  const incorporationGateway = useInMemory ? new IncorporationInMemoryGateway() : new IncorporationGateway();
  const generalPartnerGateway = useInMemory ? new GeneralPartnerInMemoryGateway() : new GeneralPartnerGateway();
  const limitedPartnerGateway = useInMemory ? new LimitedPartnerInMemoryGateway() : new LimitedPartnerGateway();
  const companyGateway = useInMemory ? new CompanyInMemoryGateway() : new CompanyGateway();
  const paymentGateway = useInMemory ? new PaymentInMemoryGateway() : new PaymentGateway();

  // Repositories
  const cacheRepository = useInMemory ? new CacheInMemoryRepository() : new CacheRepository();

  // Services
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
  const transactionService: TransactionService = new TransactionService(transactionGateway);

  // Controllers
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
    new LimitedPartnerRegistrationController(limitedPartnershipService, generalPartnerService, limitedPartnerService);

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
    generalPartnerService,
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

  const postTransitionPartnerController = new PostTransitionPartnerController(
    limitedPartnershipService,
    generalPartnerService,
    limitedPartnerService,
    companyService,
    transactionService
  );

  const generalPartnerPostTransitionController: GeneralPartnerPostTransitionController =
    new GeneralPartnerPostTransitionController(
      limitedPartnershipService,
      generalPartnerService,
      limitedPartnerService,
      companyService,
      postTransitionPartnerController
    );

  const limitedPartnerPostTransitionController: LimitedPartnerPostTransitionController =
    new LimitedPartnerPostTransitionController(
      limitedPartnershipService,
      generalPartnerService,
      limitedPartnerService,
      companyService,
      postTransitionPartnerController
    );

  return {
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
}
