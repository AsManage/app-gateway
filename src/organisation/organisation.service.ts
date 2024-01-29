import { Injectable } from '@nestjs/common';
import { CommonService } from 'src/common/common.service';
import {
  LocationDTO,
  OrgUnitDTO,
  OrgUnitTypeDTO,
  TenantInformationDTO,
} from './organisation.dto';
import { AM_SERVICE } from 'src/constants';
import { lastValueFrom } from 'rxjs';
import { handleResponse } from 'src/utils/common';
import { getListPagingDTO } from 'src/common/common.dto';
import * as _ from 'lodash';

@Injectable()
export class OrganisationService {
  constructor(private commonService: CommonService) {}

  async createTenant(payload: TenantInformationDTO) {
    const existTenant = await lastValueFrom(
      await this.commonService.getOne(
        AM_SERVICE.ORGANISATION_SERVICE.SERVICE_NAME,
        AM_SERVICE.ORGANISATION_SERVICE.ENTITY.TENANT_INFO,
        {
          email: payload.tenantContact.email,
          name: payload.name,
        },
      ),
    );
    /** CHECK IF EXISTED TENANT */
    if (existTenant)
      return handleResponse(
        false,
        null,
        'TENANT ALREADY EXISTED IN ASAMANAGE SYSTEM',
      );
    else {
      const data = await lastValueFrom(
        await this.commonService.save(
          AM_SERVICE.ORGANISATION_SERVICE.SERVICE_NAME,
          AM_SERVICE.ORGANISATION_SERVICE.ENTITY.TENANT_INFO,
          {
            checkExisted: {
              email: payload.tenantContact.email,
              name: payload.name,
            },
            data: {
              name: payload.name,
              location: payload?.tenantAddress?.location,
              province: payload?.tenantAddress?.province,
              city: payload?.tenantAddress?.city,
              country: payload?.tenantAddress?.country,
              phone: payload.tenantContact?.phone,
              fax: payload.tenantContact?.fax,
              email: payload.tenantContact.email,
              businessRegistrationCode: payload.businessRegistrationCode,
              dateOfEstablishment: payload.dateOfEstablishment,
              logo: payload.logo,
              state: payload.state,
            },
            id: payload.id ? payload.id : -1,
          },
        ),
      );
      if (data) {
        return handleResponse(true, data, 'CREATE TENANT SUCCESS');
      } else {
        return handleResponse(false, data, 'CREATE TENANT FAIL');
      }
    }
  }
  async getTenantInfo(payload: { tenantId: number }) {
    const tenantInfo = await lastValueFrom(
      await this.commonService.getOne(
        AM_SERVICE.ORGANISATION_SERVICE.SERVICE_NAME,
        AM_SERVICE.ORGANISATION_SERVICE.ENTITY.TENANT_INFO,
        {
          id: payload.tenantId,
        },
      ),
    );
    if (!tenantInfo) return handleResponse(false, null, 'TENANT NOT FOUND');
    else return handleResponse(true, tenantInfo, 'GET TENANT INFO SUCCESS');
  }

  async getListOrgUnitTypes(payload: { tenantId: number } & getListPagingDTO) {
    const listOrgUnitType = await this.commonService.getListPaging(
      AM_SERVICE.ORGANISATION_SERVICE.SERVICE_NAME,
      AM_SERVICE.ORGANISATION_SERVICE.ENTITY.ORGANISATION_UNIT_TYPE,
      {
        query: { tenantId: payload.tenantId },
        pagination: {
          limit: payload.limit,
          page: payload.page || 1,
        },
        order: {},
      },
    );
    return listOrgUnitType;
  }

  async updateOrgUnitTypes(payload: {
    tenantId: number;
    typeId: number;
    updatedId: number;
    name: string;
  }) {
    const existed = await lastValueFrom(
      await this.commonService.getOne(
        AM_SERVICE.ORGANISATION_SERVICE.SERVICE_NAME,
        AM_SERVICE.ORGANISATION_SERVICE.ENTITY.ORGANISATION_UNIT_TYPE,
        {
          id: payload.typeId,
          name: payload.name,
          tenantId: payload.tenantId,
        },
      ),
    );
    /** CHECK IF ORG UNIT */
    if (existed)
      return handleResponse(false, null, 'ORGANISATION TYPE IS EXISTED');
    const data = await lastValueFrom(
      await this.commonService.update(
        AM_SERVICE.ORGANISATION_SERVICE.SERVICE_NAME,
        AM_SERVICE.ORGANISATION_SERVICE.ENTITY.ORGANISATION_UNIT_TYPE,
        {
          conditions: {
            id: payload.typeId,
          },
          data: {
            name: payload.name,
          },
          id: payload.updatedId, // Updated user ID
        },
      ),
    );
    if (!data) return handleResponse(false, null, 'UPDATED FAIL');
    else return handleResponse(true, data, 'UPDATED SUCCESS');
  }

