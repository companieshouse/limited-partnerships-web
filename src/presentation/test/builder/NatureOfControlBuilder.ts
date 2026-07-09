import { NatureOfControl, NatureOfControlType } from "@companieshouse/api-sdk-node/dist/services/limited-partnerships";

class NatureOfControlBuilder {
  private type: NatureOfControlType = NatureOfControlType.INDIVIDUAL;
  private share_of_assets_25_to_50: boolean = false;
  private share_of_assets_50_to_75: boolean = false;
  private share_of_assets_75_to_100: boolean = false;
  private share_of_assets_does_not_apply: boolean = false;
  private voting_rights_25_to_50: boolean = false;
  private voting_rights_50_to_75: boolean = false;
  private voting_rights_75_to_100: boolean = false;
  private voting_rights_does_not_apply: boolean = false;
  private right_to_appointment_and_remove: boolean = false;
  private significant_influence_control: boolean = false;

  withType(type: NatureOfControlType) {
    this.type = type;
    return this;
  }

  withShareOfAssets25To50() {
    this.share_of_assets_25_to_50 = true;
    return this;
  }

  withShareOfAssets50To75() {
    this.share_of_assets_50_to_75 = true;
    return this;
  }

  withShareOfAssets75To100() {
    this.share_of_assets_75_to_100 = true;
    return this;
  }

  withShareOfAssetsDoesNotApply() {
    this.share_of_assets_does_not_apply = true;
    return this;
  }

  withVotingRights25To50() {
    this.voting_rights_25_to_50 = true;
    return this;
  }

  withVotingRights50To75() {
    this.voting_rights_50_to_75 = true;
    return this;
  }

  withVotingRights75To100() {
    this.voting_rights_75_to_100 = true;
    return this;
  }

  withVotingRightsDoesNotApply() {
    this.voting_rights_does_not_apply = true;
    return this;
  }

  withRightToAppointmentAndRemove() {
    this.right_to_appointment_and_remove = true;
    return this;
  }

  withSignificantInfluenceControl() {
    this.significant_influence_control = true;
    return this;
  }

  build(): NatureOfControl {
    return {
      type: this.type,
      share_of_assets_25_to_50: this.share_of_assets_25_to_50,
      share_of_assets_50_to_75: this.share_of_assets_50_to_75,
      share_of_assets_75_to_100: this.share_of_assets_75_to_100,
      share_of_assets_does_not_apply: this.share_of_assets_does_not_apply,
      voting_rights_25_to_50: this.voting_rights_25_to_50,
      voting_rights_50_to_75: this.voting_rights_50_to_75,
      voting_rights_75_to_100: this.voting_rights_75_to_100,
      voting_rights_does_not_apply: this.voting_rights_does_not_apply,
      right_to_appointment_and_remove: this.right_to_appointment_and_remove,
      significant_influence_control: this.significant_influence_control
    };
  }
}

export default NatureOfControlBuilder;
