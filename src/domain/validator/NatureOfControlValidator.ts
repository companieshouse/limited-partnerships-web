import { NatureOfControl } from "@companieshouse/api-sdk-node/dist/services/limited-partnerships";
import UIErrors from "../entities/UIErrors";

class NatureOfControlValidator {
  private natureOfControl: NatureOfControl;

  private errorMessages: Record<string, any> = {};

  set(natureOfControl: NatureOfControl, i18n: any): this {
    this.natureOfControl = natureOfControl;
    this.errorMessages = i18n?.errorMessages?.natureOfControl || {};
    return this;
  }

  runValidation(): UIErrors {
    const uiErrors = new UIErrors();
    this.validateIndividual(uiErrors);
    return uiErrors;
  }

  validateIndividual(uiErrors: UIErrors): void {
    if (!this.hasShareOfAssets()){
      uiErrors.setWebError("share_of_assets", "No share of assets");
    }

    if (!this.hasVotingRights()){
      uiErrors.setWebError("voting_rights", "No voting rights");
    }

    // Cannot select both right to appointment and remove and significant influence control
    if (this.natureOfControl.right_to_appointment_and_remove && this.natureOfControl.significant_influence_control){
      uiErrors.setWebError("right_to_appointment_and_remove", "Cannot have both right to appointment and remove and significant influence control");
    }

    // Cannot select significant influence control and any share of assets or voting rights percentages
    if (this.natureOfControl.significant_influence_control && (this.hasShareOfAssetsPercentage() || this.hasVotingRightsPercentage())){
      uiErrors.setWebError("significant_influence_control", "Cannot have significant influence control and share of assets or voting rights percentages");
    }

    // If no share of assets or voting rights percentages are selected, then either right to appointment and remove or significant influence control must be selected
    if (!this.hasShareOfAssetsPercentage() && !this.hasVotingRightsPercentage() && !this.natureOfControl.right_to_appointment_and_remove && !this.natureOfControl.significant_influence_control){
      uiErrors.setWebError("share_of_assets", "If no share of assets or voting rights percentages are selected, then either right to appointment and remove or significant influence control must be selected");
    }
  }

  private hasShareOfAssetsPercentage(){
    return this.natureOfControl.share_of_assets_25_to_50 || this.natureOfControl.share_of_assets_50_to_75 || this.natureOfControl.share_of_assets_75_to_100;
  }

  private hasVotingRightsPercentage(){
    return this.natureOfControl.voting_rights_25_to_50 || this.natureOfControl.voting_rights_50_to_75 || this.natureOfControl.voting_rights_75_to_100;
  }

  private hasShareOfAssets(){
    return this.hasShareOfAssetsPercentage() || this.natureOfControl.share_of_assets_does_not_apply;
  }

  private hasVotingRights(){
    return this.hasVotingRightsPercentage() || this.natureOfControl.voting_rights_does_not_apply;
  }
}

export default NatureOfControlValidator;
