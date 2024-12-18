import GlobalController from "../presentation/controller/global/Controller";
import RegistrationService from "../application/registration/Service";
import RegistrationInMemoryGateway from "../infrastructure/gateway/registration/RegistrationInMemoryGateway";
import CacheInMemoryRepository from "../infrastructure/repository/CacheInMemoryRepository";
import RegistrationController from "../presentation/controller/registration/Controller";

const globalController: GlobalController = new GlobalController();

const registrationGateway: RegistrationInMemoryGateway =
new RegistrationInMemoryGateway();
const cacheRepository = new CacheInMemoryRepository();

const registrationService: RegistrationService = new RegistrationService(
  registrationGateway,
  cacheRepository
);
const registrationController: RegistrationController =
  new RegistrationController(registrationService);

export const appDevDependencies = {
  globalController,
  registrationGateway,
  cacheRepository,
  registrationService,
  registrationController,
};
