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
import UIErrors from "../../../domain/entities/UIErrors";

type PartnerData = {
  person: {
    description: string;
    kind: PartnerKind;
  };
  legalEntity: {
    description: string;
    kind: PartnerKind;
  };
  needAppointment?: boolean;
};

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
        const { pageRouting, limitedPartnership, partner } = await this.getPartnerData(request);

        response.render(CEASE_DATE_TEMPLATE, super.makeProps(pageRouting, { limitedPartnership, partner }, null));
      } catch (error) {
        next(error);
      }
    };
  }

  getUpdatePartner(partnerType: PartnerType) {
    return async (request: Request, response: Response, next: NextFunction) => {
      try {
        const { pageRouting, limitedPartnership, partner } = await this.getPartnerData(request);

        response.render(super.templateName(pageRouting.currentUrl), super.makeProps(pageRouting, { limitedPartnership, [partnerType]: partner }, null));
      } catch (error) {
        next(error);
      }
    };
  }

  async getPartnerData(request: Request) {
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

    if (ids.limitedPartnerId) {
      partner = await this.limitedPartnerService.getLimitedPartner(tokens, ids.transactionId, ids.limitedPartnerId);
    }
    return { pageRouting, limitedPartnership, partner };
  }

  createPartner(partner: PartnerType, data?: PartnerData) {
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

          result = await this.setResultFromAppointment(
            request,
            resultAppointment,
            isLegalEntity,
            data,
            partner,
            result,
            resultTransaction
          );
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

  private async setResultFromAppointment(
    request: Request,
    resultAppointment: any,
    isLegalEntity: boolean,
    data: PartnerData,
    partner: PartnerType,
    result: any,
    resultTransaction: { transactionId: string; errors?: UIErrors }
  ) {
    const { tokens, ids } = super.extract(request);

    const dataToSend = {
      forename: resultAppointment?.partner.data?.forename,
      surname: resultAppointment?.partner.data?.surname,
      legal_entity_name: resultAppointment?.partner.data?.legal_entity_name,
      date_of_birth: resultAppointment?.partner.data?.date_of_birth,

      ...request.body,

      appointment_id: ids.appointmentId,
      kind: isLegalEntity ? data?.legalEntity.kind : data?.person.kind
    };

    console.log("CHECK DATA TO SEND", resultAppointment, dataToSend);

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
    return result;
  }
}

export default PostTransitionPartnerController;
