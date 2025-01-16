import RegistrationPageType from "./registration/PageType";
import GlobalPageType from "./global/PageType";
import AddressPageType from "./addressLookUp/PageType";

type PageType = RegistrationPageType | GlobalPageType | AddressPageType;

export default PageType;
