import RegistrationCoordinator from "../application/registration/Coordinator";
import RegistrationService from "../application/registration/Service";
import RegistrationInMemoryGateway from "../infrastructure/gateway/RegistrationInMemoryGateway";
import RegistrationController from "../presentation/controller/RegistrationController";

const registrationGateway: RegistrationInMemoryGateway =
  new RegistrationInMemoryGateway();
const registrationCoordinator: RegistrationCoordinator =
  new RegistrationCoordinator();
const registrationService: RegistrationService = new RegistrationService(
  registrationGateway,
  registrationCoordinator
);
const registrationController: RegistrationController =
  new RegistrationController(registrationService);

export const appDevDependencies = {
  registrationGateway,
  registrationService,
  registrationController,
};
