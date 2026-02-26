import { NextFunction, Request, Response } from "express";
import { GeneralPartner, IncorporationKind, LimitedPartner, PartnerKind } from "@companieshouse/api-sdk-node/dist/services/limited-partnerships/types";

import LimitedPartnershipService from "../../../application/service/LimitedPartnershipService";
import GeneralPartnerService from "../../../application/service/GeneralPartnerService";
import LimitedPartnerService from "../../../application/service/LimitedPartnerService";
import CompanyService from "../../../application/service/CompanyService";
import TransactionService from "../../../application/service/TransactionService";

import PartnerController, { PartnerType } from "../common/PartnerController";
import PostTransitionPageType, { isLegalEntity } from "./pageType";
import postTransitionRouting from "./routing";
import { CEASE_DATE_TEMPLATE, CHANGE_CHECK_YOUR_ANSWERS_TYPE_SUFFIX, DATE_OF_UPDATE_TEMPLATE, PARTNER_CHANGE_CHECK_YOUR_ANSWERS_TEMPLATE, UPDATE_ADDRESS_YES_NO_TEMPLATE, UPDATE_ADDRESS_YES_NO_TYPE_SUFFIX } from "../../../config/constants";
import UIErrors from "../../../domain/entities/UIErrors";
import { Ids, Tokens } from "../../../domain/types";
import { formatDate } from "../../../utils/date-format";
import { isUpdateKind } from "../../../utils/kind";

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
        const { tokens, ids, pageType } = super.extract(request);
        const pageRouting = super.getRouting(postTransitionRouting, pageType, request);

        const { limitedPartnership, partner } = await this.getPartnershipAndPartnerData(tokens, ids);

        response.render(CEASE_DATE_TEMPLATE, super.makeProps(pageRouting, { limitedPartnership, partner }, null));
      } catch (error) {
        next(error);
      }
    };
  }

  getDateOfUpdate(partnerType: PartnerType) {
    return async (request: Request, response: Response, next: NextFunction) => {
      try {
        const { tokens, ids, pageType } = super.extract(request);
        const pageRouting = super.getRouting(postTransitionRouting, pageType, request);

        const { limitedPartnership, partner } = await this.getPartnershipAndPartnerData(tokens, ids);

        response.render(DATE_OF_UPDATE_TEMPLATE, super.makeProps(pageRouting, { limitedPartnership, partnerType, [partnerType]: partner }, null));
      } catch (error) {
        next(error);
      }
    };
  }

  getUpdatePartner(partnerType: PartnerType) {
    return async (request: Request, response: Response, next: NextFunction) => {
      try {
        const { tokens, ids, pageType } = super.extract(request);
        const pageRouting = super.getRouting(postTransitionRouting, pageType, request);

        const { limitedPartnership, partner } = await this.getPartnershipAndPartnerData(tokens, ids);

        let template = super.templateName(pageRouting.currentUrl);
        if (pageRouting.currentUrl.includes(UPDATE_ADDRESS_YES_NO_TYPE_SUFFIX)) {
          template = UPDATE_ADDRESS_YES_NO_TEMPLATE;
        }

        response.render(template, super.makeProps(pageRouting, { limitedPartnership, partnerType, [partnerType]: partner }, null));
      } catch (error) {
        next(error);
      }
    };
  }

  getCheckYourAnswersPageRouting(partnerType: PartnerType) {
    return async (request: Request, response: Response, next: NextFunction) => {
      try {
        const { tokens, pageType, ids } = super.extract(request);
        const pageRouting = super.getRouting(postTransitionRouting, pageType, request);

        let limitedPartnership = {};
        if (pageRouting.currentUrl.includes(CHANGE_CHECK_YOUR_ANSWERS_TYPE_SUFFIX)) {
          limitedPartnership = (await this.getPartnershipAndPartnerData(
            tokens,
            ids
          )).limitedPartnership;
        }

        let partner;
        if (partnerType === PartnerType.generalPartner) {
          partner = await this.generalPartnerService.getGeneralPartner(
            tokens,
            ids.transactionId,
            ids.generalPartnerId
          );
        } else {
          partner = await this.limitedPartnerService.getLimitedPartner(
            tokens,
            ids.transactionId,
            ids.limitedPartnerId
          );
        }

        if (partner?.data?.cease_date) {
          partner.data.cease_date = formatDate(partner.data.cease_date, response.locals.i18n);
        }

        let partnerUpdatedFieldsMap: Record<string, boolean> = {};
        if (isUpdateKind(partner?.data?.kind)) {
          partnerUpdatedFieldsMap = await this.comparePartnerDetails(partner, request);
        }

        response.render(PARTNER_CHANGE_CHECK_YOUR_ANSWERS_TEMPLATE, super.makeProps(pageRouting, { limitedPartnership, partner, partnerUpdatedFieldsMap, partnerType }, null));
      } catch (error) {
        next(error);
      }
    };
  }

  async getPartnershipAndPartnerData(tokens: Tokens, ids: Ids) {
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
    return { limitedPartnership, partner };
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

        const limitedPartnershipData = limitedPartnershipResult?.limitedPartnership?.data;

        const resultTransaction = await this.transactionService.createTransaction(
          tokens,
          IncorporationKind.POST_TRANSITION,
          {
            companyName: limitedPartnershipData?.partnership_name ?? "",
            companyNumber: limitedPartnershipData?.partnership_number ?? ""
          },
          isLegalEntity(pageType) ? data?.legalEntity.description : data?.person.description
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
            isLegalEntity(pageType),
            data,
            partner,
            result,
            resultTransaction
          );
        } else {
          const dataToSend = {
            ...request.body,
            kind: isLegalEntity(pageType) ? data?.legalEntity.kind : data?.person.kind
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

  private async comparePartnerDetails(
    partner: GeneralPartner | LimitedPartner,
    request: Request
  ) {
    const { tokens, ids } = super.extract(request);
    const appointmentId = partner.data?.appointment_id;

    let partnerUpdatedFieldsMap: Record<string, boolean>;

    if (partner.data?.kind === PartnerKind.UPDATE_GENERAL_PARTNER_PERSON || partner.data?.kind === PartnerKind.UPDATE_LIMITED_PARTNER_PERSON) {
      partnerUpdatedFieldsMap = {
        forename: false,
        surname: false,
        nationality1: false,
        nationality2: false
      };
    } else {
      partnerUpdatedFieldsMap = {
        legal_entity_name: false,
        legal_form: false,
        governing_law: false,
        legal_entity_register_name: false,
        legal_entity_registration_location: false,
        registered_company_number: false,
      };
    }

    if (appointmentId) {
      const appointment = await this.companyService?.buildPartnerFromCompanyAppointment(
        tokens,
        ids.companyId,
        appointmentId
      );

      for (const field in partnerUpdatedFieldsMap) {
        if (appointment?.partner?.data?.[field]?.toLowerCase() !== partner.data?.[field]?.toLowerCase()){
          partnerUpdatedFieldsMap[field] = true;
        }
      }
    }
    return partnerUpdatedFieldsMap;
  }
}

export default PostTransitionPartnerController;
