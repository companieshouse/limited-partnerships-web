import { NatureOfControl } from "@companieshouse/api-sdk-node/dist/services/limited-partnerships";
import UIErrors from "../entities/UIErrors";

export type NatureOfControlUIFields = NatureOfControl & { share_of_assets?: string; voting_rights?: string };
class NatureOfControlValidator {
  private natureOfControl?: NatureOfControlUIFields;

  private errorMessages: Record<string, any> = {};

  set(natureOfControl: NatureOfControlUIFields, i18n: any): this {
    this.natureOfControl = natureOfControl;
    this.errorMessages = i18n?.errorMessages?.personWithSignificantControl?.addNatureOfControl || {};
    return this;
  }

  runValidation(): UIErrors {
    const uiErrors = new UIErrors();
    this.validateIndividual(uiErrors);
    return uiErrors;
  }

  validateIndividual(uiErrors: UIErrors): void {
    if (!this.hasShareOfAssets()) {
      uiErrors.setWebError("share_of_assets", this.errorMessages.individual.shareOfAssetsMissing);
    }

    if (!this.hasVotingRights()) {
      uiErrors.setWebError("voting_rights", this.errorMessages.individual.votingRightsMissing);
    }

    // Cannot select both right to appointment and remove and significant influence control
    if (this.natureOfControl?.right_to_appointment_and_remove && this.natureOfControl?.significant_influence_control) {
      uiErrors.setWebError("significant_influence_control", this.errorMessages.individual.significantInfluence);
    }

    // Cannot select significant influence control and any share of assets or voting rights percentages
    if (
      this.natureOfControl?.significant_influence_control &&
      (this.hasShareOfAssetsPercentage() || this.hasVotingRightsPercentage())
    ) {
      uiErrors.setWebError("significant_influence_control", this.errorMessages.individual.significantInfluence);
    }

    // If no share of assets or voting rights percentages are selected, then either right to appointment and remove or significant influence control must be selected
    if (
      !this.hasShareOfAssetsPercentage() &&
      !this.hasVotingRightsPercentage() &&
      !this.natureOfControl?.right_to_appointment_and_remove &&
      !this.natureOfControl?.significant_influence_control
    ) {
      uiErrors.setWebError("share_of_assets", this.errorMessages.individual.youMustSelectAtLeastOne);
    }
  }

  private hasShareOfAssetsPercentage() {
    return (
      this.natureOfControl?.share_of_assets_25_to_50 ||
      this.natureOfControl?.share_of_assets_50_to_75 ||
      this.natureOfControl?.share_of_assets_75_to_100
    );
  }

  private hasVotingRightsPercentage() {
    return (
      this.natureOfControl?.voting_rights_25_to_50 ||
      this.natureOfControl?.voting_rights_50_to_75 ||
      this.natureOfControl?.voting_rights_75_to_100
    );
  }

  private hasShareOfAssets() {
    return this.hasShareOfAssetsPercentage() || this.natureOfControl?.share_of_assets_does_not_apply;
  }

  private hasVotingRights() {
    return this.hasVotingRightsPercentage() || this.natureOfControl?.voting_rights_does_not_apply;
  }
}

export default NatureOfControlValidator;
