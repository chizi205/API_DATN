/**
 * Swagger API Documentation configuration
 * Using OpenAPI Specification 3.0.0
 */

const swaggerDocument = {
  openapi: "3.0.0",
  info: {
    title: "API DATN",
    version: "1.0.0",
    description: "Tài liệu API cho dự án Đồ Án Tốt Nghiệp (DATN)",
  },
  servers: [
    {
      url: "http://localhost:3100",
      description: "Local server",
    },
  ],
  tags: [
    {
      name: "Member Auth",
      description: "Các API xác thực và tài khoản cho Thành viên (Member)",
    },
    {
      name: "Member Info",
      description: "Các API thông tin cá nhân và thẻ thành viên",
    },
    {
      name: "Member Device",
      description: "Các API liên quan đến thiết bị và thông báo FCM",
    },
    {
      name: "Employee Auth",
      description: "Các API xác thực và tài khoản cho Nhân viên (Employee)",
    },
    {
      name: "Employee Products & Categories",
      description: "Các API quản lý và tra cứu sản phẩm/danh mục dành cho Nhân viên",
    },
    {
      name: "Employee Invoices",
      description: "Các API quản lý hóa đơn (chỉ dành cho Nhân viên)",
    },
  ],
  components: {
    securitySchemes: {
      BearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        description: "Nhập JWT Access Token (hoặc Registration Token) dạng: `Bearer <token>`",
      },
    },
    schemas: {
      ApiResponse: {
        type: "object",
        properties: {
          success: {
            type: "boolean",
            example: true,
          },
          message: {
            type: "string",
            example: "Thao tác thành công",
          },
          timestamp: {
            type: "string",
            format: "date-time",
            example: "2026-06-11T07:49:14.123Z",
          },
        },
      },
      SendOtpRequest: {
        type: "object",
        required: ["phone"],
        properties: {
          phone: {
            type: "string",
            pattern: "^(0|\\+?84)(3|5|7|8|9)[0-9]{8}$",
            example: "0987654321",
            description: "Số điện thoại của thành viên (định dạng Việt Nam)",
          },
        },
      },
      VerifyOtpRequest: {
        type: "object",
        required: ["phone", "code"],
        properties: {
          phone: {
            type: "string",
            pattern: "^(0|\\+?84)(3|5|7|8|9)[0-9]{8}$",
            example: "0987654321",
          },
          code: {
            type: "string",
            minLength: 4,
            maxLength: 6,
            example: "123456",
            description: "Mã OTP gồm 4 đến 6 chữ số",
          },
        },
      },
      CompleteRegistrationRequest: {
        type: "object",
        required: ["full_name"],
        properties: {
          full_name: {
            type: "string",
            minLength: 2,
            maxLength: 100,
            example: "Nguyễn Văn A",
            description: "Họ và tên thành viên",
          },
          email: {
            type: "string",
            format: "email",
            example: "nguyenvana@example.com",
            description: "Email liên kết (tùy chọn)",
          },
          date_of_birth: {
            type: "string",
            pattern: "^(0[1-9]|[12][0-9]|3[01])/(0[1-9]|1[0-2])/\\d{4}$",
            example: "20/05/2000",
            description: "Ngày sinh định dạng DD/MM/YYYY (tùy chọn)",
          },
        },
      },
      RefreshTokenRequest: {
        type: "object",
        required: ["refresh_token"],
        properties: {
          refresh_token: {
            type: "string",
            example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwicHVycG9zZSI6InJlZnJlc2gifQ...",
            description: "JWT Refresh Token",
          },
        },
      },
      RegisterDeviceRequest: {
        type: "object",
        required: ["fcm_token"],
        properties: {
          fcm_token: {
            type: "string",
            example: "fcm_token_sample_123456789",
            description: "FCM token của thiết bị",
          },
          device_info: {
            type: "object",
            example: {
              os: "Android",
              model: "Samsung Galaxy S21",
              version: "12.0",
            },
            description: "Thông tin thiết bị (tùy chọn)",
          },
        },
      },
      UpdateProfileRequest: {
        type: "object",
        required: ["full_name"],
        properties: {
          full_name: {
            type: "string",
            minLength: 2,
            maxLength: 100,
            example: "Nguyễn Văn B",
          },
          email: {
            type: "string",
            format: "email",
            example: "nguyenvanb@example.com",
          },
          date_of_birth: {
            type: "string",
            example: "20/05/2000",
          },
          gender: {
            type: "string",
            enum: ["MALE", "FEMALE", "OTHER", "UNKNOWN"],
            example: "MALE",
          },
        },
      },
      EmployeeLoginRequest: {
        type: "object",
        required: ["identifier", "password"],
        properties: {
          identifier: {
            type: "string",
            example: "admin@example.com",
            description: "Email hoặc Số điện thoại của nhân viên",
          },
          password: {
            type: "string",
            example: "123456",
            description: "Mật khẩu đăng nhập",
          },
        },
      },
      CreateDraftInvoiceRequest: {
        type: "object",
        required: ["items"],
        properties: {
          member_id: {
            type: "integer",
            example: 12,
            description: "ID thành viên (tùy chọn, để tích điểm và áp dụng hệ số điểm)",
          },
          table_number: {
            type: "string",
            maxLength: 20,
            example: "Bàn 05",
            description: "Số bàn (tùy chọn)",
          },
          tax_amount: {
            type: "number",
            minimum: 0,
            example: 10000,
            description: "Tiền thuế VAT (tùy chọn, mặc định 0)",
          },
          service_charge: {
            type: "number",
            minimum: 0,
            example: 5000,
            description: "Phí dịch vụ (tùy chọn, mặc định 0)",
          },
          points_multiplier: {
            type: "number",
            minimum: 0,
            example: 1.0,
            description: "Hệ số nhân điểm tích lũy (tùy chọn, mặc định 1.0)",
          },
          items: {
            type: "array",
            minItems: 1,
            description: "Danh sách món ăn/sản phẩm trong hóa đơn",
            items: {
              type: "object",
              required: ["product_name", "quantity", "unit_price"],
              properties: {
                product_id: {
                  type: "integer",
                  minimum: 1,
                  example: 101,
                  description: "ID sản phẩm (tùy chọn)",
                },
                product_name: {
                  type: "string",
                  minLength: 2,
                  maxLength: 255,
                  example: "Cà phê sữa đá",
                  description: "Tên món ăn",
                },
                quantity: {
                  type: "integer",
                  minimum: 1,
                  example: 2,
                  description: "Số lượng món",
                },
                unit_price: {
                  type: "number",
                  minimum: 0,
                  example: 29000,
                  description: "Đơn giá của món",
                },
              },
            },
          },
        },
      },
    },
  },
  paths: {
    "/api/member/send-otp": {
      post: {
        tags: ["Member Auth"],
        summary: "Gửi mã OTP về số điện thoại",
        description: "Gửi mã xác thực OTP qua số điện thoại để đăng ký hoặc đăng nhập.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/SendOtpRequest",
              },
            },
          },
        },
        responses: {
          200: {
            description: "Gửi OTP thành công",
            content: {
              "application/json": {
                schema: {
                  allOf: [
                    { $ref: "#/components/schemas/ApiResponse" },
                    {
                      type: "object",
                      properties: {
                        data: {
                          type: "object",
                          properties: {
                            phone: { type: "string", example: "0987654321" },
                          },
                        },
                      },
                    },
                  ],
                },
              },
            },
          },
          400: {
            description: "Yêu cầu không hợp lệ (ví dụ: Sai số điện thoại)",
          },
        },
      },
    },
    "/api/member/verify-otp": {
      post: {
        tags: ["Member Auth"],
        summary: "Xác thực mã OTP",
        description: "Xác thực OTP đã gửi. Nếu là thành viên mới, trả về token đăng ký tạm thời. Nếu là thành viên cũ, đăng nhập thành công và trả về bộ access/refresh token.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/VerifyOtpRequest",
              },
            },
          },
        },
        responses: {
          200: {
            description: "Xác thực thành công",
            content: {
              "application/json": {
                schema: {
                  allOf: [
                    { $ref: "#/components/schemas/ApiResponse" },
                    {
                      type: "object",
                      properties: {
                        data: {
                          type: "object",
                          properties: {
                            isNewUser: { type: "boolean", example: false },
                            accessToken: { type: "string", example: "eyJhbGciOi..." },
                            refreshToken: { type: "string", example: "eyJhbGciOi..." },
                            registrationToken: { type: "string", example: "eyJhbGciOi...", description: "Chỉ trả về khi isNewUser là true" },
                          },
                        },
                      },
                    },
                  ],
                },
              },
            },
          },
          400: {
            description: "Mã OTP không đúng hoặc hết hạn",
          },
        },
      },
    },
    "/api/member/complete-registration": {
      post: {
        tags: ["Member Auth"],
        summary: "Hoàn tất đăng ký thành viên mới",
        description: "Điền thông tin cá nhân bắt buộc sau khi xác thực OTP thành công đối với tài khoản mới. Yêu cầu Bearer Registration Token truyền trong header Authorization.",
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/CompleteRegistrationRequest",
              },
            },
          },
        },
        responses: {
          200: {
            description: "Đăng ký thành viên thành công",
            content: {
              "application/json": {
                schema: {
                  allOf: [
                    { $ref: "#/components/schemas/ApiResponse" },
                    {
                      type: "object",
                      properties: {
                        data: {
                          type: "object",
                          properties: {
                            accessToken: { type: "string", example: "eyJhbGciOi..." },
                            refreshToken: { type: "string", example: "eyJhbGciOi..." },
                          },
                        },
                      },
                    },
                  ],
                },
              },
            },
          },
          400: {
            description: "Token không hợp lệ hoặc lỗi dữ liệu đầu vào",
          },
          404: {
            description: "Không tìm thấy thông tin đăng ký thành viên",
          },
        },
      },
    },
    "/api/member/refresh-token": {
      post: {
        tags: ["Member Auth"],
        summary: "Làm mới Access Token",
        description: "Sử dụng Refresh Token để lấy Access Token mới khi Access Token cũ đã hết hạn.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/RefreshTokenRequest",
              },
            },
          },
        },
        responses: {
          200: {
            description: "Lấy token mới thành công",
            content: {
              "application/json": {
                schema: {
                  allOf: [
                    { $ref: "#/components/schemas/ApiResponse" },
                    {
                      type: "object",
                      properties: {
                        data: {
                          type: "object",
                          properties: {
                            accessToken: { type: "string", example: "eyJhbGciOi..." },
                            refreshToken: { type: "string", example: "eyJhbGciOi..." },
                          },
                        },
                      },
                    },
                  ],
                },
              },
            },
          },
          401: {
            description: "Refresh Token không hợp lệ hoặc đã hết hạn",
          },
        },
      },
    },
    "/api/member/logout": {
      post: {
        tags: ["Member Auth"],
        summary: "Đăng xuất tài khoản",
        description: "Hủy phiên đăng nhập hiện tại. Nếu truyền refresh_token, hệ thống sẽ xóa token của phiên đó. Nếu không truyền, hệ thống sẽ đăng xuất khỏi tất cả các thiết bị.",
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: false,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  refresh_token: {
                    type: "string",
                    description: "JWT Refresh Token cần đăng xuất (Tùy chọn)"
                  }
                }
              }
            }
          }
        },
        responses: {
          200: {
            description: "Đăng xuất thành công",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ApiResponse",
                },
              },
            },
          },
          401: {
            description: "Chưa xác thực",
          },
        },
      },
    },
    "/api/member/register": {
      post: {
        tags: ["Member Device"],
        summary: "Đăng ký thiết bị và FCM Token",
        description: "Lưu FCM Token của thiết bị người dùng phục vụ cho việc gửi thông báo Push Notification.",
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/RegisterDeviceRequest",
              },
            },
          },
        },
        responses: {
          200: {
            description: "Đăng ký thiết bị thành công",
            content: {
              "application/json": {
                schema: {
                  allOf: [
                    { $ref: "#/components/schemas/ApiResponse" },
                    {
                      type: "object",
                      properties: {
                        data: {
                          type: "object",
                          properties: {
                            id: { type: "integer", example: 1 },
                            member_id: { type: "integer", example: 12 },
                            fcm_token: { type: "string", example: "fcm_token_sample_123456789" },
                          },
                        },
                      },
                    },
                  ],
                },
              },
            },
          },
          400: {
            description: "Thiếu FCM Token",
          },
          401: {
            description: "Chưa xác thực",
          },
        },
      },
    },
    "/api/member/card": {
      get: {
        tags: ["Member Info"],
        summary: "Lấy thông tin thẻ thành viên",
        description: "Lấy thông tin thẻ ảo thành viên bao gồm mã vạch/mã số thẻ, điểm tích lũy và hạng thành viên.",
        security: [{ BearerAuth: [] }],
        responses: {
          200: {
            description: "Lấy thông tin thành công",
            content: {
              "application/json": {
                schema: {
                  allOf: [
                    { $ref: "#/components/schemas/ApiResponse" },
                    {
                      type: "object",
                      properties: {
                        data: {
                          type: "object",
                          properties: {
                            card_number: { type: "string", example: "MEM-873264" },
                            points: { type: "integer", example: 150 },
                            tier: { type: "string", example: "SILVER" },
                          },
                        },
                      },
                    },
                  ],
                },
              },
            },
          },
          401: {
            description: "Chưa xác thực",
          },
          404: {
            description: "Không tìm thấy thành viên",
          },
        },
      },
    },
    "/api/member/profile": {
      get: {
        tags: ["Member Info"],
        summary: "Lấy thông tin cá nhân",
        description: "Lấy thông tin chi tiết hồ sơ cá nhân của thành viên đang đăng nhập.",
        security: [{ BearerAuth: [] }],
        responses: {
          200: {
            description: "Lấy hồ sơ cá nhân thành công",
            content: {
              "application/json": {
                schema: {
                  allOf: [
                    { $ref: "#/components/schemas/ApiResponse" },
                    {
                      type: "object",
                      properties: {
                        data: {
                          type: "object",
                          properties: {
                            id: { type: "integer", example: 12 },
                            phone: { type: "string", example: "0987654321" },
                            full_name: { type: "string", example: "Nguyễn Văn B" },
                            email: { type: "string", example: "nguyenvanb@example.com" },
                            date_of_birth: { type: "string", example: "2000-05-20T00:00:00.000Z" },
                            gender: { type: "string", example: "MALE" },
                          },
                        },
                      },
                    },
                  ],
                },
              },
            },
          },
          401: {
            description: "Chưa xác thực",
          },
          404: {
            description: "Không tìm thấy thành viên",
          },
        },
      },
      put: {
        tags: ["Member Info"],
        summary: "Cập nhật hồ sơ cá nhân",
        description: "Cập nhật các trường thông tin cá nhân của thành viên.",
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/UpdateProfileRequest",
              },
            },
          },
        },
        responses: {
          200: {
            description: "Cập nhật thành công",
            content: {
              "application/json": {
                schema: {
                  allOf: [
                    { $ref: "#/components/schemas/ApiResponse" },
                    {
                      type: "object",
                      properties: {
                        data: {
                          type: "object",
                          properties: {
                            id: { type: "integer", example: 12 },
                            full_name: { type: "string", example: "Nguyễn Văn B" },
                            email: { type: "string", example: "nguyenvanb@example.com" },
                            date_of_birth: { type: "string", example: "2000-05-20" },
                            gender: { type: "string", example: "MALE" },
                          },
                        },
                      },
                    },
                  ],
                },
              },
            },
          },
          400: {
            description: "Dữ liệu cập nhật không hợp lệ",
          },
          401: {
            description: "Chưa xác thực",
          },
          404: {
            description: "Không tìm thấy thành viên",
          },
        },
      },
    },
    "/api/employee/login": {
      post: {
        tags: ["Employee Auth"],
        summary: "Đăng nhập nhân viên",
        description: "Xác thực tài khoản nhân viên bằng email/phone và mật khẩu.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/EmployeeLoginRequest",
              },
            },
          },
        },
        responses: {
          200: {
            description: "Đăng nhập thành công",
            content: {
              "application/json": {
                schema: {
                  allOf: [
                    { $ref: "#/components/schemas/ApiResponse" },
                    {
                      type: "object",
                      properties: {
                        data: {
                          type: "object",
                          properties: {
                            accessToken: { type: "string", example: "eyJhbGciOi..." },
                            refreshToken: { type: "string", example: "eyJhbGciOi..." },
                            employee: {
                              type: "object",
                              properties: {
                                id: { type: "integer", example: 1 },
                                full_name: { type: "string", example: "Nguyễn Văn Admin" },
                                email: { type: "string", example: "admin@example.com" },
                                role: { type: "string", example: "ADMIN" },
                              },
                            },
                          },
                        },
                      },
                    },
                  ],
                },
              },
            },
          },
          401: {
            description: "Sai tài khoản hoặc mật khẩu",
          },
        },
      },
    },
    "/api/employee/logout": {
      post: {
        tags: ["Employee Auth"],
        summary: "Đăng xuất tài khoản nhân viên",
        description: "Hủy phiên đăng nhập hiện tại của nhân viên dựa trên Access Token.",
        security: [{ BearerAuth: [] }],
        responses: {
          200: {
            description: "Đăng xuất thành công",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ApiResponse",
                },
              },
            },
          },
          401: {
            description: "Chưa xác thực hoặc token không hợp lệ",
          },
        },
      },
    },
    "/api/employee/products": {
      get: {
        tags: ["Employee Products & Categories"],
        summary: "Lấy danh sách sản phẩm",
        description: "Lấy danh sách toàn bộ sản phẩm có hỗ trợ phân trang và lọc theo danh mục hoặc trạng thái hoạt động.",
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            name: "page",
            in: "query",
            required: false,
            description: "Số trang hiện tại (Mặc định: 1)",
            schema: { type: "integer", default: 1 },
          },
          {
            name: "limit",
            in: "query",
            required: false,
            description: "Số lượng sản phẩm trên một trang (Mặc định: 20)",
            schema: { type: "integer", default: 20 },
          },
          {
            name: "category_id",
            in: "query",
            required: false,
            description: "Lọc sản phẩm theo ID danh mục",
            schema: { type: "integer" },
          },
          {
            name: "is_active",
            in: "query",
            required: false,
            description: "Lọc theo trạng thái hoạt động (true/false, Mặc định: true)",
            schema: { type: "string", enum: ["true", "false"], default: "true" },
          },
        ],
        responses: {
          200: {
            description: "Lấy danh sách thành công",
            content: {
              "application/json": {
                schema: {
                  allOf: [
                    { $ref: "#/components/schemas/ApiResponse" },
                    {
                      type: "object",
                      properties: {
                        data: {
                          type: "object",
                          properties: {
                            products: {
                              type: "array",
                              items: {
                                type: "object",
                                properties: {
                                  id: { type: "integer", example: 101 },
                                  name: { type: "string", example: "Cà phê sữa đá" },
                                  price: { type: "number", example: 29000 },
                                  category_id: { type: "integer", example: 2 },
                                  is_active: { type: "boolean", example: true },
                                },
                              },
                            },
                            pagination: {
                              type: "object",
                              properties: {
                                total: { type: "integer", example: 50 },
                                page: { type: "integer", example: 1 },
                                limit: { type: "integer", example: 20 },
                                totalPages: { type: "integer", example: 3 },
                              },
                            },
                          },
                        },
                      },
                    },
                  ],
                },
              },
            },
          },
          401: {
            description: "Chưa xác thực hoặc không có quyền nhân viên",
          },
        },
      },
    },
    "/api/employee/products/{id}": {
      get: {
        tags: ["Employee Products & Categories"],
        summary: "Lấy thông tin chi tiết một sản phẩm",
        description: "Lấy thông tin chi tiết của một sản phẩm dựa trên ID.",
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            description: "ID sản phẩm cần xem chi tiết",
            schema: { type: "string" },
          },
        ],
        responses: {
          200: {
            description: "Lấy chi tiết thành công",
            content: {
              "application/json": {
                schema: {
                  allOf: [
                    { $ref: "#/components/schemas/ApiResponse" },
                    {
                      type: "object",
                      properties: {
                        data: {
                          type: "object",
                          properties: {
                            id: { type: "integer", example: 101 },
                            name: { type: "string", example: "Cà phê sữa đá" },
                            price: { type: "number", example: 29000 },
                            description: { type: "string", example: "Cà phê pha phin truyền thống kết hợp sữa đặc" },
                            category_id: { type: "integer", example: 2 },
                            is_active: { type: "boolean", example: true },
                          },
                        },
                      },
                    },
                  ],
                },
              },
            },
          },
          401: {
            description: "Chưa xác thực hoặc không có quyền nhân viên",
          },
          404: {
            description: "Không tìm thấy sản phẩm",
          },
        },
      },
    },
    "/api/employee/categories": {
      get: {
        tags: ["Employee Products & Categories"],
        summary: "Lấy danh sách danh mục sản phẩm",
        description: "Lấy danh sách các danh mục sản phẩm dành cho nhân viên.",
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            name: "is_active",
            in: "query",
            required: false,
            description: "Lọc theo trạng thái hoạt động (true/false, Mặc định: true)",
            schema: { type: "string", enum: ["true", "false"], default: "true" },
          },
        ],
        responses: {
          200: {
            description: "Lấy danh sách danh mục thành công",
            content: {
              "application/json": {
                schema: {
                  allOf: [
                    { $ref: "#/components/schemas/ApiResponse" },
                    {
                      type: "object",
                      properties: {
                        data: {
                          type: "array",
                          items: {
                            type: "object",
                            properties: {
                              id: { type: "integer", example: 2 },
                              name: { type: "string", example: "Cà phê" },
                              is_active: { type: "boolean", example: true },
                            },
                          },
                        },
                      },
                    },
                  ],
                },
              },
            },
          },
          401: {
            description: "Chưa xác thực hoặc không có quyền nhân viên",
          },
        },
      },
    },
    "/api/employee/categories/{id}": {
      get: {
        tags: ["Employee Products & Categories"],
        summary: "Lấy chi tiết danh mục sản phẩm",
        description: "Lấy thông tin chi tiết một danh mục sản phẩm dựa trên ID danh mục.",
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            description: "ID của danh mục sản phẩm",
            schema: { type: "integer" },
          },
        ],
        responses: {
          200: {
            description: "Lấy chi tiết danh mục thành công",
            content: {
              "application/json": {
                schema: {
                  allOf: [
                    { $ref: "#/components/schemas/ApiResponse" },
                    {
                      type: "object",
                      properties: {
                        data: {
                          type: "object",
                          properties: {
                            id: { type: "integer", example: 2 },
                            name: { type: "string", example: "Cà phê" },
                            is_active: { type: "boolean", example: true },
                          },
                        },
                      },
                    },
                  ],
                },
              },
            },
          },
          401: {
            description: "Chưa xác thực hoặc không có quyền nhân viên",
          },
          404: {
            description: "Không tìm thấy danh mục",
          },
        },
      },
    },
    "/api/invoice/draft": {
      post: {
        tags: ["Employee Invoices"],
        summary: "Tạo hóa đơn nháp (Draft Invoice)",
        description: "Tạo một hóa đơn nháp mới cho bàn ăn, tính toán tổng tiền tạm tính, điểm tích lũy dự kiến cho thành viên.",
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/CreateDraftInvoiceRequest",
              },
            },
          },
        },
        responses: {
          200: {
            description: "Tạo hóa đơn nháp thành công",
            content: {
              "application/json": {
                schema: {
                  allOf: [
                    { $ref: "#/components/schemas/ApiResponse" },
                    {
                      type: "object",
                      properties: {
                        data: {
                          type: "object",
                          properties: {
                            id: { type: "integer", example: 1 },
                            invoice_code: { type: "string", example: "INV-20260615-000001" },
                            employee_id: { type: "integer", example: 1 },
                            branch_id: { type: "integer", example: 2 },
                            member_id: { type: "integer", nullable: true, example: 12 },
                            table_number: { type: "string", nullable: true, example: "Bàn 05" },
                            sub_total: { type: "number", example: 58000 },
                            discount_amount: { type: "number", example: 0 },
                            voucher_discount: { type: "number", example: 0 },
                            final_amount: { type: "number", example: 73000 },
                            points_earned: { type: "integer", example: 5 },
                            points_multiplier: { type: "number", example: 1.0 },
                            status: { type: "string", example: "DRAFT" },
                            tax_amount: { type: "number", example: 10000 },
                            service_charge: { type: "number", example: 5000 },
                            created_at: { type: "string", format: "date-time", example: "2026-06-15T09:50:09Z" },
                            updated_at: { type: "string", format: "date-time", example: "2026-06-15T09:50:09Z" },
                            items: {
                              type: "array",
                              items: {
                                type: "object",
                                properties: {
                                  id: { type: "integer", example: 1 },
                                  invoice_id: { type: "integer", example: 1 },
                                  product_id: { type: "integer", nullable: true, example: 101 },
                                  product_name: { type: "string", example: "Cà phê sữa đá" },
                                  quantity: { type: "integer", example: 2 },
                                  unit_price: { type: "number", example: 29000 },
                                },
                              },
                            },
                          },
                        },
                      },
                    },
                  ],
                },
              },
            },
          },
          400: {
            description: "Dữ liệu yêu cầu không hợp lệ",
          },
          401: {
            description: "Chưa xác thực hoặc không có quyền nhân viên",
          },
        },
      },
    },
  },
};

module.exports = swaggerDocument;