  async deleteOrgUnitTypes(payload: {
    tenantId: number;
    typeId: number | string;
    deletedId: number;
  }) {
    const existed = await lastValueFrom(
      await this.commonService.getOne(
        AM_SERVICE.ORGANISATION_SERVICE.SERVICE_NAME,
        AM_SERVICE.ORGANISATION_SERVICE.ENTITY.ORGANISATION_UNIT_TYPE,
        {
          id: payload.typeId,
        },
      ),
    );
    /** CHECK IF ORG UNIT */
    if (!existed)
      return handleResponse(false, null, 'ORGANISATION TYPE NOT FOUND');
    console.log(payload.typeId);
    const data = await lastValueFrom(
      await this.commonService.delete(
        AM_SERVICE.ORGANISATION_SERVICE.SERVICE_NAME,
        AM_SERVICE.ORGANISATION_SERVICE.ENTITY.ORGANISATION_UNIT_TYPE,
        {
          id: payload.typeId,
        },
      ),
    );
    if (!data) return handleResponse(false, null, 'DELETE FAIL');
    else return handleResponse(true, data, 'DELETE SUCCESS');
  }

  async addOrgUnitType(payload: OrgUnitTypeDTO) {
    const existed = await lastValueFrom(
      await this.commonService.getOne(
        AM_SERVICE.ORGANISATION_SERVICE.SERVICE_NAME,
        AM_SERVICE.ORGANISATION_SERVICE.ENTITY.ORGANISATION_UNIT_TYPE,
        {
          name: payload.name,
          tenantId: payload.tenantId,
        },
      ),
    );
    /** CHECK IF ORG UNIT */
    if (existed)
      return handleResponse(false, null, 'ORGANISATION TYPE IS EXISTED');
    else {
      const data = await lastValueFrom(
        await this.commonService.save(
          AM_SERVICE.ORGANISATION_SERVICE.SERVICE_NAME,
          AM_SERVICE.ORGANISATION_SERVICE.ENTITY.ORGANISATION_UNIT_TYPE,
          {
            checkExisted: {
              tenantId: payload.tenantId,
              name: payload.name,
            },
            data: {
              name: payload.name,
              tenantId: payload.tenantId,
            },
          },
        ),
      );
      return handleResponse(true, data, 'CREATE ORGANISATION UNIT SUCCESS');
    }
  }

  async addOrgUnit(payload: OrgUnitDTO, tenantId: number) {
    const data = await lastValueFrom(
      await this.commonService.save(
        AM_SERVICE.ORGANISATION_SERVICE.SERVICE_NAME,
        AM_SERVICE.ORGANISATION_SERVICE.ENTITY.ORGANISATION_UNIT,
        {
          checkExisted: { name: payload?.name, tenantId: tenantId },
          data: {
            name: payload?.name,
            state: payload?.state,
            description: payload?.description,
            sortId: payload?.sortId,
            parentId: payload?.parentId,
            areaOfOperation: payload?.areaOfOperation,
            orgLeaders: payload?.state,
            businessFunctionDescription: payload?.businessFunctionDescription,
            organisationUnitTypeId: payload?.organisationUnitTypeId,
            tenantId: tenantId,
          },
        },
      ),
    );
    if ((data as any)?.status === 400) {
      return handleResponse(false, null, 'Organisation Name Existed!');
    } else return this.getOrgUnit({ tenantId });
  }
  async getOrgUnit(payload: { tenantId: number }) {
    const [orgUnitInfo, listUnitType] = await Promise.all([
      lastValueFrom(
        await this.commonService.getList(
          AM_SERVICE.ORGANISATION_SERVICE.SERVICE_NAME,
          AM_SERVICE.ORGANISATION_SERVICE.ENTITY.ORGANISATION_UNIT,
          {
            where: {
              tenantId: payload.tenantId,
            },
          },
        ),
      ),
      lastValueFrom(
        await this.commonService.getList(
          AM_SERVICE.ORGANISATION_SERVICE.SERVICE_NAME,
          AM_SERVICE.ORGANISATION_SERVICE.ENTITY.ORGANISATION_UNIT_TYPE,
          {
            where: {
              tenantId: payload.tenantId,
            },
          },
        ),
      ),
    ]);
    const listUnit = (orgUnitInfo as any[]) || [];
    const listType = (listUnitType as any[]) || [];

    const keyByListType = _.keyBy(listType, 'id');

    listUnit.forEach((element) => {
      element.organisationUnitTypeName =
        keyByListType[element.organisationUnitTypeId]?.name || null;
    });
    const result = [];

    const level1 = listUnit.filter((ele) => ele.sortId == 1);
    const level2 = listUnit.filter((ele) => ele.sortId == 2);
    const level2GroupByParentId = _.groupBy(level2, 'parentId');
    const level3 = listUnit.filter((ele) => ele.sortId == 3);
    const level3GroupByParentId = _.groupBy(level3, 'parentId');
    const level4 = listUnit.filter((ele) => ele.sortId == 4);
    const level4GroupByParentId = _.groupBy(level4, 'parentId');
    const level5 = listUnit.filter((ele) => ele.sortId == 5);
    const level5GroupByParentId = _.groupBy(level5, 'parentId');

    for (let i = 0; i < level1.length; i++) {
      const lv1Item = level1[i];
      const lv2Child = level2GroupByParentId[lv1Item.id] || [];
      lv1Item.child = lv2Child;
      lv2Child?.forEach((lv2) => {
        const lv3Child = level3GroupByParentId[lv2.id] || [];
        lv2.child = lv3Child;
        lv3Child?.forEach((lv3) => {
          const lv4Child = level4GroupByParentId[lv3.id] || [];
          lv3.child = lv4Child;
          lv4Child?.forEach((lv4) => {
            const lv5Child = level5GroupByParentId[lv4.id] || [];
            lv4.child = lv5Child;
          });
        });
      });
      result.push(lv1Item);
    }

    return handleResponse(true, result, 'GET STRUCTURAL SUCCESS');
  }

