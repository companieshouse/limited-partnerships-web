import { LimitedPartnership } from "@companieshouse/api-sdk-node/dist/services/limited-partnerships";
import { PageRouting } from "presentation/controller/PageRouting";
import { ITemplateOptions } from "./ITemplateOptions";

export class DefaultTemplateOptions implements ITemplateOptions {

  getOptions(_pageRouting: PageRouting,
             _limitedPartnership: LimitedPartnership,
             _i18n: any) {
    return {};
  }
}

