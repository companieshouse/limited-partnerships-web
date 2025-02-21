import { LimitedPartnership } from "@companieshouse/api-sdk-node/dist/services/limited-partnerships";
import { PageRouting } from "../../PageRouting";

export interface ITemplateOptionsGenerator {
    getOptions(pageRouting: PageRouting,
               limitedPartnership: LimitedPartnership,
               i18n: any): any;
}

