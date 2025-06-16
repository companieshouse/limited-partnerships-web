import GlobalController from "../presentation/controller/global/Controller";
import LimitedPartnershipService from "../application/service/LimitedPartnershipService";
import GeneralPartnerService from "../application/service/GeneralPartnerService";
import LimitedPartnerService from "../application/service/LimitedPartnerService";
import RegistrationInMemoryGateway from "../infrastructure/gateway/limitedPartnership/LimitedPartnershipInMemoryGateway";
import GeneralPartnerInMemoryGateway from "../infrastructure/gateway/generalPartner/GeneralPartnerInMemoryGateway";
import LimitedPartnerInMemoryGateway from "../infrastructure/gateway/limitedPartner/LimitedPartnerInMemoryGateway";
import CacheInMemoryRepository from "../infrastructure/repository/CacheInMemoryRepository";
import LimitedPartnershipRegistrationController from "../presentation/controller/registration/LimitedPartnershipController";
import LimitedPartnershipTransitionController from "../presentation/controller/transition/LimitedPartnershipController";
import GeneralPartnerController from "../presentation/controller/registration/GeneralPartnerController";
import LimitedPartnerController from "../presentation/controller/registration/LimitedPartnerController";
import CacheService from "../application/service/CacheService";
import AddressLookUpInMemoryGateway from "../infrastructure/gateway/addressLookUp/AddressLookUpInMemoryGateway";
import AddressLookUpService from "../application/service/AddressService";
import AddressLookUpController from "../presentation/controller/addressLookUp/Controller";
import TransactionInMemoryGateway from "../infrastructure/gateway/transaction/TransactionInMemoryGateway";
import IncorporationInMemoryGateway from "../infrastructure/gateway/incorporation/IncorporationInMemoryGateway";
import CompanyService from "../application/service/CompanyService";
import CompanyInMemoryGateway from "../infrastructure/gateway/companyProfile/CompanyInMemoryGateway";
import PaymentService from "../application/service/PaymentService";
import PaymentInMemoryGateway from "../infrastructure/gateway/payment/PaymentInMemoryGateway";
import TransactionService from "../application/service/TransactionService";

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
const generalPartnerController: GeneralPartnerController = new GeneralPartnerController(
  limitedPartnershipService,
  generalPartnerService,
  limitedPartnerService
);
const limitedPartnerController: LimitedPartnerController = new LimitedPartnerController(
  limitedPartnershipService,
  limitedPartnerService
);

const limitedPartnershipTransitionController: LimitedPartnershipTransitionController =
  new LimitedPartnershipTransitionController(companyService, cacheService, limitedPartnershipService);

export const appDevDependencies = {
  globalController,
  limitedPartnershipGateway,
  generalPartnerGateway,
  limitedPartnerGateway,
  transactionGateway,
  incorporationGateway,
  cacheRepository,
  limitedPartnershipService,
  generalPartnerService,
  limitedPartnerService,
  limitedPartnershipRegistrationController,
  generalPartnerController,
  limitedPartnerController,
  addressLookUpGateway,
  addressLookUpService,
  addressLookUpController,
  limitedPartnershipTransitionController,
  companyGateway,
  companyService,
  paymentGateway,
  paymentService,
  transactionService
};
