import { Injectable } from '@nestjs/common';
import { CommonService } from 'src/common/common.service';
import * as _ from 'lodash';
import { lastValueFrom } from 'rxjs';
import { AM_SERVICE } from 'src/constants';
import {
  generateAutoPassword,
  handleResponse,
  messParser,
} from 'src/utils/common';
import {
  CreateRoleDTO,
  DeleteRoleDTO,
  Paging,
  UpdateRoleDTO,
  UserDTO,
} from './user.dto';
import { ResponseType } from 'src/interfaces/response';
import { EmailService } from 'src/email/email.service';

@Injectable()
export class UserService {
  constructor(
    private commonSrv: CommonService,
    private mailSrv: EmailService,
  ) {}

  async getListSystemPermission() {
    const listPermission = await lastValueFrom(
      await this.commonSrv.getList(
        AM_SERVICE.USER_SERVICE.SERVICE_NAME,
        AM_SERVICE.USER_SERVICE.ENTITY.USER_PERMISSION,
        {
          where: {},
        },
      ),
    );
    const listPermissionGroup = await lastValueFrom(
      await this.commonSrv.getList(
        AM_SERVICE.USER_SERVICE.SERVICE_NAME,
        AM_SERVICE.USER_SERVICE.ENTITY.USER_PERMISSION_GROUP,
        {
          where: {},
        },
      ),
    );

    const listPermissionGroupBy = _.groupBy(listPermission as any, 'groupId');

    return handleResponse(
      true,
      (listPermissionGroup as any).map((ele) => {
        return {
          groupName: ele?.name,
          permissions: listPermissionGroupBy[ele?.id].map(
            (permission) => permission,
          ),
        };
      }),
      'GET LIST PERMISSION SUCCESS',
    );
  }

  async getRole(payload: { tenantId: number }) {
    const { tenantId } = payload;
    const listRole = await lastValueFrom(
      await this.commonSrv.getList(
        AM_SERVICE.USER_SERVICE.SERVICE_NAME,
        AM_SERVICE.USER_SERVICE.ENTITY.USER_ROLE,
        {
          where: {
            tenantId: messParser.In([Number(tenantId), 0]),
          },
        },
      ),
    );

    const listPermission = await lastValueFrom(
      await this.commonSrv.getList(
        AM_SERVICE.USER_SERVICE.SERVICE_NAME,
        AM_SERVICE.USER_SERVICE.ENTITY.USER_PERMISSION,
        {},
      ),
    );

    const listPermissionKeyBy = _.keyBy(listPermission as any, 'id');
    const result = [];

    for (let i = 0; i < (listRole as any)?.length; i++) {
      const rolePermissionMapping = await lastValueFrom(
        await this.commonSrv.getList(
          AM_SERVICE.USER_SERVICE.SERVICE_NAME,
          AM_SERVICE.USER_SERVICE.ENTITY.USER_PERMISSION_ROLE_MAPPING,
          {
            where: {
              roleId: listRole[i]?.id,
            },
          },
        ),
      );
      const keys = Object.keys(
        _.keyBy(rolePermissionMapping as any, 'permissionId'),
      );
      result.push({
        ...listRole[i],
        permissions: keys?.map((ele) => {
          return listPermissionKeyBy[ele]?.name;
        }),
      });
    }

    return handleResponse(true, result, 'GET LIST ROLE SUCCESS');
  }

  async createRole(payload: CreateRoleDTO) {
    const { permissionIds, roleName, tenantId } = payload;
    const data = await lastValueFrom(
      await this.commonSrv.save(
        AM_SERVICE.USER_SERVICE.SERVICE_NAME,
        AM_SERVICE.USER_SERVICE.ENTITY.USER_ROLE,
        {
          checkExisted: {
            name: roleName,
            tenantId: tenantId,
          },
          data: {
            name: roleName,
            tenantId: tenantId,
          },
        },
      ),
    );
    if ((data as any)?.status === 400) {
      return handleResponse(false, null, 'ROLE NAME IS EXISTED!');
    } else {
      const roleId = (data as any).id;
      if (permissionIds.length > 0) {
        for (let i = 0; i < permissionIds.length; i++) {
          await lastValueFrom(
            await this.commonSrv.save(
              AM_SERVICE.USER_SERVICE.SERVICE_NAME,
              AM_SERVICE.USER_SERVICE.ENTITY.USER_PERMISSION_ROLE_MAPPING,
              {
                checkExisted: {},
                data: {
                  roleId: roleId,
                  permissionId: permissionIds[i],
                },
              },
            ),
          );
        }
      }
    }
    return handleResponse(true, data, 'CREATE ROLE SUCCESS');
  }

