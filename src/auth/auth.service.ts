import { Injectable } from '@nestjs/common';
import { CommonService } from 'src/common/common.service';
import { AM_SERVICE } from 'src/constants';
import {
  AuthDTO,
  ChangePasswordDTO,
  SendOtpDTO,
  VerifyOtpDTO,
} from './auth.dto';
import { ResponseType } from 'src/interfaces/response';
import { EmailService } from 'src/email/email.service';
import { lastValueFrom } from 'rxjs';
import { handleResponse, messParser } from 'src/utils/common';
import * as _ from 'lodash';

@Injectable()
export class AuthService {
  constructor(
    private commonSrv: CommonService,
    private mailSrv: EmailService,
  ) {}

  async handleAuth(payload: AuthDTO) {
    const data = (await lastValueFrom(
      await this.commonSrv.call(
        AM_SERVICE.AUTH_SERVICE.SERVICE_NAME,
        'authentication',
        payload,
      ),
    )) as ResponseType;
    const { authId, tenantId } = data.result;
    if (authId && data.isSuccess) {
      const userInfo = await lastValueFrom(
        await this.commonSrv.getOne(
          AM_SERVICE.USER_SERVICE.SERVICE_NAME,
          AM_SERVICE.USER_SERVICE.ENTITY.USER_INFO,
          {
            authId,
          },
        ),
      );

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

      const listPermission =
        listRole && (listRole as any).length > 0
          ? await lastValueFrom(
              await this.commonSrv.getList(
                AM_SERVICE.USER_SERVICE.SERVICE_NAME,
                AM_SERVICE.USER_SERVICE.ENTITY.USER_PERMISSION,
                {},
              ),
            )
          : [];
      const listPermissionKeyBy = _.mapKeys(listPermission as any, 'id');

      const listPermissionMapping =
        listRole && (listRole as any).length > 0
          ? await lastValueFrom(
              await this.commonSrv.getList(
                AM_SERVICE.USER_SERVICE.SERVICE_NAME,
                AM_SERVICE.USER_SERVICE.ENTITY.USER_PERMISSION_ROLE_MAPPING,
                {
                  where: {
                    roleId: (userInfo as any)?.roleId,
                  },
                },
              ),
            )
          : [];

      const listKeyPermission = Object.keys(
        _.mapKeys(listPermissionMapping as any, 'permissionId'),
      );

      const listRoleKeys = _.mapKeys(listRole as any, 'id');

      return handleResponse(
        true,
        {
          accessToken: data.result.accessToken,
          userInfo: {
            ...(userInfo as any),
            role: (listRoleKeys[(userInfo as any)?.roleId] as any)?.name,
            permission: listKeyPermission.map(
              (ele) =>
                listPermissionKeyBy[ele] && listPermissionKeyBy[ele]?.name,
            ),
          },
        },
        'VALIDATE SUCCESS',
      );
    }

    return data as ResponseType;
  }

  async updateAuth(payload: AuthDTO) {
    const data = await this.commonSrv.call(
      AM_SERVICE.AUTH_SERVICE.SERVICE_NAME,
      'update-auth-password',
      payload,
    );
    return data as ResponseType;
  }

  async handleCreateAccount(payload: AuthDTO) {
    const data = await this.commonSrv.call(
      AM_SERVICE.AUTH_SERVICE.SERVICE_NAME,
      'create-auth-info',
      payload,
    );
    return data as ResponseType;
  }

  async handleSendOtpCode(payload: SendOtpDTO) {
    const data = await this.commonSrv.call(
      AM_SERVICE.AUTH_SERVICE.SERVICE_NAME,
      'send-reset-code',
      payload,
    );
    const { result, isSuccess, message } = (await lastValueFrom(
      data,
    )) as ResponseType;
    if (isSuccess) {
      await this.mailSrv.sendVerifyCode(result, payload.email);
    }

    return { result: null, isSuccess, message };
  }

  async handleVerifyOtpCode(payload: VerifyOtpDTO) {
    const data = await this.commonSrv.call(
      AM_SERVICE.AUTH_SERVICE.SERVICE_NAME,
      'verify-reset-code',
      payload,
    );
    return data as ResponseType;
  }

  async handleChangePassword(payload: ChangePasswordDTO) {
    const data = await this.commonSrv.call(
      AM_SERVICE.AUTH_SERVICE.SERVICE_NAME,
      'change-password',
      payload,
    );
    return data as ResponseType;
  }
}
