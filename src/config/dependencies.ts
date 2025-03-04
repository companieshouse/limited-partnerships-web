import GlobalController from "../presentation/controller/global/Controller";
import LimitedPartnershipService from "../application/service/LimitedPartnershipService";
import GeneralPartnerService from "../application/service/GeneralPartnerService";
import LimitedPartnershipGateway from "../infrastructure/gateway/limitedPartnership/LimitedPartnershipGateway";
import GeneralPartnerGateway from "../infrastructure/gateway/generalPartner/GeneralPartnerGateway";
import CacheRepository from "../infrastructure/repository/CacheRepository";
import LimitedPartnershipController from "../presentation/controller/registration/LimitedPartnershipController";
import GeneralPartnerController from "../presentation/controller/registration/GeneralPartnerController";
import CacheService from "../application/service/CacheService";
import AddressLookUpGateway from "../infrastructure/gateway/addressLookUp/AddressLookUpGateway";
import AddressLookUpService from "../application/service/AddressLookUpService";
import AddressLookUpController from "../presentation/controller/addressLookUp/Controller";
import TransitionController from "../presentation/controller/transition/TransitionController";
import TransactionGateway from "../infrastructure/gateway/transaction/TransactionGateway";
import { IIncorporationGateway } from "../domain/IIncorporationGateway";
import IncorporationGateway from "../infrastructure/gateway/incorporation/IncorporationGateway";

// GATEWAYS
const limitedPartnershipGateway: LimitedPartnershipGateway = new LimitedPartnershipGateway();
const transactionGateway: TransactionGateway = new TransactionGateway();
const addressLookUpGateway: AddressLookUpGateway = new AddressLookUpGateway();
const incorporationGateway: IIncorporationGateway = new IncorporationGateway();
const generalPartnerGateway: GeneralPartnerGateway = new GeneralPartnerGateway();

// REPOSITORIES
const cacheRepository = new CacheRepository();

// SERVICES
const limitedPartnershipService: LimitedPartnershipService =
  new LimitedPartnershipService(
    limitedPartnershipGateway,
    transactionGateway,
    incorporationGateway
  );
const addressLookUpService: AddressLookUpService = new AddressLookUpService(
  addressLookUpGateway
);
const cacheService = new CacheService(cacheRepository);
const generalPartnerService: GeneralPartnerService = new GeneralPartnerService(
  generalPartnerGateway
);

// CONTROLLERS
const globalController: GlobalController = new GlobalController();
const limitedPartnershipController: LimitedPartnershipController =
  new LimitedPartnershipController(limitedPartnershipService, cacheService);
const addressLookUpController: AddressLookUpController =
  new AddressLookUpController(
    addressLookUpService,
    limitedPartnershipService,
    cacheService
  );
const transitionController: TransitionController =
  new TransitionController();

const generalPartnerController: GeneralPartnerController =
  new GeneralPartnerController(limitedPartnershipService, generalPartnerService);

export const appDependencies = {
  globalController,
  limitedPartnershipController,
  generalPartnerController,
  addressLookUpController,
  transitionController
};
