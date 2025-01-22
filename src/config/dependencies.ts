import GlobalController from "../presentation/controller/global/Controller";
import LimitedPartnershipService from "../application/service/LimitedPartnershipService";
import LimitedPartnershipGateway from "../infrastructure/gateway/limitedPartnership/LimitedPartnershipGateway";
import CacheRepository from "../infrastructure/repository/CacheRepository";
import RegistrationController from "../presentation/controller/registration/Controller";
import CacheService from "../application/service/CacheService";
import AddressLookUpGateway from "../infrastructure/gateway/addressLookUp/AddressLookUpGateway";
import AddressLookUpService from "../application/service/AddressLookUpService";
import AddressLookUpController from "../presentation/controller/addressLookUp/Controller";
import TransactionGateway from "../infrastructure/gateway/transaction/TransactionGateway";

// GATEWAYS
const limitedPartnershipGateway: LimitedPartnershipGateway =
  new LimitedPartnershipGateway();
const transactionGateway: TransactionGateway = new TransactionGateway();
const addressLookUpGateway: AddressLookUpGateway = new AddressLookUpGateway();

// REPOSITORIES
const cacheRepository = new CacheRepository();

// SERVICES
const limitedPartnershipService: LimitedPartnershipService =
  new LimitedPartnershipService(limitedPartnershipGateway, transactionGateway);
const addressLookUpService: AddressLookUpService = new AddressLookUpService(
  addressLookUpGateway
);
const cacheService = new CacheService(cacheRepository);

// CONTROLLERS
const globalController: GlobalController = new GlobalController();
const registrationController: RegistrationController =
  new RegistrationController(limitedPartnershipService, cacheService);
const addressLookUpController: AddressLookUpController =
  new AddressLookUpController(
    addressLookUpService,
    limitedPartnershipService,
    cacheService
  );

export const appDependencies = {
  globalController,
  registrationController,
  addressLookUpController
};
