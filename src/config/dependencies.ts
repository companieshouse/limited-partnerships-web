import GlobalController from "../presentation/controller/global/Controller";
import LimitedPartnershipService from "../application/service/LimitedPartnershipService";
import GeneralPartnerService from "../application/service/GeneralPartnerService";
import LimitedPartnerService from "../application/service/LimitedPartnerService";
import LimitedPartnershipGateway from "../infrastructure/gateway/limitedPartnership/LimitedPartnershipGateway";
import GeneralPartnerGateway from "../infrastructure/gateway/generalPartner/GeneralPartnerGateway";
import LimitedPartnerGateway from "../infrastructure/gateway/limitedPartner/LimitedPartnerGateway";
import CacheRepository from "../infrastructure/repository/CacheRepository";
import LimitedPartnershipController from "../presentation/controller/registration/LimitedPartnershipController";
import GeneralPartnerController from "../presentation/controller/registration/GeneralPartnerController";
import LimitedPartnerController from "../presentation/controller/registration/LimitedPartnerController";
import CacheService from "../application/service/CacheService";
import AddressLookUpGateway from "../infrastructure/gateway/addressLookUp/AddressLookUpGateway";
import AddressLookUpService from "../application/service/AddressService";
import AddressLookUpController from "../presentation/controller/addressLookUp/Controller";
import LimitedPartnershipTransitionController from "../presentation/controller/transition/LimitedPartnershipController";
import TransactionGateway from "../infrastructure/gateway/transaction/TransactionGateway";
import { IIncorporationGateway } from "../domain/IIncorporationGateway";
import IncorporationGateway from "../infrastructure/gateway/incorporation/IncorporationGateway";
import ICompanyGateway from "../domain/ICompanyGateway";
import CompanyGateway from "../infrastructure/gateway/companyProfile/CompanyGateway";
import CompanyService from "../application/service/CompanyService";
import PaymentService from "../application/service/PaymentService";
import PaymentGateway from "../infrastructure/gateway/payment/PaymentGateway";
import IPaymentGateway from "../domain/IPaymentGateway";
import TransactionService from "../application/service/TransactionService";

// GATEWAYS
const limitedPartnershipGateway: LimitedPartnershipGateway = new LimitedPartnershipGateway();
const transactionGateway: TransactionGateway = new TransactionGateway();
const addressLookUpGateway: AddressLookUpGateway = new AddressLookUpGateway();
const incorporationGateway: IIncorporationGateway = new IncorporationGateway();
const generalPartnerGateway: GeneralPartnerGateway = new GeneralPartnerGateway();
const limitedPartnerGateway: LimitedPartnerGateway = new LimitedPartnerGateway();
const companyGateway: ICompanyGateway = new CompanyGateway();
const paymentGateway: IPaymentGateway = new PaymentGateway();

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
  transactionService
);
const limitedPartnershipController: LimitedPartnershipController = new LimitedPartnershipController(
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

export const appDependencies = {
  globalController,
  limitedPartnershipController,
  generalPartnerController,
  limitedPartnerController,
  addressLookUpController,
  limitedPartnershipTransitionController
};
