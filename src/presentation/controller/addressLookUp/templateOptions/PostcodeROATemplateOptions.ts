import { LimitedPartnership } from "@companieshouse/api-sdk-node/dist/services/limited-partnerships";
import { PageRouting } from "../../PageRouting";
import { ITemplateOptions } from "./ITemplateOptions";

export class PostcodeROATemplateOptions implements ITemplateOptions {

  templateName = "postcode-lookup";

  getOptions(
    pageRouting: PageRouting,
    limitedPartnership: LimitedPartnership,
    i18n: any
  ): any {
    let hint2 = undefined, hint3 = undefined;
    if (limitedPartnership.data?.partnership_type === "LP" || limitedPartnership.data?.partnership_type === "PFLP") {
      hint2 = i18n.address.findPostcode.registeredOfficeAddress.england.physicalAddress;
      hint3 = i18n.address.findPostcode.registeredOfficeAddress.england.jurisdiction;
    } else {
      hint2 = i18n.address.findPostcode.registeredOfficeAddress.scotland.physicalAddress;
      hint3 = i18n.address.findPostcode.registeredOfficeAddress.scotland.jurisdiction;
    }
    return {
      templateOptions: {
        baseTemplate: "layout.njk",
        whatIsOfficeAddress: i18n.address.findPostcode.registeredOfficeAddress.whatIsOfficeAddress,
        proposedName: `${limitedPartnership.data?.partnership_name?.toUpperCase()} ${limitedPartnership.data?.name_ending?.toUpperCase()}`,
        hint1: i18n.address.findPostcode.registeredOfficeAddress.officialCommunication,
        hint2,
        hint3,
        partnership_type: limitedPartnership.data?.partnership_type,
        postcodeErrorMessage: i18n.address.findPostcode.errorPostcode,
        templateName: pageRouting.pageType,
        nameOrNumberHint: i18n.address.findPostcode.nameOrNumberHint,
        postcodeHint: i18n.address.findPostcode.postcodeHint,
        enterManualAddressUrl: pageRouting.currentUrl?.replace(pageRouting.pageType, pageRouting.data?.enterManualAddressPageType),
        enterAddressManually: i18n.address.findPostcode.enterAddressManually,
        findAddress: i18n.address.findPostcode.findAddress,
        publicRegisterTitle: i18n.address.findPostcode.registeredOfficeAddress.publicRegisterTitle,
        publicRegisterLine1: i18n.address.findPostcode.registeredOfficeAddress.publicRegisterLine1,
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
