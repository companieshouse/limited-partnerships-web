/* eslint-disable */
import crypto from "crypto";
import { IIncorporationGateway } from "../../../domain/IIncorporationGateway";
import PageType from "../../../presentation/controller/PageType";
import RegistrationPageType from "../../../presentation/controller/registration/PageType";
import { IncorporationKind } from "@companieshouse/api-sdk-node/dist/services/limited-partnerships";
import TransitionPageType from "../../../presentation/controller/transition/PageType";

class IncorporationGateway implements IIncorporationGateway {
  incorporationId = crypto.randomUUID().toString();

  async createIncorporation(
    opt: {
      access_token: string;
      refresh_token: string;
    },
    pageType: PageType,
    transactionId: string,
    kind: IncorporationKind
  ): Promise<string> {
    if (pageType !== RegistrationPageType.name && pageType !== TransitionPageType.confirmLimitedPartnership) {
      throw new Error("Wrong page type to create a new incorporation");
    }

    return this.incorporationId;
  }
}

export default IncorporationGateway;
