import { NextFunction, Request, Response } from "express";

/**
 * Strips trailing slashes from URLs and redirects to the clean URL.
 * This ensures /path/ resolves the same as /path.
 */
export const trailingSlashMiddleware = (req: Request, res: Response, next: NextFunction) => {
  if (req.path.length > 1 && req.path.endsWith("/")) {
    const cleanPath = req.path.slice(0, -1);
    const query = req.url.slice(req.path.length);
    return res.redirect(301, cleanPath + query);
  }

  return next();
};
