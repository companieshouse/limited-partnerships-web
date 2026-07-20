import { NatureOfControl, NatureOfControlType } from "@companieshouse/api-sdk-node/dist/services/limited-partnerships";
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
    if (this.natureOfControl?.type === NatureOfControlType.INDIVIDUAL) {
      this.validateIndividual(uiErrors);
    }
    if (this.natureOfControl?.type === NatureOfControlType.FIRM) {
      this.validateFirm(uiErrors);
    }
    if (this.natureOfControl?.type === NatureOfControlType.TRUST) {
      this.validateTrust(uiErrors);
    }
    return uiErrors;
  }

  validateIndividual(uiErrors: UIErrors): void {
    if (!this.hasShareOfAssets()) {
      uiErrors.setWebError("share_of_assets", this.errorMessages.individual.shareOfAssetsMissing);
    }

    if (!this.hasVotingRights()) {
      uiErrors.setWebError("voting_rights", this.errorMessages.individual.votingRightsMissing);
    }

    // Cannot select significant influence control and shareOfAssetsPercentage, votingRightsPercentage or rightToAppointmentAndRemove
    if (
      this.natureOfControl?.significant_influence_control &&
      (this.natureOfControl?.right_to_appointment_and_remove ||
        this.hasShareOfAssetsPercentage() ||
        this.hasVotingRightsPercentage())
    ) {
      uiErrors.setWebError("significant_influence_control", this.errorMessages.individual.significantInfluence);
    }

    // If no share of assets or voting rights percentages are selected, then either right to appointment and remove or significant influence control must be selected
    this.hasSelectAtLeastOne(uiErrors, this.natureOfControl?.type);
  }

  validateFirm(uiErrors: UIErrors): void {
    if (!this.hasShareOfAssets()) {
      uiErrors.setWebError("share_of_assets", this.errorMessages.firm.shareOfAssetsMissing);
    }

    if (!this.hasVotingRights()) {
      uiErrors.setWebError("voting_rights", this.errorMessages.firm.votingRightsMissing);
    }

    this.hasSelectAtLeastOne(uiErrors, this.natureOfControl?.type);
  }

  validateTrust(uiErrors: UIErrors): void {
    if (!this.hasShareOfAssets()) {
      uiErrors.setWebError("share_of_assets", this.errorMessages.trust.shareOfAssetsMissing);
    }

    if (!this.hasVotingRights()) {
      uiErrors.setWebError("voting_rights", this.errorMessages.trust.votingRightsMissing);
    }

    this.hasSelectAtLeastOne(uiErrors, this.natureOfControl?.type);
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

  private hasSelectAtLeastOne(uiErrors: UIErrors, type?: string) {
    const typeToLowerCase = type?.toLocaleLowerCase() ?? "";

    if (
      !this.hasShareOfAssetsPercentage() &&
      !this.hasVotingRightsPercentage() &&
      !this.natureOfControl?.right_to_appointment_and_remove &&
      !this.natureOfControl?.significant_influence_control
    ) {
      uiErrors.setWebError("", this.errorMessages[typeToLowerCase].youMustSelectAtLeastOne);
    }
  }
}

export default NatureOfControlValidator;
