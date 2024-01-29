export type CreateRoleDTO = {
  roleName: string;
  permissionIds: number[];
  tenantId: number;
};

export type DeleteRoleDTO = {
  roleId: string;
};

export type UpdateRoleDTO = {
  roleId: string;
  roleName: string;
  permissionIds: number[];
};

export type Paging = {
  limit: number;
  page: number;
};

export type UserDTO = {
  firstName?: string;
  lastName?: string;
  location?: string;
  city?: string;
  province?: string;
  workingPosition?: string;
  phoneNumber?: string;
  email?: string;
  gender?: string;
  roleId?: string | number;
  tenantId?: string | number;
  status?: string;
  password?: string;
};
