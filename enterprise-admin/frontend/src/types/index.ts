// 统一响应结构 / Unified response
export interface ApiResponse<T = any> {
  code: number;
  message: string;
  data: T;
}

// 分页结果 / Paginated result
export interface PaginatedResult<T = any> {
  list: T[];
  total: number;
  page: number;
  pageSize: number;
}

// 菜单节点 / Menu node
export interface MenuItem {
  id: string;
  name: string;
  code: string;
  type: string;
  path?: string;
  component?: string;
  icon?: string;
  sort: number;
  children?: MenuItem[];
}

// 用户信息 / User info
export interface UserInfo {
  id: string;
  username: string;
  name: string;
  email?: string;
  phone?: string;
  avatar?: string;
  roles: string[];
  permissions?: string[];
}

// 角色对象 / Role object
export interface Role {
  id: string;
  name: string;
  code: string;
  description?: string;
  createdAt?: string;
}

// 权限对象 / Permission object
export interface Permission {
  id: string;
  name: string;
  code: string;
  type: string;
  parentId?: string;
  path?: string;
  component?: string;
  icon?: string;
  sort: number;
  children?: Permission[];
}

// 部门对象 / Dept object
export interface Dept {
  id: string;
  name: string;
  parentId?: string;
  sort: number;
  leader?: string;
  status: number;
  children?: Dept[];
}

// 系统配置 / System config
export interface SystemConfig {
  id: string;
  key: string;
  value: string;
  remark?: string;
  createdAt?: string;
}

// 字典类型 / Dict type
export interface DictType {
  id: string;
  name: string;
  code: string;
  status: number;
  itemCount?: number;
  createdAt?: string;
}

// 字典项 / Dict item
export interface DictItem {
  id: string;
  dictTypeId: string;
  label: string;
  value: string;
  sort: number;
  status: number;
}

// 操作日志 / Operation log
export interface OperationLog {
  id: string;
  userId?: string;
  username?: string;
  action: string;
  target?: string;
  ip?: string;
  detail?: string;
  createdAt: string;
}
