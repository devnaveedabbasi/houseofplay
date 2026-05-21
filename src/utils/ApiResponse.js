/**
 * Standardized success response wrapper.
 * Use this in controllers to return consistent JSON shapes.
 *
 * @example
 *   return new ApiResponse(200, { user }, 'Login successful');
 */
class ApiResponse {
  constructor(statusCode, data, message = 'Success') {
    this.statusCode = statusCode;
    this.data = data;
    this.message = message;
    this.success = statusCode < 400;
    this.timestamp = new Date().toISOString();
  }
}

export { ApiResponse };
