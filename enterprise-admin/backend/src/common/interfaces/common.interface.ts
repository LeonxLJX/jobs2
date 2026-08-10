// 通用接口 / Common interfaces

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

// JWT 载荷 / JWT payload
export interface JwtPayload {
  sub: string;
  username: string;
}
