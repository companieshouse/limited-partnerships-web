import RegistrationPageType from "./registration/PageType";
import GlobalPageType from "./global/PageType";
import AddressPageType from "./addressLookUp/PageType";
import TransitionPageType from "./transition/PageType";
import PostTransitionPageType from "./postTransition/pageType";

type PageType = RegistrationPageType | GlobalPageType | AddressPageType | TransitionPageType | PostTransitionPageType;

export default PageType;
