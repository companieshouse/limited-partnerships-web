import GlobalController from "../presentation/controller/global/Controller";
import RegistrationService from "../application/registration/Service";
import RegistrationInMemoryGateway from "../infrastructure/gateway/limitedPartnership/LimitedPartnershipInMemoryGateway";
import CacheInMemoryRepository from "../infrastructure/repository/CacheInMemoryRepository";
import RegistrationController from "../presentation/controller/registration/Controller";
import CacheService from "../application/CacheService";
import AddressLookUpInMemoryGateway from "../infrastructure/gateway/addressLookUp/AddressLookUpInMemoryGateway";
import AddressLookUpService from "../application/addressLookUp/Service";
import AddressLookUpController from "../presentation/controller/addressLookUp/Controller";
import TransactionInMemoryGateway from "../infrastructure/gateway/transaction/TransactionInMemoryGateway";

const globalController: GlobalController = new GlobalController();

const limitedPartnershipGateway: RegistrationInMemoryGateway =
  new RegistrationInMemoryGateway();
const transactionGateway: TransactionInMemoryGateway =
  new TransactionInMemoryGateway();
const registrationService: RegistrationService = new RegistrationService(
  limitedPartnershipGateway,
  transactionGateway
);

const addressLookUpGateway: AddressLookUpInMemoryGateway =
  new AddressLookUpInMemoryGateway();
const addressLookUpService: AddressLookUpService = new AddressLookUpService(
  addressLookUpGateway,
  limitedPartnershipGateway
);

const cacheRepository = new CacheInMemoryRepository();
const cacheService = new CacheService(cacheRepository);

const registrationController: RegistrationController =
  new RegistrationController(registrationService, cacheService);

const addressLookUpController: AddressLookUpController =
  new AddressLookUpController(addressLookUpService, cacheService);

export const appDevDependencies = {
  globalController,
  limitedPartnershipGateway,
  transactionGateway,
  cacheRepository,
  registrationService,
  registrationController,
  addressLookUpGateway,
  addressLookUpService,
  addressLookUpController
};