  async updateOrgUnit(payload: OrgUnitDTO & { ouId: string }) {
    const existed = await lastValueFrom(
      await this.commonService.getOne(
        AM_SERVICE.ORGANISATION_SERVICE.SERVICE_NAME,
        AM_SERVICE.ORGANISATION_SERVICE.ENTITY.ORGANISATION_UNIT,
        {
          id: payload.ouId,
        },
      ),
    );
    /** CHECK IF ORG UNIT */
    if (!existed)
      return handleResponse(false, null, 'ORGANISATION UNIT IS NOT EXISTED');
    const data = await lastValueFrom(
      await this.commonService.update(
        AM_SERVICE.ORGANISATION_SERVICE.SERVICE_NAME,
        AM_SERVICE.ORGANISATION_SERVICE.ENTITY.ORGANISATION_UNIT,
        {
          conditions: {
            id: payload.ouId,
          },
          data: {
            name: payload.name,
            state: payload.state,
            description: payload.description,
            areaOfOperation: payload.areaOfOperation,
            businessFunctionDescription: payload.businessFunctionDescription,
            organisationUnitTypeId: payload.organisationUnitTypeId,
          },
        },
      ),
    );
    if (!data) return handleResponse(false, null, 'UPDATED FAIL');
    else return handleResponse(true, data, 'UPDATED SUCCESS');
  }

  async deleteOrgUnit(payload: { ouId: string }) {
    const existed = await lastValueFrom(
      await this.commonService.getOne(
        AM_SERVICE.ORGANISATION_SERVICE.SERVICE_NAME,
        AM_SERVICE.ORGANISATION_SERVICE.ENTITY.ORGANISATION_UNIT,
        {
          id: payload.ouId,
        },
      ),
    );
    /** CHECK IF ORG UNIT */

    if (!existed)
      return handleResponse(false, null, 'ORGANISATION TYPE NOT FOUND');
    const existedChild = await lastValueFrom(
      await this.commonService.getOne(
        AM_SERVICE.ORGANISATION_SERVICE.SERVICE_NAME,
        AM_SERVICE.ORGANISATION_SERVICE.ENTITY.ORGANISATION_UNIT,
        {
          parentId: payload.ouId,
        },
      ),
    );
    if (existedChild) {
      return handleResponse(false, null, 'REMOVE CHILDREN FIRST');
    }
    const data = await lastValueFrom(
      await this.commonService.delete(
        AM_SERVICE.ORGANISATION_SERVICE.SERVICE_NAME,
        AM_SERVICE.ORGANISATION_SERVICE.ENTITY.ORGANISATION_UNIT,
        {
          id: payload.ouId,
        },
      ),
    );
    if (!data) return handleResponse(false, null, 'DELETE FAIL');
    else return handleResponse(true, data, 'DELETE SUCCESS');
  }

