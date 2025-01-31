import PageType from "../presentation/controller/PageType";

export interface IIncorporationGateway {
  createIncorporation(
    opt: {
      access_token: string;
      refresh_token: string;
    },
    pageType: PageType,
    transactionId: string
  ): Promise<string>;
}
