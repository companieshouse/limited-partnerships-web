import { JourneyTypes } from "../domain/entities/journey";

export const showContinueButton = (journeyTypes: JourneyTypes, serviceName: string, i18n: Record<string, any>): boolean => {
  if (!journeyTypes.isPostTransition) {
    return false;
  }

  if (serviceName === i18n.serviceName.addGeneralPartner || serviceName === i18n.serviceName.addLimitedPartner) {
    return false;
  }

  return true;
};
