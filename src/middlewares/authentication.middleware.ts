import { Request, Response, NextFunction } from "express";

import { logger, checkUserSignedIn, getLoggedInUserEmail } from "../utils";
import { START_URL } from "../presentation/controller/global/Routing";

export const authentication = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    if (!checkUserSignedIn(req.session)) {
      logger.infoRequest(
        req,
        "User not authenticated, redirecting to sign in page, status_code=302"
      );

      const returnToUrl = START_URL;

      return res.redirect(`/signin?return_to=${returnToUrl}`);
    }

    const userEmail = getLoggedInUserEmail(req.session);

    logger.infoRequest(req, `User (${userEmail}) is signed in`);

    // Using the https://expressjs.com/en/5x/api.html#res.locals to make sure that the email
    // is available within a single request-response cycle and visible in the template.
    res.locals.userEmail = userEmail;

    next();
  } catch (err) {
    logger.errorRequest(req, err);
    next(err);
  }
};
