import { LimitedPartnership } from "@companieshouse/api-sdk-node/dist/services/limited-partnerships";
import { PageRouting } from "../../../../presentation/controller/PageRouting";
import { ITemplateOptionsGenerator } from "./ITemplateOptionsGenerator";

class PostcodeROATemplateOptions implements ITemplateOptionsGenerator {

  getOptions(pageRouting: PageRouting,
             limitedPartnership: LimitedPartnership,
             i18n: any): any {
    return {
      templateOptions: {
        baseTemplate: "layout.njk",
        whatIsOfficeAddress: i18n.address.findPostcode.registeredOfficeAddress.whatIsOfficeAddress,
        proposedName: `${limitedPartnership.data?.partnership_name?.toUpperCase()} ${limitedPartnership.data?.name_ending?.toUpperCase()}`,
        officialCommunication: i18n.address.findPostcode.registeredOfficeAddress.officialCommunication,
        partnership_type: limitedPartnership.data?.partnership_type,
        england: {
          physicalAddress: i18n.address.findPostcode.registeredOfficeAddress.england.physicalAddress,
          jurisdiction: i18n.address.findPostcode.registeredOfficeAddress.england.jurisdiction
        },
        scotland: {
          physicalAddress: i18n.address.findPostcode.registeredOfficeAddress.scotland.physicalAddress,
          jurisdiction: i18n.address.findPostcode.registeredOfficeAddress.scotland.jurisdiction
        },
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

export default PostcodeROATemplateOptions;
