import { Injectable } from '@nestjs/common';
import { lastValueFrom } from 'rxjs';
import { CommonService } from 'src/common/common.service';
import { AM_SERVICE } from 'src/constants';
import {
  formatterPrice,
  generateAutoPassword,
  handleResponse,
  messParser,
} from 'src/utils/common';
import {
  AssetQueryPaging,
  AssetTypeReq,
  AssignAssetReq,
  AuditSessionBody,
  AuditSessionQuery,
  CreateAssetReq,
  DeleteAssetReq,
  Paging,
  RetrieveAssetReq,
  UpdateAssetReq,
  UpdateAssetSessionBody,
  UpdateSessionBody,
} from './asset.dto';
import * as _ from 'lodash';
import * as moment from 'moment';
import { Workbook } from 'exceljs';

@Injectable()
export class AssetService {
  constructor(private commonService: CommonService) { }

  async getListAssetCategory() {
    const data = await lastValueFrom(
      await this.commonService.getList(
        AM_SERVICE.ASSET_SERVICE.SERVICE_NAME,
        AM_SERVICE.ASSET_SERVICE.ENTITY.ASSET_CATEGORY,
        {},
      ),
    );
    return handleResponse(true, data, '');
  }

  async getListAssetAcquisition() {
    const data = await lastValueFrom(
      await this.commonService.getList(
        AM_SERVICE.ASSET_SERVICE.SERVICE_NAME,
        AM_SERVICE.ASSET_SERVICE.ENTITY.ACQUISITION_SOURCE,
        {},
      ),
    );
    return handleResponse(true, data, '');
  }

  async getListAssetType(payload: AssetTypeReq) {
    const { categoryId } = payload;
    const data = await lastValueFrom(
      await this.commonService.getList(
        AM_SERVICE.ASSET_SERVICE.SERVICE_NAME,
        AM_SERVICE.ASSET_SERVICE.ENTITY.ASSET_TYPE,
        {
          where: { ...(categoryId ? { categoryId: categoryId } : {}) },
        },
      ),
    );
    return handleResponse(true, data, '');
  }

  async getListAssetPaging(
    tenantId: number,
    payload: Paging & AssetQueryPaging,
  ) {
    const { limit, page, acquisitionSourceId, assetTypeId } = payload;
    const assetType = await lastValueFrom(
      await this.commonService.getList(
        AM_SERVICE.ASSET_SERVICE.SERVICE_NAME,
        AM_SERVICE.ASSET_SERVICE.ENTITY.ASSET_TYPE,
        {},
      ),
    );
    const acquisition = await lastValueFrom(
      await this.commonService.getList(
        AM_SERVICE.ASSET_SERVICE.SERVICE_NAME,
        AM_SERVICE.ASSET_SERVICE.ENTITY.ACQUISITION_SOURCE,
        {},
      ),
    );
    const keyAssetType = _.keyBy(assetType as any, 'id');
    const keyAcquisition = _.keyBy(acquisition as any, 'id');
    const data = await lastValueFrom(
      await this.commonService.getListPaging(
        AM_SERVICE.ASSET_SERVICE.SERVICE_NAME,
        AM_SERVICE.ASSET_SERVICE.ENTITY.ASSET,
        {
          query: {
            tenantId: tenantId,
            ...(acquisitionSourceId ? { acquisitionSourceId } : {}),
            ...(assetTypeId ? { assetTypeId } : {}),
          },
          pagination: {
            limit: limit,
            page: page || 1,
          },
          order: {},
        },
      ),
    );
    const keyBy = _.keyBy((data as any).result, 'id');

    const historyTransfer = await lastValueFrom(
      await this.commonService.getList(
        AM_SERVICE.ASSET_SERVICE.SERVICE_NAME,
        AM_SERVICE.ASSET_SERVICE.ENTITY.TRANSFER_ASSET,
        {
          assetId: messParser.In([Object.keys(keyBy)]),
        },
      ),
    );

    const historyKeyGroup = _.groupBy(historyTransfer as any, 'assetId');

    return handleResponse(
      true,
      {
        total: (data as any)?.total,
        result: ((data as any).result as any).map((item) => ({
          ...item,
          type: keyAssetType[item?.assetTypeId].name,
          acquisitionSource: keyAcquisition[item?.acquisitionSourceId].name,
          isAvailable:
            !historyKeyGroup[item?.id] ||
              historyKeyGroup[item?.id]?.length === 0 ||
              historyKeyGroup[item?.id].reverse()[0].toCustodianId === -1
              ? true
              : false,
        })),
      },
      '',
    );
  }

