import { LimitedPartnership } from "@companieshouse/api-sdk-node/dist/services/limited-partnerships";
import { PageRouting } from "../../PageRouting";
import { ITemplateOptions } from "./ITemplateOptions";

export class PostcodePPOBTemplateOptions implements ITemplateOptions {

  templateName = "postcode-lookup";

  getOptions(pageRouting: PageRouting,
             limitedPartnership: LimitedPartnership,
             i18n: any): any {
    return {
      templateOptions: {
        baseTemplate: "layout.njk",
        whatIsOfficeAddress: i18n.address.findPostcode.principalPlaceOfBusiness.whatIsPrincipalPlaceOfBusiness,
        proposedName: `${limitedPartnership.data?.partnership_name?.toUpperCase()} ${limitedPartnership.data?.name_ending?.toUpperCase()}`,
        hint1: i18n.address.findPostcode.principalPlaceOfBusiness.runningOfBusiness,
        hint2: i18n.address.findPostcode.principalPlaceOfBusiness.jurisdiction,
        partnership_type: limitedPartnership.data?.partnership_type,

        postcodeErrorMessage: i18n.address.findPostcode.errorPostcode,
        templateName: pageRouting.pageType,
        nameOrNumberHint: i18n.address.findPostcode.nameOrNumberHint,
        postcodeHint: i18n.address.findPostcode.postcodeHint,
        enterManualAddressUrl: pageRouting.currentUrl?.replace(pageRouting.pageType, pageRouting.data?.enterManualAddressPageType),
        enterAddressManually: i18n.address.findPostcode.enterAddressManually,
        findAddress: i18n.address.findPostcode.findAddress,
        publicRegisterTitle: i18n.address.findPostcode.principalPlaceOfBusiness.publicRegisterTitle,
        publicRegisterLine1: i18n.address.findPostcode.principalPlaceOfBusiness.publicRegisterLine1,
        govUk: {
          error: {
            title: i18n.govUk.error.title
          }
        },
        errors: pageRouting.errors,
        data: pageRouting.data
      }
    };
  }

}
