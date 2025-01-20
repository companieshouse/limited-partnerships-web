import PageType from "../presentation/controller/PageType";

interface ITransactionGateway {
  createTransaction(
    opt: { access_token: string },
    pageType: PageType
  ): Promise<string>;
}

export default ITransactionGateway;