  async getDetailAsset(_tenantId: number, assetId: number) {
    const assetType = await lastValueFrom(
      await this.commonService.getList(
        AM_SERVICE.ASSET_SERVICE.SERVICE_NAME,
        AM_SERVICE.ASSET_SERVICE.ENTITY.ASSET_TYPE,
        {},
      ),
    );
    const acquisition = await lastValueFrom(
      await this.commonService.getList(
        AM_SERVICE.ASSET_SERVICE.SERVICE_NAME,
        AM_SERVICE.ASSET_SERVICE.ENTITY.ACQUISITION_SOURCE,
        {},
      ),
    );
    const listUser = await lastValueFrom(
      await this.commonService.getList(
        AM_SERVICE.USER_SERVICE.SERVICE_NAME,
        AM_SERVICE.USER_SERVICE.ENTITY.USER_INFO,
        {},
      ),
    );
    const keyAssetType = _.keyBy(assetType as any, 'id');
    const keyAcquisition = _.keyBy(acquisition as any, 'id');
    const keyListUser = _.keyBy(listUser as any, 'id');
    const data = await lastValueFrom(
      await this.commonService.getOne(
        AM_SERVICE.ASSET_SERVICE.SERVICE_NAME,
        AM_SERVICE.ASSET_SERVICE.ENTITY.ASSET,
        {
          id: assetId,
        },
      ),
    );
    const historyTransfer = await lastValueFrom(
      await this.commonService.getList(
        AM_SERVICE.ASSET_SERVICE.SERVICE_NAME,
        AM_SERVICE.ASSET_SERVICE.ENTITY.TRANSFER_ASSET,
        {
          assetId: assetId,
        },
      ),
    );
    const historyData = (historyTransfer as any).reverse().map((ele) => ({
      ...ele,
      fromUser: keyListUser[ele.fromCustodianId] || null,
      toUser: keyListUser[ele.toCustodianId] || null,
    }));
    const isAvailable =
      !historyData ||
      historyData?.length === 0 ||
      historyData[0].toCustodianId === -1;
    if (historyData)
      if (!data) return handleResponse(false, null, 'ASSET NOT FOUND!');

    const rate = (data as any)?.depreciationAmount / 100 || 0;
    const usefulYear = (data as any)?.usefulLife || 0;
    const ratePerYear = rate / usefulYear;
    const ratePerMonth = ratePerYear / 12;
    const ratePerDay = ratePerMonth / 30;
    const now = moment();
    const purchaseDate = moment((data as any)?.purchase_date);
    const numberOfDate = now.diff(purchaseDate, 'days') || 0;
    const decreaseCost = Math.round(
      numberOfDate * ratePerDay * (data as any)?.originalCost,
    );

    return handleResponse(
      true,
      {
        ...(data as any),
        currentCost: (data as any)?.originalCost - decreaseCost,
        usedDate: numberOfDate,
        ratePerDay: ratePerDay,
        type: keyAssetType[(data as any)?.assetTypeId].name,
        acquisitionSource:
          keyAcquisition[(data as any)?.acquisitionSourceId].name,
        isAvailable,
        history: historyData,
      },
      '',
    );
  }

