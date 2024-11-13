import RegistrationController from "../presentation/controller/RegistrationController";
import RegistrationService from "../application/registration/Service";
import IRegistrationGateway from "../domain/IRegistrationGateway";

export type IDependencies = {
  registrationGateway: IRegistrationGateway;
  registrationService: RegistrationService;
  registrationController: RegistrationController;
};
