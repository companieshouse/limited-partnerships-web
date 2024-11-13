import { NameEndingType } from "@companieshouse/api-sdk-node/dist/services/limited-partnerships";
import RegistrationCoordinator from "../../../application/registration/Coordinator";
import {
  registrationRoutingName,
  registrationRoutingStart,
} from "../../../application/registration/Routing";
import RegistrationService from "../../../application/registration/Service";
// import CustomError from "../../../domain/entities/CustomError";
import TransactionRegistrationType from "../../../application/registration/TransactionRegistrationType";
import IRegistrationGateway from "../../../domain/IRegistrationGateway";
import RegistrationInMemoryGateway from "../../../infrastructure/gateway/RegistrationInMemoryGateway";

describe("Transaction", () => {
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
  });

  describe("Get registrationRoutingStart", () => {
    it("should return the page corresponcting to the transaction", () => {
      const result = registrationService.getRegistrationRouting(
        TransactionRegistrationType.START
      );

      expect(result).toEqual(registrationRoutingStart);
    });
  });

  describe("Get registrationRoutingName", () => {
    it("should return the page corresponcting to the transaction", () => {
      const result = registrationService.getRegistrationRouting(
        TransactionRegistrationType.NAME
      );

      expect(result).toEqual(registrationRoutingName);
    });
  });

  describe("Create LimitedPartnerShip", () => {
    it("should create a new LimitedPartnership", async () => {
      const result = await registrationService.create(
        TransactionRegistrationType.NAME,
        "transaction-id",
        {
          partnership_name: "Test Limited Partnership",
          name_ending: NameEndingType.LIMITED_PARTNERSHIP,
        }
      );

      expect(result).toBeTruthy();
      expect(registrationGateway.limitedPartnerships.length).toEqual(1);
      expect(result).toEqual(
        expect.objectContaining({
          ...registrationRoutingName,
          data: {
            registrationId: "submission-id",
          },
        })
      );
    });
  });
});