  async createAsset(tenantId: number, userId: number, payload: CreateAssetReq) {
    const data = await lastValueFrom(
      await this.commonService.save(
        AM_SERVICE.ASSET_SERVICE.SERVICE_NAME,
        AM_SERVICE.ASSET_SERVICE.ENTITY.ASSET,
        {
          checkExisted: {},
          data: {
            ...payload,
            tenantId: tenantId,
          },
          id: userId,
        },
      ),
    );
    return handleResponse(true, data, 'CREATE ASSET SUCCESS');
  }

  async updateAsset(tenantId: number, userId: number, payload: UpdateAssetReq) {
    if (!payload.id) return handleResponse(false, null, 'Missing Params');
    const data = await lastValueFrom(
      await this.commonService.getOne(
        AM_SERVICE.ASSET_SERVICE.SERVICE_NAME,
        AM_SERVICE.ASSET_SERVICE.ENTITY.ASSET,
        {
          id: payload.id,
          tenantId,
        },
      ),
    );
    if (!data) return handleResponse(false, null, 'ASSET NOT FOUND');
    const dataRes = await lastValueFrom(
      await this.commonService.update(
        AM_SERVICE.ASSET_SERVICE.SERVICE_NAME,
        AM_SERVICE.ASSET_SERVICE.ENTITY.ASSET,
        {
          conditions: {
            id: payload.id,
          },
          data: {
            ...payload,
          },
          id: userId,
        },
      ),
    );
    return handleResponse(true, dataRes, 'UPDATE ASSET SUCCESS');
  }

  async deleteAsset(tenantId: number, payload: DeleteAssetReq) {
    if (!payload.id) return handleResponse(false, null, 'Missing Params');
    const data = await lastValueFrom(
      await this.commonService.getOne(
        AM_SERVICE.ASSET_SERVICE.SERVICE_NAME,
        AM_SERVICE.ASSET_SERVICE.ENTITY.ASSET,
        {
          id: payload.id,
          tenantId,
        },
      ),
    );
    if (!data) return handleResponse(false, null, 'ASSET NOT FOUND');
    await lastValueFrom(
      await this.commonService.delete(
        AM_SERVICE.ASSET_SERVICE.SERVICE_NAME,
        AM_SERVICE.ASSET_SERVICE.ENTITY.ASSET,
        {
          id: payload.id,
          tenantId,
        },
      ),
    );
    return handleResponse(true, null, 'DELETE ASSET SUCCESS');
  }

  async assignAsset(tenantId: number, payload: AssignAssetReq) {
    const data = await lastValueFrom(
      await this.commonService.save(
        AM_SERVICE.ASSET_SERVICE.SERVICE_NAME,
        AM_SERVICE.ASSET_SERVICE.ENTITY.TRANSFER_ASSET,
        {
          checkExisted: {},
          data: {
            assetId: payload.assetId,
            toCustodianId: payload.toUserId,
            fromCustodianId: -1,
            reason: payload.reason,
            referenceNo: generateAutoPassword(),
            status: 'APPROVED',
          },
        },
      ),
    );
    return handleResponse(true, data, 'ASSIGN ASSET SUCCESS');
  }

  async retrieveAsset(tenantId: number, payload: RetrieveAssetReq) {
    const data = await lastValueFrom(
      await this.commonService.save(
        AM_SERVICE.ASSET_SERVICE.SERVICE_NAME,
        AM_SERVICE.ASSET_SERVICE.ENTITY.TRANSFER_ASSET,
        {
          checkExisted: {},
          data: {
            assetId: payload.assetId,
            toCustodianId: -1,
            fromCustodianId: payload.fromUserId,
            reason: 'Retrieve Asset',
            referenceNo: generateAutoPassword(),
            status: 'APPROVED',
          },
        },
      ),
    );
    return handleResponse(true, data, 'RETRIEVE ASSET SUCCESS');
  }

