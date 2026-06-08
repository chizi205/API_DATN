/**
 * Utility functions for standardized API responses
 */

class ApiResponse {
  
  /**
   * Response thành công
   */
  static success(res, data = null, message = 'Thành công', statusCode = 200) {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Response lỗi
   */
  static error(res, message = 'Có lỗi xảy ra', statusCode = 400, errors = null) {
    return res.status(statusCode).json({
      success: false,
      message,
      errors,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Response Created (POST thành công)
   */
  static created(res, data = null, message = 'Tạo mới thành công') {
    return this.success(res, data, message, 201);
  }

  /**
   * Response No Content (DELETE thành công)
   */
  static noContent(res) {
    return res.status(204).send();
  }

  /**
   * Response Unauthorized (401)
   */
  static unauthorized(res, message = 'Không có quyền truy cập') {
    return this.error(res, message, 401);
  }

  /**
   * Response Forbidden (403)
   */
  static forbidden(res, message = 'Truy cập bị từ chối') {
    return this.error(res, message, 403);
  }

  /**
   * Response Not Found (404)
   */
  static notFound(res, message = 'Không tìm thấy tài nguyên') {
    return this.error(res, message, 404);
  }

  /**
   * Response Server Error (500)
   */
  static serverError(res, message = 'Lỗi máy chủ nội bộ') {
    return this.error(res, message, 500);
  }
}

module.exports = ApiResponse;