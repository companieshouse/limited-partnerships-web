import { NextFunction, Request, Response } from "express";
import { IncorporationKind, PartnerKind } from "@companieshouse/api-sdk-node/dist/services/limited-partnerships/types";

import LimitedPartnershipService from "../../../application/service/LimitedPartnershipService";
import GeneralPartnerService from "../../../application/service/GeneralPartnerService";
import LimitedPartnerService from "../../../application/service/LimitedPartnerService";
import CompanyService from "../../../application/service/CompanyService";
import TransactionService from "../../../application/service/TransactionService";

import PartnerController, { PartnerType } from "../common/PartnerController";
import PostTransitionPageType from "./pageType";
import postTransitionRouting from "./routing";
import { CEASE_DATE_TEMPLATE } from "../../../config/constants";

class PostTransitionPartnerController extends PartnerController {
  constructor(
    limitedPartnershipService: LimitedPartnershipService,
    generalPartnerService: GeneralPartnerService,
    limitedPartnerService: LimitedPartnerService,
    companyService: CompanyService,
    private readonly transactionService: TransactionService
  ) {
    super(limitedPartnershipService, generalPartnerService, limitedPartnerService, companyService);
  }

  getCeaseDate() {
    return async (request: Request, response: Response, next: NextFunction) => {
      try {
        const { ids, pageType, tokens } = super.extract(request);
        const pageRouting = super.getRouting(postTransitionRouting, pageType, request);

        let limitedPartnership = {};
        let partner = {};

        if (this.companyService) {
          const { limitedPartnership: lp } = await this.companyService.buildLimitedPartnershipFromCompanyProfile(
            tokens,
            ids.companyId
          );

          limitedPartnership = lp;

          if (ids.appointmentId) {
            const { partner: pt } = await this.companyService.buildPartnerFromCompanyAppointment(
              tokens,
              ids.companyId,
              ids.appointmentId
            );

            partner = pt;
          }
        }

        if (ids.generalPartnerId) {
          partner = await this.generalPartnerService.getGeneralPartner(tokens, ids.transactionId, ids.generalPartnerId);
        }

        response.render(CEASE_DATE_TEMPLATE, super.makeProps(pageRouting, { limitedPartnership, partner }, null));
      } catch (error) {
        next(error);
      }
    };
  }

  createPartner(
    partner: PartnerType,
    data?: {
      person: {
        description: string;
        kind: PartnerKind;
      };
      legalEntity: {
        description: string;
        kind: PartnerKind;
      };
      needAppointment?: boolean;
    }
  ) {
    return async (request: Request, response: Response, next: NextFunction) => {
      try {
        const { tokens, ids } = super.extract(request);
        const pageType = super.extractPageTypeOrThrowError(request, PostTransitionPageType);
        const pageRouting = super.getRouting(postTransitionRouting, pageType, request);

        const limitedPartnershipResult = await this.companyService?.buildLimitedPartnershipFromCompanyProfile(
          tokens,
          ids.companyId
        );

        const isLegalEntity =
          pageType === PostTransitionPageType.addGeneralPartnerLegalEntity ||
          pageType === PostTransitionPageType.whenDidTheGeneralPartnerLegalEntityCease ||
          pageType === PostTransitionPageType.addLimitedPartnerLegalEntity ||
          pageType === PostTransitionPageType.whenDidTheLimitedPartnerLegalEntityCease;

        const limitedPartnershipData = limitedPartnershipResult?.limitedPartnership?.data;

        const resultTransaction = await this.transactionService.createTransaction(
          tokens,
          IncorporationKind.POST_TRANSITION,
          {
            companyName: limitedPartnershipData?.partnership_name ?? "",
            companyNumber: limitedPartnershipData?.partnership_number ?? ""
          },
          isLegalEntity ? data?.legalEntity.description : data?.person.description
        );

        let result: any = {};
        let resultAppointment;

        if (data?.needAppointment) {
          resultAppointment = await this.companyService?.buildPartnerFromCompanyAppointment(
            tokens,
            ids.companyId,
            ids.appointmentId
          );

          const dataToSend = {
            ...request.body,

            forename: resultAppointment?.partner.data?.forename,
            surname: resultAppointment?.partner.data?.surname,
            legal_entity_name: resultAppointment?.partner.data?.legal_entity_name,
            date_of_birth: resultAppointment?.partner.data?.date_of_birth,
            appointment_id: ids.appointmentId,

            kind: isLegalEntity ? data?.legalEntity.kind : data?.person.kind
          };

          if (partner === PartnerType.generalPartner) {
            result = await this.generalPartnerService.createGeneralPartner(
              tokens,
              resultTransaction.transactionId,
              dataToSend
            );
          } else if (partner === PartnerType.limitedPartner) {
            result = await this.limitedPartnerService.createLimitedPartner(
              tokens,
              resultTransaction.transactionId,
              dataToSend
            );
          }
        } else {
          const dataToSend = {
            ...request.body,
            kind: isLegalEntity ? data?.legalEntity.kind : data?.person.kind
          };

          if (partner === PartnerType.generalPartner) {
            result = await this.generalPartnerService.createGeneralPartner(
              tokens,
              resultTransaction.transactionId,
              dataToSend
            );
          } else if (partner === PartnerType.limitedPartner) {
            result = await this.limitedPartnerService.createLimitedPartner(
              tokens,
              resultTransaction.transactionId,
              dataToSend
            );
          }
        }

        if (result.errors) {
          super.resetFormerNamesIfPreviousNameIsFalse(request.body);

          const { data: renderData, url } = super.buildPartnerErrorRenderData(
            pageType,
            pageRouting,
            limitedPartnershipResult?.limitedPartnership,
            resultAppointment?.partner,
            request.body,
            partner === PartnerType.generalPartner ? "generalPartner" : "limitedPartner"
          );

          response.render(super.templateName(url), super.makeProps(pageRouting, renderData, result.errors));
          return;
        }

        const newIds = {
          ...ids,
          transactionId: resultTransaction.transactionId,
          generalPartnerId: result?.generalPartnerId,
          limitedPartnerId: result?.limitedPartnerId
        };

        const url = super.insertIdsInUrl(pageRouting.nextUrl, newIds);

        response.redirect(url);
      } catch (error) {
        next(error);
      }
    };
  }
}

export default PostTransitionPartnerController;