  async exportAsset(tenantId: number) {
    const assetType = await lastValueFrom(
      await this.commonService.getList(
        AM_SERVICE.ASSET_SERVICE.SERVICE_NAME,
        AM_SERVICE.ASSET_SERVICE.ENTITY.ASSET_TYPE,
        {},
      ),
    );
    const acquisition = await lastValueFrom(
      await this.commonService.getList(
        AM_SERVICE.ASSET_SERVICE.SERVICE_NAME,
        AM_SERVICE.ASSET_SERVICE.ENTITY.ACQUISITION_SOURCE,
        {},
      ),
    );
    const keyAssetType = _.keyBy(assetType as any, 'id');
    const keyAcquisition = _.keyBy(acquisition as any, 'id');
    const data = await lastValueFrom(
      await this.commonService.getList(
        AM_SERVICE.ASSET_SERVICE.SERVICE_NAME,
        AM_SERVICE.ASSET_SERVICE.ENTITY.ASSET,
        {
          tenantId: tenantId,
        },
      ),
    );
    const keyBy = _.keyBy(data as any, 'id');

    const historyTransfer = await lastValueFrom(
      await this.commonService.getList(
        AM_SERVICE.ASSET_SERVICE.SERVICE_NAME,
        AM_SERVICE.ASSET_SERVICE.ENTITY.TRANSFER_ASSET,
        {
          assetId: messParser.In([Object.keys(keyBy)]),
        },
      ),
    );

    const historyKeyGroup = _.groupBy(historyTransfer as any, 'assetId');

    const result = (data as any as any).map((item) => ({
      ...item,
      type: keyAssetType[item?.assetTypeId].name,
      acquisitionSource: keyAcquisition[item?.acquisitionSourceId].name,
      remainingCost: (() => {
        const rate = item?.depreciationAmount / 100 || 0;
        const usefulYear = item?.usefulLife || 0;
        const ratePerYear = rate / usefulYear;
        const ratePerMonth = ratePerYear / 12;
        const ratePerDay = ratePerMonth / 30;
        const now = moment();
        const purchaseDate = moment(item?.purchase_date);
        const numberOfDate = now.diff(purchaseDate, 'days') || 0;
        const decreaseCost = Math.round(
          numberOfDate * ratePerDay * item?.originalCost,
        );

        return item?.originalCost - decreaseCost;
      })(),
      isAvailable:
        !historyKeyGroup[item?.id] ||
          historyKeyGroup[item?.id]?.length === 0 ||
          historyKeyGroup[item?.id].reverse()[0].toCustodianId === -1
          ? true
          : false,
    }));

    const workbook = new Workbook();
    const worksheet = workbook.addWorksheet('Asset');
    worksheet.columns = [
      { header: 'Id', key: 'id' },
      { header: 'Name', key: 'name' },
      { header: 'Original Cost', key: 'originalCost' },
      { header: 'Remaining Cost', key: 'currentCost' },
      { header: 'Specification', key: 'specification' },
      { header: 'Warranty Duration', key: 'warrantyDuration' },
      { header: 'Warranty Start Date', key: 'warrantyStartDate' },
      { header: 'Warranty End Date', key: 'warrantyEndDate' },
      { header: 'Warranty Condition', key: 'warrantyCondition' },
      { header: 'Note', key: 'note' },
      { header: 'Purchase Date', key: 'purchase_date' },
      { header: 'Depreciation Rate', key: 'depreciationAmount' },
      { header: 'Useful Life', key: 'usefulLife' },
      { header: 'Type', key: 'type' },
      { header: 'Acquisition Source', key: 'acquisitionSource' },
      { header: 'Created At', key: 'createdAt' },
    ];
    const dataRow = result?.map((asset) => {
      return {
        id: asset?.id,
        name: asset?.name,
        originalCost: formatterPrice.format(asset?.originalCost),
        currentCost: formatterPrice.format(asset?.currentCost),
        specification: asset?.specification || '-',
        warrantyDuration: asset?.warrantyDuration
          ? `${asset?.warrantyDuration} ${asset.timeUnit}`
          : '-',
        warrantyStartDate:
          moment(asset?.warrantyStartDate).format('DD-MM-YYYY') || '-',
        warrantyEndDate:
          moment(asset?.warrantyEndDate).format('DD-MM-YYYY') || '-',
        warrantyCondition: asset?.warrantyCondition || '-',
        note: asset?.note || '-',
        purchase_date: moment(asset?.purchase_date).format('DD-MM-YYYY') || '-',
        depreciationAmount: asset?.depreciationAmount || '-',
        usefulLife: asset?.usefulLife || '-',
        type: asset?.type || '-',
        acquisitionSource: asset?.acquisitionSource || '-',
        createdAt: moment(asset?.createdAt).format('DD-MM-YYYY') || '-',
      };
    });
    dataRow.forEach((val) => {
      worksheet.addRow(val);
    });

    return await workbook.xlsx.writeBuffer();
  }

