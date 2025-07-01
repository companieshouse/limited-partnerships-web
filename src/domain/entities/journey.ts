export enum Journey {
  registration = "registration",
  transition = "transition",
  postTransition = "update"
}

export type JourneyTypes = {
  isRegistration: boolean;
  isTransition: boolean;
  isPostTransition: boolean;
  journey: Journey;
};
