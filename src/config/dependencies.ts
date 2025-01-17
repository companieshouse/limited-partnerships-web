import GlobalController from "../presentation/controller/global/Controller";
import RegistrationService from "../application/registration/Service";
import LimitedPartnershipGateway from "../infrastructure/gateway/limitedPartnership/LimitedPartnershipGateway";
import CacheRepository from "../infrastructure/repository/CacheRepository";
import RegistrationController from "../presentation/controller/registration/Controller";
import CacheService from "../application/CacheService";
// import AddressLookUpGateway from "../infrastructure/gateway/addressLookUp/AddressLookUpGateway";
import AddressLookUpInMemoryGateway from "../infrastructure/gateway/addressLookUp/AddressLookUpInMemoryGateway";
import AddressLookUpService from "../application/addressLookUp/Service";
import AddressLookUpController from "../presentation/controller/addressLookUp/Controller";
import TransactionGateway from "../infrastructure/gateway/transaction/TransactionGateway";

const globalController: GlobalController = new GlobalController();

const limitedPartnershipGateway: LimitedPartnershipGateway =
  new LimitedPartnershipGateway();
const transactionGateway: TransactionGateway = new TransactionGateway();
const registrationService: RegistrationService = new RegistrationService(
  limitedPartnershipGateway,
  transactionGateway
);

const addressLookUpGateway: AddressLookUpInMemoryGateway =
  new AddressLookUpInMemoryGateway(); // to be removed and use the bottom one - only there until the real gateway does its job - only valid postcode CF14 3UZ for the moment
// const addressLookUpGateway: AddressLookUpGateway = new AddressLookUpGateway();
const addressLookUpService: AddressLookUpService = new AddressLookUpService(
  addressLookUpGateway,
  limitedPartnershipGateway
);

const cacheRepository = new CacheRepository();
const cacheService = new CacheService(cacheRepository);

const registrationController: RegistrationController =
  new RegistrationController(registrationService, cacheService);

const addressLookUpController: AddressLookUpController =
  new AddressLookUpController(addressLookUpService, cacheService);

export const appDependencies = {
  globalController,
  registrationController,
  addressLookUpController
};
