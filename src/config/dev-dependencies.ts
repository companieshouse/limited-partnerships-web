import GlobalController from "../presentation/controller/global/Controller";
import RegistrationService from "../application/registration/Service";
import RegistrationInMemoryGateway from "../infrastructure/gateway/RegistrationInMemoryGateway";
import RegistrationController from "../presentation/controller/registration/Controller";

const globalController: GlobalController = new GlobalController();

const registrationGateway: RegistrationInMemoryGateway =
  new RegistrationInMemoryGateway();
const registrationService: RegistrationService = new RegistrationService(
  registrationGateway
);
const registrationController: RegistrationController =
  new RegistrationController(registrationService);

export const appDevDependencies = {
  globalController,
  registrationGateway,
  registrationService,
  registrationController,
};
