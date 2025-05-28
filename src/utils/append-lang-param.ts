export const appendLangParamToUrl = (currentUrl: string, redirectUrl: string): string => {
  try {
    const currentUrlParams = new URLSearchParams(new URL(`http://${currentUrl}`)?.search);
    const redirectUrlObj = new URL(redirectUrl, `http://${redirectUrl}`);

    if (redirectUrlObj.searchParams.has("lang")) {
      return redirectUrl;
    }
    if (currentUrlParams.has("lang")) {
      const langQuery = `?lang=${currentUrlParams.get("lang")}`;
      console.log(`Added the param! ${redirectUrl}${langQuery}`);
      return `${redirectUrl}${langQuery}`;
    }
    return redirectUrl;
  } catch {
    return redirectUrl;
  }
};
