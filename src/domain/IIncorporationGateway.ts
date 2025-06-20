import PageType from "../presentation/controller/PageType";
import { IncorporationKind } from "@companieshouse/api-sdk-node/dist/services/limited-partnerships";

interface IIncorporationGateway {
  createIncorporation(
    opt: {
      access_token: string;
      refresh_token: string;
    },
    pageType: PageType,
    transactionId: string,
    kind: IncorporationKind
  ): Promise<string>;
}

export default IIncorporationGateway;
