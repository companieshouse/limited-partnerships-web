import { ITemplateOptions } from "./ITemplateOptions";
import AddressLookUpPageType from "../PageType";
import PageType from "../../PageType";
import { DefaultTemplateOptions } from "./DefaultTemplateOptions";
import { PostcodeROATemplateOptions } from "./PostcodeROATemplateOptions";
import { PostcodePPOBTemplateOptions } from "./PostcodePPOBTemplateOptions";

export class TemplateOptionsFactory {

  static getTemplateOptions(pageType: PageType): ITemplateOptions {

    if (pageType === AddressLookUpPageType.postcodeRegisteredOfficeAddress) {
      return new PostcodeROATemplateOptions();
    }
    if (pageType === AddressLookUpPageType.postcodePrincipalPlaceOfBusinessAddress) {
      return new PostcodePPOBTemplateOptions();
    }
    // we would normally throw error here but poc is a mixture of local and external templates
    // so just ave a default one to keep the controller happy
    return new DefaultTemplateOptions();
  }
}