  async deleteRole(payload: DeleteRoleDTO) {
    const { roleId } = payload;
    if (Number(roleId) == 0)
      return handleResponse(false, null, 'CAN NOT DELETE ROOT ROLE!');
    const data = await lastValueFrom(
      await this.commonSrv.getOne(
        AM_SERVICE.USER_SERVICE.SERVICE_NAME,
        AM_SERVICE.USER_SERVICE.ENTITY.USER_ROLE,
        {
          id: roleId,
        },
      ),
    );
    if (!data) return handleResponse(false, null, 'ROLE IS NOT EXISTED!');
    const dataRes = await lastValueFrom(
      await this.commonSrv.delete(
        AM_SERVICE.USER_SERVICE.SERVICE_NAME,
        AM_SERVICE.USER_SERVICE.ENTITY.USER_ROLE,
        {
          id: roleId,
        },
      ),
    );
    if (dataRes) return handleResponse(true, dataRes, 'DELETE ROLE SUCCESS');
    else return handleResponse(true, dataRes, 'DELETE ROLE FAIL');
  }

  async updateRole(payload: UpdateRoleDTO) {
    const { roleId, permissionIds, roleName } = payload;
    if (roleName)
      await lastValueFrom(
        await this.commonSrv.update(
          AM_SERVICE.USER_SERVICE.SERVICE_NAME,
          AM_SERVICE.USER_SERVICE.ENTITY.USER_ROLE,
          {
            conditions: {
              id: roleId,
            },
            data: {
              name: roleName,
            },
          },
        ),
      );
    await lastValueFrom(
      await this.commonSrv.delete(
        AM_SERVICE.USER_SERVICE.SERVICE_NAME,
        AM_SERVICE.USER_SERVICE.ENTITY.USER_PERMISSION_ROLE_MAPPING,
        {
          roleId: roleId,
        },
      ),
    );
    for (let i = 0; i < permissionIds.length; i++) {
      await lastValueFrom(
        await this.commonSrv.save(
          AM_SERVICE.USER_SERVICE.SERVICE_NAME,
          AM_SERVICE.USER_SERVICE.ENTITY.USER_PERMISSION_ROLE_MAPPING,
          {
            checkExisted: {},
            data: {
              roleId: roleId,
              permissionId: permissionIds[i],
            },
          },
        ),
      );
    }
    return handleResponse(true, null, 'UPDATE ROLE SUCCESS');
  }

  async getListUser(tenantId: number, authId: number, payload: Paging) {
    const authInfo = (await lastValueFrom(
      await this.commonSrv.getListPaging(
        AM_SERVICE.AUTH_SERVICE.SERVICE_NAME,
        AM_SERVICE.AUTH_SERVICE.ENTITY.AUTH_INFO,
        {
          query: { tenantId: tenantId },
          pagination: {
            limit: payload.limit,
            page: payload.page || 1,
          },
          order: {},
        },
      ),
    )) as any;
    const authInfoIds = Object.keys(
      _.mapKeys(authInfo?.result?.filter((ele) => ele.id != authId), 'id'),
    );
    const listUser = await lastValueFrom(
      await this.commonSrv.getList(
        AM_SERVICE.USER_SERVICE.SERVICE_NAME,
        AM_SERVICE.USER_SERVICE.ENTITY.USER_INFO,
        {
          where: {
            authId: messParser.In(authInfoIds),
          },
        },
      ),
    );
    const listRoleIds = Object.keys(_.mapKeys(listUser as any, 'roleId'));
    const listRole = await lastValueFrom(
      await this.commonSrv.getList(
        AM_SERVICE.USER_SERVICE.SERVICE_NAME,
        AM_SERVICE.USER_SERVICE.ENTITY.USER_ROLE,
        {
          where: {
            id: messParser.In(listRoleIds),
          },
        },
      ),
    );
    const listRoleKey = _.keyBy(listRole as any, 'id');
    return handleResponse(
      true,
      {
        total: authInfo?.total - 1,
        result: (listUser as any)?.map((ele) => {
          return {
            ...ele,
            role: listRoleKey[ele?.roleId]?.name,
          };
        }),
      },
      'GET LIST USER SUCCESS!',
    );
  }

  async getListUserOption(tenantId: number, authId: number) {
    console.log(tenantId);
    const authInfo = (await lastValueFrom(
      await this.commonSrv.getList(
        AM_SERVICE.AUTH_SERVICE.SERVICE_NAME,
        AM_SERVICE.AUTH_SERVICE.ENTITY.AUTH_INFO,
        {
          where: { tenantId: tenantId },
        },
      ),
    )) as any;

    const authInfoIds = Object.keys(
      _.mapKeys(
        authInfo?.filter(
          (ele) => ele.id != authId && ele?.tenantId == tenantId,
        ),
        'id',
      ),
    );
    const listUser = await lastValueFrom(
      await this.commonSrv.getList(
        AM_SERVICE.USER_SERVICE.SERVICE_NAME,
        AM_SERVICE.USER_SERVICE.ENTITY.USER_INFO,
        {
          where: {
            authId: messParser.In(authInfoIds),
          },
        },
      ),
    );
    return handleResponse(true, listUser, 'GET LIST USER SUCCESS!');
  }

