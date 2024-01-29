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
  Res,
  UseGuards,
} from '@nestjs/common';
import { AssetService } from './asset.service';
import {
  AssetTypeReq,
  AssignAssetReq,
  AuditSessionBody,
  AuditSessionQuery,
  CreateAssetReq,
  DeleteAssetReq,
  RetrieveAssetReq,
  UpdateAssetReq,
  UpdateSessionBody,
} from './asset.dto';
import { Paging } from 'src/user/user.dto';
import { Request, Response } from 'express';
import { AuthGuard } from 'src/guards/auth.guard';

@Controller('asset')
@UseGuards(AuthGuard)
export class AssetController {
  constructor(private assetService: AssetService) { }

  @Get('category')
  getListAssetCategory() {
    return this.assetService.getListAssetCategory();
  }

  @Get('type')
  getListAssetType(@Query() payload: AssetTypeReq) {
    return this.assetService.getListAssetType(payload);
  }

  @Get('acquisition')
  getListAcquisition() {
    return this.assetService.getListAssetAcquisition();
  }

  @Post('assign')
  assignAssetToUser(@Req() req: Request, @Body() payload: AssignAssetReq) {
    const { tenantId } = req['user'];
    return this.assetService.assignAsset(tenantId, payload);
  }

  @Post('retrieve')
  retrieveAssetToUser(@Req() req: Request, @Body() payload: RetrieveAssetReq) {
    const { tenantId } = req['user'];
    return this.assetService.retrieveAsset(tenantId, payload);
  }

  @Get()
  getListAssetPaging(@Req() req: Request, @Query() params: Paging) {
    const { tenantId } = req['user'];
    return this.assetService.getListAssetPaging(tenantId, params);
  }

  @Get('export')
  async exportAsset(@Req() req: Request, @Res() res: Response) {
    const { tenantId } = req['user'];

    const buffer = await this.assetService.exportAsset(tenantId);
    return res
      .set('Content-Disposition', `attachment; filename=example.xlsx`)
      .send(buffer);
  }

  @Get('audit-session')
  getListAuditSession(@Req() req: Request, @Query() query: AuditSessionQuery) {
    const { tenantId } = req['user'];
    return this.assetService.getListAudiSession(tenantId, query);
  }

  @Post('audit-session')
  createListAuditSession(
    @Req() req: Request,
    @Body() payload: AuditSessionBody,
  ) {
    const { tenantId, id } = req['user'];
    return this.assetService.createAuditSession(tenantId, id, payload);
  }

  @Put('audit-session')
  updateListAuditSession(
    @Req() req: Request,
    @Body() payload: UpdateSessionBody,
  ) {
    const { tenantId, id } = req['user'];
    return this.assetService.updateSessionAuditSession(tenantId, id, payload);
  }

  @Get('audit-session/:sessionId')
  getDetailAuditSession(@Req() req: Request, @Param() params: any) {
    const { tenantId } = req['user'];
    const { sessionId } = params;
    return this.assetService.getDetailAudiSession(tenantId, sessionId);
  }

  @Get(':assetId')
  getDetailAsset(@Req() req: Request, @Param() params: any) {
    const { tenantId } = req['user'];
    const { assetId } = params;
    return this.assetService.getDetailAsset(tenantId, assetId);
  }

  @Post()
  createAsset(@Req() req: Request, @Body() payload: CreateAssetReq) {
    const { tenantId, id } = req['user'];
    return this.assetService.createAsset(tenantId, id, payload);
  }

  @Put()
  updateAsset(@Req() req: Request, @Body() payload: UpdateAssetReq) {
    const { tenantId, id } = req['user'];
    return this.assetService.updateAsset(tenantId, id, payload);
  }

  @Delete()
  deleteAsset(@Req() req: Request, @Query() payload: DeleteAssetReq) {
    const { tenantId } = req['user'];
    return this.assetService.deleteAsset(tenantId, payload);
  }
}
