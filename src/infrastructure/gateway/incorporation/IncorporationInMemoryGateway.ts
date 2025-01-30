/* eslint-disable */

import { IIncorporationGateway } from "../../../domain/IIncorporationGateway";
import PageType from "../../../presentation/controller/PageType";
import RegistrationPageType from "../../../presentation/controller/registration/PageType";

class IncorporationGateway implements IIncorporationGateway {
  incorporationId = crypto.randomUUID().toString();

  async createIncorporation(
    opt: {
      access_token: string;
      refresh_token: string;
    },
    pageType: PageType,
    transactionId: string
  ): Promise<string> {
    if (pageType !== RegistrationPageType.name) {
      throw new Error("Wrong page type to create a new incorporation");
    }

    return this.incorporationId;
  }
}

export default IncorporationGateway;
