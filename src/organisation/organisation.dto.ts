import { HierarchyLevelDTO } from 'src/common/common.dto';

export interface Address {
  location?: string;
  province?: string;
  city?: string;
  country?: string;
}

export interface OrganisationUnitTypeDTO {
  limit?: number;
  page?: number;
}

export interface TenantContact {
  phone?: string;
  fax?: string;
  email?: string;
}
export interface TenantInformationDTO {
  name?: string;
  tenantAddress?: Address;
  tenantContact?: TenantContact;
  businessRegistrationCode?: string;
  dateOfEstablishment?: string;
  logo?: string;
  state?: string;
  id?: number;
}
export interface OrgUnitTypeDTO {
  name?: string;
  tenantId?: number;
}

export enum OrgUnitState {
  Active = 'Active',
  Archived = 'Archived',
}
export enum AreaOfOperation {
  Business = 'Business',
  Office = 'Office',
  Supporting = 'Supporting',
  Producing = 'Producing',
}
export interface OrgUnitDTO {
  name?: string;
  state?: OrgUnitState;
  description?: string;
  parentId?: number;
  sortId?: string;
  areaOfOperation?: string;
  businessFunctionDescription?: string;
  organisationUnitTypeId?: number;
}
export interface LocationDTO {
  name?: string;
  state?: OrgUnitState;
  code: string;
  description?: string;
  locationHierarchy?: HierarchyLevelDTO;
  areaOfOperation?: AreaOfOperation;
  businessFunctionDescription?: string;
  tenantId?: number;
}
