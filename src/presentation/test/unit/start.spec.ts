import RegistrationCoordinator from "../../../application/registration/Coordinator";
import { registrationRoutingStart } from "../../../application/registration/Routing";
import RegistrationService from "../../../application/registration/Service";
import PageRegistrationType from "../../../application/registration/PageRegistrationType";
import IRegistrationGateway from "../../../domain/IRegistrationGateway";
import RegistrationInMemoryGateway from "../../../infrastructure/gateway/RegistrationInMemoryGateway";

describe("Create Transaction", () => {
  let registrationGateway: RegistrationInMemoryGateway;
  let registrationCoordinator: RegistrationCoordinator;
  let registrationService: RegistrationService;

  beforeAll(() => {
    registrationGateway = new RegistrationInMemoryGateway();
    registrationCoordinator = new RegistrationCoordinator();
    registrationService = new RegistrationService(
      registrationGateway as unknown as IRegistrationGateway,
      registrationCoordinator
    );
  });

  beforeEach(() => {
    registrationGateway.feedLimitedPartnerships([]);
    registrationGateway.feedErrors([]);
  });

  describe("Get registrationRoutingStart", () => {
    it("should return the page corresponcting to the transaction", () => {
      const result = registrationService.getRegistrationRouting(
        PageRegistrationType.start
      );

      expect(result).toEqual(registrationRoutingStart);
    });
  });
});
