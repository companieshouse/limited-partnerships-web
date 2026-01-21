import { GeneralPartner, LimitedPartner, PartnershipKind } from "@companieshouse/api-sdk-node/dist/services/limited-partnerships";

import { Request, Response, NextFunction } from "express";
import { IDependencies, SERVICE_NAME_POST_TRANSITION } from "../config";
import postTransitionRouting from "../presentation/controller/postTransition/routing";
import postTransitionAddressRouting from "../presentation/controller/addressLookUp/routing/postTransition/routing";

const serviceNameKindMap = {
  [PartnershipKind.UPDATE_PARTNERSHIP_NAME]: "Update Limited Partnership Name",
  // Add other mappings as needed
};

export const setServiceName = (dependencies: IDependencies) =>
  async (request: Request, response: Response, next: NextFunction): Promise<void> => {
    try {
      console.log("********* setServiceName middleware triggered", request.baseUrl);
      const defaultServiceName = SERVICE_NAME_POST_TRANSITION;
      const { tokens, ids, pageType } = dependencies.globalController.extract(request);

      if (ids.submissionId) {
        const limitedPartnership = await dependencies.limitedPartnershipService.getLimitedPartnership(
          tokens,
          ids.transactionId,
          ids.submissionId
        );
        response.locals.serviceName = serviceNameKindMap[limitedPartnership.data?.kind ?? ""] ?? defaultServiceName;
        return next();
      }

      if (ids.generalPartnerId || ids.limitedPartnerId) {
        const { generalPartner, limitedPartner } = await dependencies.globalController.getPartnerDetails(tokens, ids.transactionId);
        const partner: GeneralPartner | LimitedPartner | undefined = generalPartner ?? limitedPartner;

        response.locals.serviceName = serviceNameKindMap[partner?.data?.kind ?? ""] ?? defaultServiceName;
        return next();
      }

      const combinedRouting = new Map([...postTransitionRouting, ...postTransitionAddressRouting]);
      const pageRouting = dependencies.globalController.getRouting(combinedRouting, pageType, request);
      console.log("********* Page Routing Data:", pageRouting.data);
      response.locals.serviceName = pageRouting.data?.serviceName ?? defaultServiceName;
      console.log("********* Service Name:", response.locals.serviceName);
      return next();

    } catch (error) {
      next(error);
    }
  };
