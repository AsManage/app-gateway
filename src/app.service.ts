import { Injectable } from '@nestjs/common';
import { CommonService } from './common/common.service';
import { AM_SERVICE } from './constants';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class AppService {
  constructor(private commonSrv: CommonService) { }

  async getHello() {
    const data = await lastValueFrom(
      await this.commonSrv.getList(
        AM_SERVICE.ASSET_SERVICE.SERVICE_NAME,
        AM_SERVICE.ASSET_SERVICE.ENTITY.ACQUISITION_SOURCE,
        {},
      ),
    );
    return data;
  }

  async getList() {
    const data = await this.commonSrv.getList(
      AM_SERVICE.AUTH_SERVICE.SERVICE_NAME,
      AM_SERVICE.AUTH_SERVICE.ENTITY.AUTH_INFO,
      {
        where: {
          id: 3,
        },
      },
    );
    console.log(data);
    return data;
  }

  async getOne() {
    const data = await this.commonSrv.getOne(
      AM_SERVICE.AUTH_SERVICE.SERVICE_NAME,
      AM_SERVICE.AUTH_SERVICE.ENTITY.AUTH_INFO,
      {
        id: 10,
      },
    );
    console.log(data);
    return data;
  }

  async getByIds() {
    const data = await this.commonSrv.getByIds(
      AM_SERVICE.AUTH_SERVICE.SERVICE_NAME,
      AM_SERVICE.AUTH_SERVICE.ENTITY.AUTH_INFO,
      [1, 2, 3, 4],
    );
    console.log(data);
    return data;
  }

  async getListPaging() {
    const data = await this.commonSrv.getListPaging(
      AM_SERVICE.AUTH_SERVICE.SERVICE_NAME,
      AM_SERVICE.AUTH_SERVICE.ENTITY.AUTH_INFO,
      {
        query: {},
        pagination: {
          limit: 1,
          page: 1,
        },
        order: {},
      },
    );
    return data;
  }

  async update() {
    const data = await this.commonSrv.update(
      AM_SERVICE.AUTH_SERVICE.SERVICE_NAME,
      AM_SERVICE.AUTH_SERVICE.ENTITY.AUTH_INFO,
      {
        conditions: {
          id: 3,
        },
        data: {
          email: '12312',
        },
        id: 1, // Updated user ID
      },
    );
    return data;
  }

  async save() {
    const data = await this.commonSrv.save(
      AM_SERVICE.AUTH_SERVICE.SERVICE_NAME,
      AM_SERVICE.AUTH_SERVICE.ENTITY.AUTH_INFO,
      {
        checkExisted: {
          id: 10,
        },
        data: {
          email: 'data',
          password: '123',
        },
      },
    );
    return data;
  }
}
