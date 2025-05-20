import { REGISTRATION_BASE_URL, TRANSITION_BASE_URL } from "../config";
import { Journey, JourneyTypes } from "../domain/entities/journey";

export const getJourneyTypes = (url: string): JourneyTypes => {
  const isRegistration = url.startsWith(REGISTRATION_BASE_URL);
  const isTransition = url.startsWith(TRANSITION_BASE_URL);

  const journey = isRegistration ? Journey.registration : Journey.transition;

  return {
    isRegistration,
    isTransition,
    journey
  };
};
