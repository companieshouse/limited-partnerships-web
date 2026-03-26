import IPersonWithSignificantControlGateway from "../../domain/IPersonWithSignificantControlGateway";

class PersonWithSignificantControlService {
  i18n: any;

  constructor(private readonly personWithSignificantControlGateway: IPersonWithSignificantControlGateway) {}

  setI18n(i18n: any) {
    this.i18n = i18n;
  }
}

export default PersonWithSignificantControlService;
