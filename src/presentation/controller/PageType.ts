import RegistrationPageType from "./registration/PageType";
import GlobalPageType from "./global/PageType";
import AddressPageType from "./addressLookUp/PageType";
import TransitionPageType from "./transition/PageType";

type PageType = RegistrationPageType | GlobalPageType | AddressPageType | TransitionPageType;

export default PageType;