  async addLocation(payload: LocationDTO) {
    const location = await lastValueFrom(
      await this.commonService.getOne(
        AM_SERVICE.ORGANISATION_SERVICE.SERVICE_NAME,
        AM_SERVICE.ORGANISATION_SERVICE.ENTITY.LOCATION,
        {
          name: payload.name,
          tenantId: payload.tenantId,
        },
      ),
    );
    if (location) return handleResponse(false, null, 'Name is Existed!');
    const locationCode = await lastValueFrom(
      await this.commonService.getOne(
        AM_SERVICE.ORGANISATION_SERVICE.SERVICE_NAME,
        AM_SERVICE.ORGANISATION_SERVICE.ENTITY.LOCATION,
        {
          tenantId: payload.tenantId,
          code: payload.code,
        },
      ),
    );
    if (locationCode) return handleResponse(false, null, 'Code is Existed!');
    const data = await lastValueFrom(
      await this.commonService.save(
        AM_SERVICE.ORGANISATION_SERVICE.SERVICE_NAME,
        AM_SERVICE.ORGANISATION_SERVICE.ENTITY.LOCATION,
        {
          checkExisted: {
            name: payload.name,
            tenantId: payload.tenantId,
            code: payload.code,
          },
          data: {
            name: payload.name,
            state: payload?.state,
            code: payload?.code,
            description: payload?.description,
            sortId: payload?.locationHierarchy?.sortId,
            parentId: payload?.locationHierarchy?.parentId,
            areaOfOperation: payload?.areaOfOperation,
            businessFunctionDescription: payload?.businessFunctionDescription,
            tenantId: payload?.tenantId,
          },
        },
      ),
    );
    if ((data as any)?.status === 400) {
      return handleResponse(false, null, 'Name or Code Existed!');
    } else return this.getLocation({ tenantId: payload.tenantId });
  }

  async getLocation(payload: { tenantId: number }) {
    const listLocation = (await lastValueFrom(
      await this.commonService.getList(
        AM_SERVICE.ORGANISATION_SERVICE.SERVICE_NAME,
        AM_SERVICE.ORGANISATION_SERVICE.ENTITY.LOCATION,
        {
          where: {
            tenantId: payload.tenantId,
          },
        },
      ),
    )) as any[];
    const result = [];

    const level1 = listLocation.filter((ele) => ele.sortId == 1);
    const level2 = listLocation.filter((ele) => ele.sortId == 2);
    const level2GroupByParentId = _.groupBy(level2, 'parentId');
    const level3 = listLocation.filter((ele) => ele.sortId == 3);
    const level3GroupByParentId = _.groupBy(level3, 'parentId');
    const level4 = listLocation.filter((ele) => ele.sortId == 4);
    const level4GroupByParentId = _.groupBy(level4, 'parentId');
    const level5 = listLocation.filter((ele) => ele.sortId == 5);
    const level5GroupByParentId = _.groupBy(level5, 'parentId');

    for (let i = 0; i < level1.length; i++) {
      const lv1Item = level1[i];
      const lv2Child = level2GroupByParentId[lv1Item.id] || [];
      lv1Item.child = lv2Child;
      lv2Child?.forEach((lv2) => {
        const lv3Child = level3GroupByParentId[lv2.id] || [];
        lv2.child = lv3Child;
        lv3Child?.forEach((lv3) => {
          const lv4Child = level4GroupByParentId[lv3.id] || [];
          lv3.child = lv4Child;
          lv4Child?.forEach((lv4) => {
            const lv5Child = level5GroupByParentId[lv4.id] || [];
            lv4.child = lv5Child;
          });
        });
      });
      result.push(lv1Item);
    }

    return handleResponse(true, result, 'GET STRUCTURAL SUCCESS');
  }

  async assignLocationToOrgUnit(payload: {
    locationId: number;
    orgUnitId: number;
    createdBy?: number;
  }) {
    console.log(payload);
    const data = await this.commonService.save(
      AM_SERVICE.ORGANISATION_SERVICE.SERVICE_NAME,
      AM_SERVICE.ORGANISATION_SERVICE.ENTITY.LOCATION_OF_ORG_UNIT,
      {
        checkExisted: {
          locationId: payload.locationId,
          organisationUnitId: payload.orgUnitId,
        },
        data: {
          locationId: payload.locationId,
          organisationUnitId: payload.orgUnitId,
          createdBy: payload.createdBy,
        },
      },
    );
    return data;
  }

  async getLocationsOfOrgUnit(payload: { orgUnitId: number }) {
    const listLocation = await this.commonService.getList(
      AM_SERVICE.ORGANISATION_SERVICE.SERVICE_NAME,
      AM_SERVICE.ORGANISATION_SERVICE.ENTITY.LOCATION_OF_ORG_UNIT,
      {
        organisationUnitId: payload.orgUnitId,
      },
    );
    return listLocation;
  }
}