  async getDetailUser(tenantId: number, userId: number) {
    const userInfo = await lastValueFrom(
      await this.commonSrv.getOne(
        AM_SERVICE.USER_SERVICE.SERVICE_NAME,
        AM_SERVICE.USER_SERVICE.ENTITY.USER_INFO,
        {
          id: userId,
        },
      ),
    );
    if (!userInfo) return handleResponse(false, null, 'USER NOT FOUND');
    const role = await lastValueFrom(
      await this.commonSrv.getOne(
        AM_SERVICE.USER_SERVICE.SERVICE_NAME,
        AM_SERVICE.USER_SERVICE.ENTITY.USER_ROLE,
        {
          id: Number((userInfo as any)?.roleId),
        },
      ),
    );
    const historyTransfer = await lastValueFrom(
      await this.commonSrv.getList(
        AM_SERVICE.ASSET_SERVICE.SERVICE_NAME,
        AM_SERVICE.ASSET_SERVICE.ENTITY.TRANSFER_ASSET,
        {},
      ),
    );
    const listAsset = _.groupBy(historyTransfer as any, 'assetId');
    const data = await lastValueFrom(
      await this.commonSrv.getByIds(
        AM_SERVICE.ASSET_SERVICE.SERVICE_NAME,
        AM_SERVICE.ASSET_SERVICE.ENTITY.ASSET,
        Object.keys(listAsset)?.map((ele) => {
          if (
            listAsset[ele] &&
            listAsset[ele]?.reverse()[0]?.toCustodianId == userId
          )
            return ele;
        }),
      ),
    );

    return handleResponse(
      true,
      { ...(userInfo as any), role, assignedAsset: data },
      'GET LIST USER SUCCESS!',
    );
  }

  async createUser(tenantId: number, payload: UserDTO) {
    const password =
      payload?.password?.length > 0
        ? payload?.password
        : generateAutoPassword();
    if (!payload.email || !String(tenantId) || !String(payload.roleId))
      return handleResponse(false, null, 'Missing Params');
    const responseData = await lastValueFrom(
      await this.commonSrv.call(
        AM_SERVICE.AUTH_SERVICE.SERVICE_NAME,
        'create-auth-info',
        {
          email: payload.email,
          password: password,
          tenantId,
        },
      ),
    );
    const { isSuccess, result } = responseData as ResponseType;
    if (isSuccess) {
      const authId = result?.id;
      await lastValueFrom(
        await this.commonSrv.save(
          AM_SERVICE.USER_SERVICE.SERVICE_NAME,
          AM_SERVICE.USER_SERVICE.ENTITY.USER_INFO,
          {
            checkExisted: {},
            data: {
              firstName: payload?.firstName,
              lastName: payload?.lastName,
              location: payload?.location,
              city: payload?.city,
              province: payload?.province,
              workingPosition: payload?.workingPosition,
              phoneNumber: payload?.phoneNumber,
              email: payload?.email,
              gender: payload?.gender,
              roleId: payload?.roleId,
              status: payload?.status,
              authId: authId,
            },
          },
        ),
      );
      await this.mailSrv.sendEmailPassword(password, payload.email);
    }
    return handleResponse(
      true,
      { ...result, key: password },
      'Create Account Success',
    );
  }

  async deleteUser(tenantId: number, payload: { userId: string }) {
    if (!payload.userId) return handleResponse(false, null, 'Missing Params');
    const data = await lastValueFrom(
      await this.commonSrv.getOne(
        AM_SERVICE.USER_SERVICE.SERVICE_NAME,
        AM_SERVICE.USER_SERVICE.ENTITY.USER_INFO,
        {
          id: payload.userId,
        },
      ),
    );
    if (!data) return handleResponse(false, null, 'USER NOT FOUND');
    await lastValueFrom(
      await this.commonSrv.delete(
        AM_SERVICE.USER_SERVICE.SERVICE_NAME,
        AM_SERVICE.USER_SERVICE.ENTITY.USER_INFO,
        {
          id: payload.userId,
        },
      ),
    );

    await lastValueFrom(
      await this.commonSrv.delete(
        AM_SERVICE.AUTH_SERVICE.SERVICE_NAME,
        AM_SERVICE.AUTH_SERVICE.ENTITY.AUTH_INFO,
        {
          id: (data as any)?.authId,
        },
      ),
    );
    return handleResponse(true, null, 'DELETE SUCCESS');
  }
}
