import { HierarchyLevelDTO } from 'src/common/common.dto';

export interface MaterialQuantity {
  quantity?: number;
  unit?: number;
}
export interface UsefulLife {
  minYear?: number;
  maxYear?: number;
}
export interface DepriationBasis {
  minValue?: number;
  maxValue?: number;
}

export enum AssetCondition {
  New = 'New',
  InUse = 'InUse',
  InRepair = 'InRepair',
  InMaintain = 'InMaintain',
  RequestLiquidation = 'RequestLiquidation',
  Liquidated = 'Liquidated',
  RequestLost = 'RequestLost',
  Lost = 'Lost',
  Transfering = 'Transfering',
  Borrowing = 'Borrowing',
  ReportBroken = 'ReportBroken',
  Broken = 'Broken',
}
export interface AcquisitionSourceDTO {
  name: string;
  description: string;
}

export interface AssetCategory {
  name?: string;
  code?: string;
  description?: string;
  usefulLife?: UsefulLife;
  depriationBasis?: DepriationBasis;
  isActive?: boolean;
  hierachy?: HierarchyLevelDTO;
}

export interface AssetTypeReq {
  categoryId?: number;
}

export interface Paging {
  limit?: number;
  page?: number;
}

export interface AssetQueryPaging {
  acquisitionSourceId?: number;
  assetTypeId?: number;
}

export interface UpdateAssetReq {
  id: string;
  name: string;
  quantity: number;
  image: string;
  originalCost: number;
  specification: string;
  isWarranty: boolean;
  warrantyDuration: number;
  timeUnit: string;
  warrantyStartDate: string;
  warrantyEndDate: string;
  warrantyCondition: string;
  note: string;
  conditionState: string;
  purchase_date: string;
  depreciationAmount: number;
  serialNumber: string;
  acquisitionSourceId: number;
  assetTypeId: number;
}

export interface CreateAssetReq {
  name: string;
  quantity: number;
  image: string;
  originalCost: number;
  specification: string;
  isWarranty: boolean;
  warrantyDuration: number;
  timeUnit: string;
  warrantyStartDate: string;
  warrantyEndDate: string;
  warrantyCondition: string;
  note: string;
  conditionState: string;
  purchaseDate: string;
  depreciationAmount: number;
  serialNumber: string;
  acquisitionSourceId: number;
  assetTypeId: number;
}

export interface DeleteAssetReq {
  id: string;
}

export interface AssignAssetReq {
  assetId: string;
  toUserId?: string;
  reason?: string;
}

export interface RetrieveAssetReq {
  assetId: string;
  fromUserId?: string;
}

export interface AuditSessionQuery {
  status: string;
}

export interface AuditSessionBody {
  name: string;
  startDate: string;
  endDate: string;
  assigneeId: string;
  note: string;
  assets: string[];
}

export interface UpdateSessionBody {
  name: string;
  startDate: string;
  endDate: string;
  assigneeId: string;
  note: string;
  status: string;
  sessionId: string;
  assets: string[];
}
