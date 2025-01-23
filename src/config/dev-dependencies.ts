import GlobalController from "../presentation/controller/global/Controller";
import LimitedPartnershipService from "../application/service/LimitedPartnershipService";
import RegistrationInMemoryGateway from "../infrastructure/gateway/limitedPartnership/LimitedPartnershipInMemoryGateway";
import CacheInMemoryRepository from "../infrastructure/repository/CacheInMemoryRepository";
import RegistrationController from "../presentation/controller/registration/Controller";
import CacheService from "../application/service/CacheService";
import AddressLookUpInMemoryGateway from "../infrastructure/gateway/addressLookUp/AddressLookUpInMemoryGateway";
import AddressLookUpService from "../application/service/AddressLookUpService";
import AddressLookUpController from "../presentation/controller/addressLookUp/Controller";
import TransactionInMemoryGateway from "../infrastructure/gateway/transaction/TransactionInMemoryGateway";

// GATEWAYS
const limitedPartnershipGateway: RegistrationInMemoryGateway =
  new RegistrationInMemoryGateway();
const transactionGateway: TransactionInMemoryGateway =
  new TransactionInMemoryGateway();
const addressLookUpGateway: AddressLookUpInMemoryGateway =
  new AddressLookUpInMemoryGateway();

// REPOSITORIES
const cacheRepository = new CacheInMemoryRepository();

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

export const appDevDependencies = {
  globalController,
  limitedPartnershipGateway,
  transactionGateway,
  cacheRepository,
  limitedPartnershipService,
  registrationController,
  addressLookUpGateway,
  addressLookUpService,
  addressLookUpController
};
