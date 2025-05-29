export const appendLangParamToUrl = (currentUrl: string, redirectUrl: string): string => {
  try {
    const currentUrlParams = new URLSearchParams(new URL(`http://${currentUrl}`)?.search);
    const redirectUrlParams = new URLSearchParams(new URL(`http://${redirectUrl}`)?.search);

    if (redirectUrlParams.has("lang")) {
      return redirectUrl;
    }
    if (currentUrlParams.has("lang")) {
      const langQuery = `?lang=${currentUrlParams.get("lang")}`;
      return `${redirectUrl}${langQuery}`;
    }
    return redirectUrl;
  } catch {
    return redirectUrl;
  }
};
