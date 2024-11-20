import { registrationRoutingStart } from "../../../application/registration/Routing";
import RegistrationService from "../../../application/registration/Service";
import PageRegistrationType from "../../../application/registration/PageRegistrationType";
import IRegistrationGateway from "../../../domain/IRegistrationGateway";
import RegistrationInMemoryGateway from "../../../infrastructure/gateway/RegistrationInMemoryGateway";

describe("Create Transaction", () => {
  let registrationGateway: RegistrationInMemoryGateway;
  let registrationService: RegistrationService;

  beforeAll(() => {
    registrationGateway = new RegistrationInMemoryGateway();
    registrationService = new RegistrationService(
      registrationGateway as unknown as IRegistrationGateway
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
