import { LimitedPartnership } from "@companieshouse/api-sdk-node/dist/services/limited-partnerships";
import { PageRouting } from "presentation/controller/PageRouting";
import { ITemplateOptionsGenerator } from "./ITemplateOptionsGenerator";

class DefaultTemplateOptions implements ITemplateOptionsGenerator {
  getOptions(_pageRouting: PageRouting,
             _limitedPartnership: LimitedPartnership,
             _i18n: any) {
    return {};
  }
}

export default DefaultTemplateOptions;
