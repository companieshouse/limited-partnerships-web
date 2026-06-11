import { Request, Response, NextFunction } from "express";
import { IDependencies } from "../config";
import postTransitionRouting from "../presentation/controller/postTransition/routing";
import postTransitionAddressRouting from "../presentation/controller/addressLookUp/routing/postTransition/routing";
import globalsRouting from "../presentation/controller/global/Routing";
import { serviceNameKindMap } from "../config/service-name-kind-map";

export const customerFeedbackUrlMap: Record<string, string> = {
  registration: "https://www.smartsurvey.co.uk/s/register-a-lp-fdbk/",
  transition: "https://www.smartsurvey.co.uk/s/prov-new-requ-info-about-lp-fdbk/",
  updateLimitedPartnershipName: "https://www.smartsurvey.co.uk/s/update-lp-name-fdbk/",
  updateLimitedPartnershipTerm: "https://www.smartsurvey.co.uk/s/update-the-term-of-lp-fdbk/",
  updateLimitedPartnershipRegisteredOfficeAddress: "https://www.smartsurvey.co.uk/s/update-a-lp-reg-office-add-fdbk/",
  updateLimitedPartnershipPrincipalPlaceOfBusinessAddress: "https://www.smartsurvey.co.uk/s/update-a-lp-principal-office-add-fdbk/",
  updateLimitedPartnershipRedesignateToPFLP: "https://www.smartsurvey.co.uk/s/designate-a-lp-as-priv-fund-lp-feedback/",
  addGeneralPartner: "https://www.smartsurvey.co.uk/s/add-a-general-partner-fdbk/",
  addLimitedPartner: "https://www.smartsurvey.co.uk/s/add-a-limited-partner-fdbk/",
  removeGeneralPartnerEntity: "https://www.smartsurvey.co.uk/s/remove-a-general-partner-fdbk/",
  removeGeneralPartnerPerson: "https://www.smartsurvey.co.uk/s/remove-a-general-partner-fdbk/",
  removeLimitedPartnerEntity: "https://www.smartsurvey.co.uk/s/remove-a-limited-partner-fdbk/",
  removeLimitedPartnerPerson: "https://www.smartsurvey.co.uk/s/remove-a-limited-partner-fdbk/",
  updateGeneralPartnerPerson: "https://www.smartsurvey.co.uk/s/updt-gen-partners-dtls-fdbk/",
  updateGeneralPartnerLegalEntity: "https://www.smartsurvey.co.uk/s/updt-gen-partners-dtls-fdbk/",
  updateLimitedPartnerPerson: "https://www.smartsurvey.co.uk/s/updt-ltd-partners-dtls-fdbk/",
  updateLimitedPartnerLegalEntity: "https://www.smartsurvey.co.uk/s/updt-ltd-partners-dtls-fdbk/"
};

const combinedRouting = new Map([
  ...globalsRouting,
  ...postTransitionRouting,
  ...postTransitionAddressRouting
]);

export const setCustomerFeedbackUrl = (dependencies: IDependencies) =>
  async (request: Request, response: Response, next: NextFunction): Promise<void> => {
    try {
      const { journeyTypes } = response.locals;
      let key: string | undefined;

      if (journeyTypes.isRegistration) {
        key = "registration";
      } else if (journeyTypes.isTransition) {
        key = "transition";
      } else if (journeyTypes.isPostTransition) {
        const { tokens, ids, pageType } = dependencies.globalController.extract(request);

        if (ids.transactionId) {
          const transaction = await dependencies.transactionService.getTransaction(tokens, ids.transactionId);
          const kind = Object.values(transaction?.resources ?? {})[0]?.kind;
          key = serviceNameKindMap[kind ?? ""];
        } else {
          // If no ids found, fall back to routing-based approach to determine service name (and therefore customer feedback url)
          const pageRouting = dependencies.globalController.getRouting(combinedRouting, pageType, request);
          key = pageRouting.data?.serviceName;
        }
      }

      response.locals.customerFeedbackUrl =
        (key && customerFeedbackUrlMap[key]) || "";

      return next();

    } catch (error) {
      return next(error);
    }
  };
