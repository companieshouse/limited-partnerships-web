import GlobalController from "../presentation/controller/global/Controller";
import LimitedPartnershipService from "../application/service/LimitedPartnershipService";
import GeneralPartnerService from "../application/service/GeneralPartnerService";
import RegistrationInMemoryGateway from "../infrastructure/gateway/limitedPartnership/LimitedPartnershipInMemoryGateway";
import GeneralPartnerInMemoryGateway from "../infrastructure/gateway/generalPartner/GeneralPartnerInMemoryGateway";
import CacheInMemoryRepository from "../infrastructure/repository/CacheInMemoryRepository";
import TransitionController from "../presentation/controller/transition/TransitionController";
import LimitedPartnershipController from "../presentation/controller/registration/LimitedPartnershipController";
import GeneralPartnerController from "../presentation/controller/registration/GeneralPartnerController";
import CacheService from "../application/service/CacheService";
import AddressLookUpInMemoryGateway from "../infrastructure/gateway/addressLookUp/AddressLookUpInMemoryGateway";
import AddressLookUpService from "../application/service/AddressLookUpService";
import AddressLookUpController from "../presentation/controller/addressLookUp/Controller";
import TransactionInMemoryGateway from "../infrastructure/gateway/transaction/TransactionInMemoryGateway";
import IncorporationInMemoryGateway from "../infrastructure/gateway/incorporation/IncorporationInMemoryGateway";

// GATEWAYS
const limitedPartnershipGateway: RegistrationInMemoryGateway =
  new RegistrationInMemoryGateway();
const transactionGateway: TransactionInMemoryGateway =
  new TransactionInMemoryGateway();
const addressLookUpGateway: AddressLookUpInMemoryGateway =
  new AddressLookUpInMemoryGateway();
const incorporationGateway: IncorporationInMemoryGateway =
  new IncorporationInMemoryGateway();
const generalPartnerGateway: GeneralPartnerInMemoryGateway =
  new GeneralPartnerInMemoryGateway();

// REPOSITORIES
const cacheRepository = new CacheInMemoryRepository();

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
  new TransitionController(cacheService);
const generalPartnerController: GeneralPartnerController =
  new GeneralPartnerController(limitedPartnershipService, generalPartnerService);

export const appDevDependencies = {
  globalController,
  limitedPartnershipGateway,
  generalPartnerGateway,
  transactionGateway,
  incorporationGateway,
  cacheRepository,
  limitedPartnershipService,
  generalPartnerService,
  limitedPartnershipController,
  generalPartnerController,
  addressLookUpGateway,
  addressLookUpService,
  addressLookUpController,
  transitionController
};
