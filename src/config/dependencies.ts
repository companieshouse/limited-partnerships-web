import GlobalController from "../presentation/controller/global/Controller";
import RegistrationService from "../application/registration/Service";
import RegistrationGateway from "../infrastructure/gateway/registration/RegistrationGateway";
import CacheRepository from "../infrastructure/repository/CacheRepository";
import RegistrationController from "../presentation/controller/registration/Controller";
import CacheService from "../application/CacheService";

const globalController: GlobalController = new GlobalController();

const registrationGateway: RegistrationGateway = new RegistrationGateway();
const registrationService: RegistrationService = new RegistrationService(
  registrationGateway
);

const cacheRepository = new CacheRepository();
const cacheService = new CacheService(cacheRepository);

const registrationController: RegistrationController =
  new RegistrationController(registrationService, cacheService);

export const appDependencies = {
  globalController,
  registrationController,
};
