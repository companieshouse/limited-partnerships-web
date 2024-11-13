import RegistrationCoordinator from "../application/registration/Coordinator";
import RegistrationService from "../application/registration/Service";
import RegistrationGateway from "../infrastructure/gateway/RegistrationGateway";
import RegistrationController from "../presentation/controller/RegistrationController";

const registrationGateway: RegistrationGateway = new RegistrationGateway();
const registrationCoordinator: RegistrationCoordinator =
  new RegistrationCoordinator();
const registrationService: RegistrationService = new RegistrationService(
  registrationGateway,
  registrationCoordinator
);
const registrationController: RegistrationController =
  new RegistrationController(registrationService);

export const appDependencies = {
  registrationGateway,
  registrationService,
  registrationController,
};
