import { ConfigService } from '@nestjs/config';
import { ClientProxyFactory, Transport } from '@nestjs/microservices';
import { CommonService } from 'src/common/common.service';

export const AM_SERVICE = {
  USER_SERVICE: {
    SERVICE_NAME: 'USER_SERVICE',
    ENTITY: {
      USER_PERMISSION: 'USER_PERMISSION',
      USER_PERMISSION_ROLE_MAPPING: 'USER_PERMISSION_ROLE_MAPPING',
      USER_ROLE: 'USER_ROLE',
      USER_INFO: 'USER_INFO',
      USER_PERMISSION_GROUP: 'USER_PERMISSION_GROUP',
    },
  },
  AUTH_SERVICE: {
    SERVICE_NAME: 'AUTH_SERVICE',
    ENTITY: {
      AUTH_INFO: 'AUTH_INFO',
    },
  },
  ORGANISATION_SERVICE: {
    SERVICE_NAME: 'ORGANISATION_SERVICE',
    ENTITY: {
      TENANT_INFO: 'TENANT_INFO',
      ORGANISATION_UNIT: 'ORGANISATION_UNIT',
      ORGANISATION_UNIT_TYPE: 'ORGANISATION_UNIT_TYPE',
      LOCATION: 'LOCATION',
      LOCATION_OF_ORG_UNIT: 'LOCATION_OF_ORG_UNIT',
    },
  },
  ASSET_SERVICE: {
    SERVICE_NAME: 'ASSET_SERVICE',
    ENTITY: {
      ACQUISITION_SOURCE: 'ACQUISITION_SOURCE',
      ALLOCATION_REDUCE_ASSET: 'ALLOCATION_REDUCE_ASSET',
      ASSET_CATEGORY: 'ASSET_CATEGORY',
      ASSET_COMPONENT_TYPE: 'ASSET_COMPONENT_TYPE',
      ASSET_TYPE: 'ASSET_TYPE',
      ASSET: 'ASSET',
      CANCEL_ASSET: 'CANCEL_ASSET',
      COMPONENT_EMBEDDED_IN_ASSET: 'COMPONENT_EMBEDDED_IN_ASSET',
      LOST_ASSET: 'LOST_ASSET',
      TRANSFER_ASSET: 'TRANSFER_ASSET',
      LIQUID_ASSET: 'LIQUID_ASSET',
      ASSET_COMPONENT: 'ASSET_COMPONENT',
      ACQUIRE_ASSET: 'ACQUIRE_ASSET',
      ACQUIRE_ASSET_COMPONENT: 'ACQUIRE_ASSET_COMPONENT',
      AUDIT_SESSION: 'AUDIT_SESSION',
      AUDIT_ASSET_MAPPING: 'AUDIT_ASSET_MAPPING',
    },
  },
};

export const commonProvider = [
  {
    provide: AM_SERVICE.ORGANISATION_SERVICE.SERVICE_NAME,
    inject: [ConfigService],
    useFactory: (configService: ConfigService) =>
      ClientProxyFactory.create({
        transport: Transport.TCP,
        options: {
          host: configService.get(
            `${AM_SERVICE.ORGANISATION_SERVICE.SERVICE_NAME}_HOST`,
          ),
          port: configService.get(
            `${AM_SERVICE.ORGANISATION_SERVICE.SERVICE_NAME}_PORT`,
          ),
        },
      }),
  },
  {
    provide: AM_SERVICE.USER_SERVICE.SERVICE_NAME,
    inject: [ConfigService],
    useFactory: (configService: ConfigService) =>
      ClientProxyFactory.create({
        transport: Transport.TCP,
        options: {
          host: configService.get(
            `${AM_SERVICE.USER_SERVICE.SERVICE_NAME}_HOST`,
          ),
          port: configService.get(
            `${AM_SERVICE.USER_SERVICE.SERVICE_NAME}_PORT`,
          ),
        },
      }),
  },
  {
    provide: AM_SERVICE.AUTH_SERVICE.SERVICE_NAME,
    inject: [ConfigService],
    useFactory: (configService: ConfigService) =>
      ClientProxyFactory.create({
        transport: Transport.TCP,
        options: {
          host: configService.get(
            `${AM_SERVICE.AUTH_SERVICE.SERVICE_NAME}_HOST`,
          ),
          port: configService.get(
            `${AM_SERVICE.AUTH_SERVICE.SERVICE_NAME}_PORT`,
          ),
        },
      }),
  },
  {
    provide: AM_SERVICE.ASSET_SERVICE.SERVICE_NAME,
    inject: [ConfigService],
    useFactory: (configService: ConfigService) =>
      ClientProxyFactory.create({
        transport: Transport.TCP,
        options: {
          host: configService.get(
            `${AM_SERVICE.ASSET_SERVICE.SERVICE_NAME}_HOST`,
          ),
          port: configService.get(
            `${AM_SERVICE.ASSET_SERVICE.SERVICE_NAME}_PORT`,
          ),
        },
      }),
  },
  CommonService,
];

export const AUDIT_STATUS = {
  UPCOMING: "UPCOMING",
  AUDITING: "AUDITING",
  FINISHED: "FINISHED",
  CANCLED: "CANCLED",
}
