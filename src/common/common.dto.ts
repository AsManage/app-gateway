export enum TimeUnit {
  Day = 'Day',
  Week = 'Week',
  Month = 'Month',
  Year = 'Year',
}

export interface HierarchyLevelDTO {
  parentId?: number;
  sortId?: string;
}
export interface getListPagingDTO {
  limit?: number;
  page?: number;
}
