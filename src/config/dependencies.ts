import GlobalController from "../presentation/controller/global/Controller";
import RegistrationService from "../application/registration/Service";
import RegistrationGateway from "../infrastructure/gateway/registration/RegistrationGateway";
import CacheRepository from "../infrastructure/repository/CacheRepository";
import RegistrationController from "../presentation/controller/registration/Controller";

const globalController: GlobalController = new GlobalController();

const registrationGateway: RegistrationGateway = new RegistrationGateway();
const cacheRepository = new CacheRepository();

const registrationService: RegistrationService = new RegistrationService(
  registrationGateway,
  cacheRepository
);
const registrationController: RegistrationController =
  new RegistrationController(registrationService);

export const appDependencies = {
  globalController,
  registrationController,
};
