/* ============================================================
 * 统一响应工具 / Unified Response Helpers
 * 所有接口统一返回 { code, message, data }
 * ============================================================ */
export class ApiResponse<T = any> {
  code: number;
  message: string;
  data: T;

  constructor(code: number, message: string, data: T) {
    this.code = code;
    this.message = message;
    this.data = data;
  }

  // 成功 / Success
  static ok<T>(data: T, message = 'success') {
    return new ApiResponse(0, message, data);
  }

  // 失败 / Fail
  static fail(message = 'error', code = -1, data: any = null) {
    return new ApiResponse(code, message, data);
  }
}