  async getListAudiSession(tenantId: number, authId: number) {
    const assigneeUser = await lastValueFrom(
      await this.commonService.getOne(
        AM_SERVICE.USER_SERVICE.SERVICE_NAME,
        AM_SERVICE.USER_SERVICE.ENTITY.USER_INFO,
        {
          authId: authId,
        },
      ),
    );
    const listSession = await lastValueFrom(
      await this.commonService.getList(
        AM_SERVICE.ASSET_SERVICE.SERVICE_NAME,
        AM_SERVICE.ASSET_SERVICE.ENTITY.AUDIT_SESSION,
        {
          assigneeId: Number((assigneeUser as any)?.id),
          status: messParser.In(['UPCOMING', 'AUDITING']),
        },
      ),
    );
    const createdUserIds = _.mapKeys(listSession as any, 'createdBy');
    const assignUserIds = _.mapKeys(listSession as any, 'assigneeId');
    const createdUserDetailList = _.mapKeys(
      await lastValueFrom(
        await this.commonService.getByIds(
          AM_SERVICE.USER_SERVICE.SERVICE_NAME,
          AM_SERVICE.USER_SERVICE.ENTITY.USER_INFO,
          Object.keys(createdUserIds)
            .concat(Object.keys(assignUserIds))
            .map((id) => Number(id)),
        ),
      ),
      'id',
    );

    return handleResponse(
      true,
      (listSession as any).map((ele) => ({
        ...ele,
        createdUser: createdUserDetailList[ele?.createdBy],
        assignedUser: createdUserDetailList[ele?.assigneeId],
      })),
      '',
    );
  }

  async getDetailAudiSession(tenantId: number, sessionId: number) {
    const data = await lastValueFrom(
      await this.commonService.getOne(
        AM_SERVICE.ASSET_SERVICE.SERVICE_NAME,
        AM_SERVICE.ASSET_SERVICE.ENTITY.AUDIT_SESSION,
        {
          tenantId,
          id: sessionId,
        },
      ),
    );
    if (!data) handleResponse(false, null, 'NOT FOUND');
    const createdUser = await lastValueFrom(
      await this.commonService.getOne(
        AM_SERVICE.USER_SERVICE.SERVICE_NAME,
        AM_SERVICE.USER_SERVICE.ENTITY.USER_INFO,
        {
          id: (data as any)?.createdBy,
        },
      ),
    );

    const assginedUser = await lastValueFrom(
      await this.commonService.getOne(
        AM_SERVICE.USER_SERVICE.SERVICE_NAME,
        AM_SERVICE.USER_SERVICE.ENTITY.USER_INFO,
        {
          id: (data as any)?.assigneeId,
        },
      ),
    );
    const assetInSession = await lastValueFrom(
      await this.commonService.getList(
        AM_SERVICE.ASSET_SERVICE.SERVICE_NAME,
        AM_SERVICE.ASSET_SERVICE.ENTITY.AUDIT_ASSET_MAPPING,
        {
          auditSessionId: sessionId,
        },
      ),
    );

    const assetIds = _.mapKeys(assetInSession as any, 'assetId');
    const assetDetailList = _.mapKeys(
      await lastValueFrom(
        await this.commonService.getByIds(
          AM_SERVICE.ASSET_SERVICE.SERVICE_NAME,
          AM_SERVICE.ASSET_SERVICE.ENTITY.ASSET,
          Object.keys(assetIds).map((id) => Number(id)),
        ),
      ),
      'id',
    );

    return handleResponse(
      true,
      {
        ...(data as any),
        assets: (assetInSession as any).map((ele) => ({
          ...ele,
          detail: assetDetailList[ele.assetId],
        })),
        createdUser: createdUser,
        assginedUser: assginedUser,
      },
      '',
    );
  }

