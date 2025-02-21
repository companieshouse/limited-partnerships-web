import { ITemplateOptionsGenerator } from "./ITemplateOptionsGenerator";
import AddressLookUpPageType from "../PageType";
import PostcodeROATemplateOptions from "./PostcodeROATemplateOptions";
import PageType from "../../PageType";
import DefaultTemplateOptions from "./DefaultTemplateOptions";

export class TemplateOptionsGeneratorFactory {

  static getTemplateOptionsGenerator(pageType: PageType): ITemplateOptionsGenerator {

    if (pageType === AddressLookUpPageType.postcodeRegisteredOfficeAddress) {
      return new PostcodeROATemplateOptions();
    }
    return new DefaultTemplateOptions();
  }
}

