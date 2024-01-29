import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';

import { AuthGuard } from 'src/guards/auth.guard';
import {
  CreateRoleDTO,
  DeleteRoleDTO,
  Paging,
  UpdateRoleDTO,
  UserDTO,
} from './user.dto';

@Controller('user')
@UseGuards(AuthGuard)
export class UserController {
  constructor(private userSrv: UserService) {}

  @Get('system-permission')
  async getListPermissionSystem() {
    return await this.userSrv.getListSystemPermission();
  }

  @Get('role')
  async getRoleSystem(@Req() req: Request) {
    const { tenantId } = req['user'];
    return await this.userSrv.getRole({
      tenantId,
    });
  }

  @Post('role')
  async createRoleSystem(@Req() req: Request, @Body() payload: CreateRoleDTO) {
    const { tenantId } = req['user'];
    const { permissionIds, roleName } = payload;
    return await this.userSrv.createRole({
      roleName,
      permissionIds,
      tenantId,
    });
  }

  @Delete('role')
  async deleteRoleSystem(@Req() req: Request, @Query() payload: DeleteRoleDTO) {
    const { roleId } = payload;
    return await this.userSrv.deleteRole({
      roleId,
    });
  }

  @Put('role')
  async updateRoleSystem(@Req() req: Request, @Body() payload: UpdateRoleDTO) {
    const { roleId, permissionIds, roleName } = payload;
    return await this.userSrv.updateRole({
      roleId,
      permissionIds,
      roleName,
    });
  }

  @Post('info')
  async createUser(@Req() req: Request, @Body() payload: UserDTO) {
    const { tenantId } = req['user'];
    return await this.userSrv.createUser(tenantId, payload);
  }

  @Get('info')
  async getListUser(@Req() req: Request, @Body() payload: Paging) {
    const { tenantId, id } = req['user'];
    return await this.userSrv.getListUser(tenantId, id, payload);
  }

  @Get('option')
  async getListUserOption(@Req() req: Request) {
    const { tenantId, id } = req['user'];
    return await this.userSrv.getListUserOption(tenantId, id);
  }

  @Get('info/:userId')
  async getUserDetail(@Req() req: Request, @Param() params: any) {
    const { userId } = params;
    const { tenantId } = req['user'];
    return await this.userSrv.getDetailUser(tenantId, userId);
  }

  @Delete('info')
  async deleteUser(@Req() req: Request, @Query() payload: { userId: string }) {
    const { tenantId } = req['user'];
    return await this.userSrv.deleteUser(tenantId, payload);
  }
}