  async createAuditSession(
    tenantId: number,
    userId: number,
    payload: AuditSessionBody,
  ) {
    const user = await lastValueFrom(
      await this.commonService.getOne(
        AM_SERVICE.USER_SERVICE.SERVICE_NAME,
        AM_SERVICE.USER_SERVICE.ENTITY.USER_INFO,
        {
          authId: userId,
        },
      ),
    );

    const data = await lastValueFrom(
      await this.commonService.save(
        AM_SERVICE.ASSET_SERVICE.SERVICE_NAME,
        AM_SERVICE.ASSET_SERVICE.ENTITY.AUDIT_SESSION,
        {
          checkExisted: {},
          data: {
            name: payload.name,
            startDate: payload.startDate,
            endDate: payload.endDate,
            assigneeId: payload.assigneeId,
            note: payload.note,
            status: 'UPCOMING',
            tenantId: tenantId,
          },
          id: (user as any)?.id,
        },
      ),
    );
    for (let i = 0; i < payload.assets?.length; i++) {
      await lastValueFrom(
        await this.commonService.save(
          AM_SERVICE.ASSET_SERVICE.SERVICE_NAME,
          AM_SERVICE.ASSET_SERVICE.ENTITY.AUDIT_ASSET_MAPPING,
          {
            checkExisted: {},
            data: {
              assetId: payload.assets[i],
              auditSessionId: (data as any)?.id,
              note: payload.note,
              status: 'WAITING_FOR_AUDIT',
            },
            id: userId,
          },
        ),
      );
    }
    return handleResponse(true, null, 'CREATE AUDIT SESSION SUCCESS');
  }

  async updateSessionAuditSession(
    tenantId: number,
    userId: number,
    payload: UpdateSessionBody,
  ) {
    const data = await lastValueFrom(
      await this.commonService.update(
        AM_SERVICE.ASSET_SERVICE.SERVICE_NAME,
        AM_SERVICE.ASSET_SERVICE.ENTITY.AUDIT_SESSION,
        {
          conditions: {
            id: payload.sessionId,
          },
          data: {
            name: payload.name,
            startDate: payload.startDate,
            endDate: payload.endDate,
            assigneeId: payload.assigneeId,
            note: payload.note,
            status: payload.status,
            tenantId: tenantId,
          },
        },
      ),
    );

    return handleResponse(true, null, 'UPDATE AUDIT SESSION SUCCESS');
  }

  async updateAssetAuditSession(
    sessionId: number,
    assetAuditId: number,
    payload: UpdateAssetSessionBody,
  ) {
    const data = await lastValueFrom(
      await this.commonService.update(
        AM_SERVICE.ASSET_SERVICE.SERVICE_NAME,
        AM_SERVICE.ASSET_SERVICE.ENTITY.AUDIT_ASSET_MAPPING,
        {
          conditions: {
            assetId: assetAuditId,
            auditSessionId: sessionId,
          },
          data: {
            note: payload.note,
            status: 'AUDITED',
          },
        },
      ),
    );

    return handleResponse(true, data, 'UPDATE AUDIT ASSET SUCCESS');
  }
}
