import RegistrationService from "../application/registration/Service";
import RegistrationGateway from "../infrastructure/gateway/RegistrationGateway";
import RegistrationController from "../presentation/controller/registration/Controller";

const registrationGateway: RegistrationGateway = new RegistrationGateway();
const registrationService: RegistrationService = new RegistrationService(
  registrationGateway
);
const registrationController: RegistrationController =
  new RegistrationController(registrationService);

export const appDependencies = {
  registrationController,
};
