import { Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

export class CommonService {
  [x: string]: any;
  constructor(
    @Inject('USER_SERVICE') private userSrv: ClientProxy,
    @Inject('AUTH_SERVICE') private authSrv: ClientProxy,
    @Inject('ORGANISATION_SERVICE') private organisationSrv: ClientProxy,
    @Inject('ASSET_SERVICE') private assetSrv: ClientProxy,
  ) {}

  private services = {
    USER_SERVICE: this.userSrv,
    AUTH_SERVICE: this.authSrv,
    ORGANISATION_SERVICE: this.organisationSrv,
    ASSET_SERVICE: this.assetSrv,
  };

  async call(service: string, cmd: string, payload: any) {
    const serviceClient = this.services[service];
    return serviceClient.send(
      { cmd: cmd },
      {
        ...payload,
      },
    );
  }

  async getList(service: string, entity: string, payload: any = {}) {
    const serviceClient = this.services[service];
    return serviceClient.send(
      { cmd: 'common-pattern' },
      {
        action: 'GET-LIST',
        payload: payload,
        entity: entity,
      },
    );
  }

  async getOne(service: string, entity: string, payload: any = {}) {
    const serviceClient = this.services[service];
    return serviceClient.send(
      { cmd: 'common-pattern' },
      {
        action: 'GET-ONE',
        payload: payload,
        entity: entity,
      },
    );
  }

  async getByIds(service: string, entity: string, payload: any = {}) {
    const serviceClient = this.services[service];
    return serviceClient.send(
      { cmd: 'common-pattern' },
      {
        action: 'GET-BY-IDS',
        payload: payload,
        entity: entity,
      },
    );
  }

  async getListPaging(service: string, entity: string, payload: any = {}) {
    const serviceClient = this.services[service];
    return serviceClient.send(
      { cmd: 'common-pattern' },
      {
        action: 'GET-LIST-PAGING',
        payload: payload,
        entity: entity,
      },
    );
  }

  async update(service: string, entity: string, payload: any = {}) {
    const serviceClient = this.services[service];
    return serviceClient.send(
      { cmd: 'common-pattern' },
      {
        action: 'UPDATE',
        payload: payload,
        entity: entity,
      },
    );
  }

  async save(service: string, entity: string, payload: any = {}) {
    const serviceClient = this.services[service];
    return serviceClient.send(
      { cmd: 'common-pattern' },
      {
        action: 'SAVE',
        payload: payload,
        entity: entity,
      },
    );
  }

  async delete(service: string, entity: string, payload: any = {}) {
    const serviceClient = this.services[service];
    return serviceClient.send(
      { cmd: 'common-pattern' },
      {
        action: 'DELETE',
        payload: payload,
        entity: entity,
      },
    );
  }
}
