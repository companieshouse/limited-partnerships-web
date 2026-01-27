import { PartnerKind, PartnershipKind } from "@companieshouse/api-sdk-node/dist/services/limited-partnerships";

import { Request, Response, NextFunction } from "express";
import { IDependencies } from "../config";
import postTransitionRouting from "../presentation/controller/postTransition/routing";
import postTransitionAddressRouting from "../presentation/controller/addressLookUp/routing/postTransition/routing";
import globalsRouting from "../presentation/controller/global/Routing";
import { RESUME } from "../presentation/controller/global/url";

export const serviceNameKindMap = {
  [PartnershipKind.UPDATE_PARTNERSHIP_NAME]: "updateLimitedPartnershipName",
  [PartnershipKind.UPDATE_PARTNERSHIP_TERM]: "updateLimitedPartnershipTerm",
  [PartnershipKind.UPDATE_PARTNERSHIP_REGISTERED_OFFICE_ADDRESS]: "updateLimitedPartnershipRegisteredOfficeAddress",
  [PartnershipKind.UPDATE_PARTNERSHIP_PRINCIPAL_PLACE_OF_BUSINESS_ADDRESS]: "updateLimitedPartnershipPrincipalPlaceOfBusinessAddress",
  [PartnershipKind.UPDATE_PARTNERSHIP_REDESIGNATE_TO_PFLP]: "updateLimitedPartnershipRedesignateToPFLP",
  [PartnerKind.ADD_GENERAL_PARTNER_PERSON]: "addGeneralPartner",
  [PartnerKind.ADD_GENERAL_PARTNER_LEGAL_ENTITY]: "addGeneralPartner",
  [PartnerKind.ADD_LIMITED_PARTNER_PERSON]: "addLimitedPartner",
  [PartnerKind.ADD_LIMITED_PARTNER_LEGAL_ENTITY]: "addLimitedPartner",
  [PartnerKind.REMOVE_GENERAL_PARTNER_LEGAL_ENTITY]: "removeGeneralPartnerEntity",
  [PartnerKind.REMOVE_GENERAL_PARTNER_PERSON]: "removeGeneralPartnerPerson",
  [PartnerKind.REMOVE_LIMITED_PARTNER_LEGAL_ENTITY]: "removeLimitedPartnerEntity",
  [PartnerKind.REMOVE_LIMITED_PARTNER_PERSON]: "removeLimitedPartnerPerson",
  [PartnerKind.UPDATE_GENERAL_PARTNER_PERSON]: "updateGeneralPartnerPerson",
  // Add other mappings as needed
};

export const setServiceName = (dependencies: IDependencies) =>
  async (request: Request, response: Response, next: NextFunction): Promise<void> => {
    try {
      if (response.locals.journeyTypes.isRegistration || response.locals.journeyTypes.isTransition) {
        return next();
      }

      if (request.path.endsWith(RESUME)) {
        return next();
      }

      // Post-transition journey (set service name based on transaction resource kind or routing)
      const defaultServiceName = response.locals.i18n.servicePostTransition;
      const { tokens, ids, pageType } = dependencies.globalController.extract(request);

      if (ids.transactionId) {
        const transaction = await dependencies.transactionService.getTransaction(tokens, ids.transactionId);
        const kind = Object.values(transaction?.resources ?? {})[0]?.kind;
        response.locals.serviceName = response.locals.i18n.serviceName[serviceNameKindMap[kind ?? ""]] ?? defaultServiceName;
        return next();
      }

      // If no ids found, fall back to routing-based service name
      const combinedRouting = new Map([...globalsRouting, ...postTransitionRouting, ...postTransitionAddressRouting]);
      const pageRouting = dependencies.globalController.getRouting(combinedRouting, pageType, request);
      response.locals.serviceName = response.locals.i18n.serviceName[pageRouting.data?.serviceName ?? ""] ?? defaultServiceName;
      return next();

    } catch (error) {
      next(error);
    }
  };
