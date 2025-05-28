import { appendLangParamToUrl } from "../../../../utils/append-lang-param";
import { ADD_GENERAL_PARTNER_LEGAL_ENTITY_URL, REVIEW_GENERAL_PARTNERS_URL } from "../../../controller/registration/url";

describe('appendLangParamToUrl test suite', () => {
  it('should append "?lang=cy" to redirect url', () => {
    const currentUrl = `${REVIEW_GENERAL_PARTNERS_URL}?lang=cy`;
    const redirectUrl = `${ADD_GENERAL_PARTNER_LEGAL_ENTITY_URL}`;

    const resultRedirectUrl = appendLangParamToUrl(currentUrl, redirectUrl);

    expect(resultRedirectUrl).toBe(`${ADD_GENERAL_PARTNER_LEGAL_ENTITY_URL}?lang=cy`);
  });

  it('should not append "?lang=cy" to redirect url if currentUrl does not contain query param', () => {
    const currentUrl = `${REVIEW_GENERAL_PARTNERS_URL}`;
    const redirectUrl = `${ADD_GENERAL_PARTNER_LEGAL_ENTITY_URL}`;

    const resultRedirectUrl = appendLangParamToUrl(currentUrl, redirectUrl);

    expect(resultRedirectUrl).toBe(`${ADD_GENERAL_PARTNER_LEGAL_ENTITY_URL}`);
  });

  it('should not append "?lang=cy" to redirect url if redirectUrl already has query param', () => {
    const currentUrl = `${REVIEW_GENERAL_PARTNERS_URL}?lang=cy`;
    const redirectUrl = `${ADD_GENERAL_PARTNER_LEGAL_ENTITY_URL}?lang=cy`;

    const resultRedirectUrl = appendLangParamToUrl(currentUrl, redirectUrl);

    expect(resultRedirectUrl).toBe(`${ADD_GENERAL_PARTNER_LEGAL_ENTITY_URL}?lang=cy`);
  });
});
