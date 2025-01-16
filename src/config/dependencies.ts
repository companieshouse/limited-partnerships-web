import GlobalController from "../presentation/controller/global/Controller";
import RegistrationService from "../application/registration/Service";
import RegistrationGateway from "../infrastructure/gateway/registration/RegistrationGateway";
import CacheRepository from "../infrastructure/repository/CacheRepository";
import RegistrationController from "../presentation/controller/registration/Controller";
import CacheService from "../application/CacheService";
import AddressLookUpGateway from "../infrastructure/gateway/addressLookUp/AddressLookUpGateway";
import AddressLookUpService from "../application/addressLookUp/Service";
import AddressLookUpController from "../presentation/controller/addressLookUp/Controller";

const globalController: GlobalController = new GlobalController();

const registrationGateway: RegistrationGateway = new RegistrationGateway();
const registrationService: RegistrationService = new RegistrationService(
  registrationGateway
);

const addressLookUpGateway: AddressLookUpGateway = new AddressLookUpGateway();
const addressLookUpService: AddressLookUpService = new AddressLookUpService(
  addressLookUpGateway,
  registrationGateway
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
