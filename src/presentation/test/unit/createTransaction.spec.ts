import RegistrationCoordinator from "../../../application/registration/Coordinator";
import { registrationRoutingStart } from "../../../application/registration/Routing";
import RegistrationService from "../../../application/registration/Service";
import TransactionRegistrationType from "../../../application/registration/TransactionRegistrationType";
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
        TransactionRegistrationType.START
      );

      expect(result).toEqual(registrationRoutingStart);
    });
  });

  describe("Create transaction", () => {
    it("should create a transaction and add id to the url", async () => {
      const result = await registrationService.createTransaction(
        TransactionRegistrationType.START
      );

      expect(result).toEqual(
        expect.objectContaining({
          ...registrationRoutingStart,
          data: {
            transactionId: registrationGateway.transationId,
          },
        })
      );
    });
  });
});
