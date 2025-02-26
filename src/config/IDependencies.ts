import AddressLookUpController from "../presentation/controller/addressLookUp/Controller";
import GlobalController from "../presentation/controller/global/Controller";
import LimitedPartnershipController from "../presentation/controller/registration/LimitedPartnershipController";
import GeneralPartnerController from "../presentation/controller/registration/GeneralPartnerController";

export type IDependencies = {
  globalController: GlobalController;
  limitedPartnershipController: LimitedPartnershipController;
  generalPartnerController: GeneralPartnerController;
  addressLookUpController: AddressLookUpController;
};
