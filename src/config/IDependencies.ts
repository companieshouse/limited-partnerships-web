import AddressLookUpController from "../presentation/controller/addressLookUp/Controller";
import GlobalController from "../presentation/controller/global/Controller";
import RegistrationController from "../presentation/controller/registration/Controller";

export type IDependencies = {
  globalController: GlobalController;
  registrationController: RegistrationController;
  addressLookUpController: AddressLookUpController;
};
