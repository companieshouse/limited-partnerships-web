import GlobalController from "../presentation/controller/global/Controller";
import RegistrationService from "../application/registration/Service";
import RegistrationInMemoryGateway from "../infrastructure/gateway/registration/RegistrationInMemoryGateway";
import CacheInMemoryRepository from "../infrastructure/repository/CacheInMemoryRepository";
import RegistrationController from "../presentation/controller/registration/Controller";
import CacheService from "../application/CacheService";

const globalController: GlobalController = new GlobalController();

const registrationGateway: RegistrationInMemoryGateway =
  new RegistrationInMemoryGateway();

const registrationService: RegistrationService = new RegistrationService(
  registrationGateway
);

const cacheRepository = new CacheInMemoryRepository();
const cacheService = new CacheService(cacheRepository);

const registrationController: RegistrationController =
  new RegistrationController(registrationService, cacheService);

export const appDevDependencies = {
  globalController,
  registrationGateway,
  cacheRepository,
  registrationService,
  registrationController,
};
