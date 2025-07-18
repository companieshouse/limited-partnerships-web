import { POST_TRANSITION_BASE_URL, REGISTRATION_BASE_URL, TRANSITION_BASE_URL } from "../config";
import { Journey, JourneyTypes } from "../domain/entities/journey";

export const getJourneyTypes = (url: string): JourneyTypes => {
  const isRegistration = url.startsWith(REGISTRATION_BASE_URL);
  const isTransition = url.startsWith(TRANSITION_BASE_URL);
  const isPostTransition = url.startsWith(POST_TRANSITION_BASE_URL);

  let journey;

  if (isRegistration) {
    journey = Journey.registration;
  } else if (isTransition) {
    journey = Journey.transition;
  } else {
    journey = Journey.postTransition;
  }

  return {
    isRegistration,
    isTransition,
    isPostTransition,
    journey
  };
};
