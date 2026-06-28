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
      name: "Member Vouchers",
      description: "Các API quản lý, tra cứu và đổi voucher dành cho Thành viên",
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
    {
      name: "Payment Methods",
      description: "Các API quản lý và tra cứu phương thức thanh toán",
    },
    {
      name: "Webhooks",
      description: "Các API webhook tích hợp dịch vụ bên ngoài (ví dụ: PayOS)",
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
    "/api/member/vouchers/redeemable": {
      get: {
        tags: ["Member Vouchers"],
        summary: "Lấy danh sách các voucher thành viên có thể đổi",
        description: "Lấy danh sách các voucher đang hoạt động kèm theo thông tin chi tiết về việc thành viên có đủ điều kiện đổi hay không, bao gồm điều kiện về điểm và về hạng thành viên.",
        security: [{ BearerAuth: [] }],
        responses: {
          200: {
            description: "Thành công",
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
                              id: { type: "string", example: "4" },
                              code: { type: "string", example: "FREEBANH" },
                              title: { type: "string", example: "Tặng 1 bánh ngọt" },
                              discount_type: { type: "string", example: "FIXED" },
                              discount_value: { type: "number", example: 35000 },
                              max_discount: { type: "number", example: null },
                              point_cost: { type: "integer", example: 120 },
                              stock_quantity: { type: "integer", example: 400 },
                              applicable_tiers: {
                                type: "array",
                                items: { type: "integer" },
                                example: [1, 2, 3]
                              },
                              valid_from: { type: "string", format: "date-time", example: "2026-05-31T17:00:00.000Z" },
                              valid_to: { type: "string", format: "date-time", example: "2026-12-30T17:00:00.000Z" },
                              expiry_days: { type: "integer", example: 30 },
                              is_tier_eligible: { type: "boolean", example: true },
                              has_enough_points: { type: "boolean", example: false },
                              can_redeem: { type: "boolean", example: false },
                              required_tier: {
                                type: "object",
                                nullable: true,
                                properties: {
                                  id: { type: "string", example: "2" },
                                  tier_name: { type: "string", example: "Silver" },
                                  min_points: { type: "integer", example: 1000 },
                                  color_code: { type: "string", example: "#C0C0C0" }
                                }
                              },
                              points_needed_to_upgrade: { type: "integer", example: 0 },
                              points_needed_to_redeem: { type: "integer", example: 57 }
                            }
                          }
                        }
                      }
                    }
                  ]
                }
              }
            }
          },
          401: {
            description: "Chưa xác thực"
          }
        }
      }
    },
    "/api/member/vouchers/redeem": {
      post: {
        tags: ["Member Vouchers"],
        summary: "Đổi điểm lấy voucher",
        description: "Thành viên sử dụng điểm tích luỹ hiện tại để đổi lấy voucher mong muốn.",
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["voucher_id"],
                properties: {
                  voucher_id: {
                    type: "integer",
                    example: 4,
                    description: "ID của voucher cần đổi"
                  }
                }
              }
            }
          }
        },
        responses: {
          200: {
            description: "Đổi voucher thành công",
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
                            member_voucher_id: { type: "string", example: "1" },
                            voucher_code: { type: "string", example: "FREEBANH-9F3B1A2C" },
                            expiry_date: { type: "string", format: "date", example: "2026-07-22" },
                            points_spent: { type: "integer", example: 120 },
                            remaining_points: { type: "integer", example: 63 },
                            status: { type: "string", example: "AVAILABLE" }
                          }
                        }
                      }
                    }
                  ]
                }
              }
            }
          },
          400: {
            description: "Yêu cầu không hợp lệ (ví dụ: không đủ điểm, không đủ hạng, hết số lượng, hoặc voucher không hoạt động)"
          },
          401: {
            description: "Chưa xác thực"
          },
          404: {
            description: "Không tìm thấy voucher hoặc thành viên"
          }
        }
      }
    },
    "/api/member/vouchers": {
      get: {
        tags: ["Member Vouchers"],
        summary: "Lấy danh sách voucher thành viên đang sở hữu",
        description: "Lấy toàn bộ danh sách các voucher đã đổi của thành viên hiện tại có hỗ trợ lọc theo trạng thái (AVAILABLE, USED, EXPIRED).",
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            name: "status",
            in: "query",
            required: false,
            description: "Lọc theo trạng thái của voucher sở hữu",
            schema: {
              type: "string",
              enum: ["AVAILABLE", "USED", "EXPIRED"],
              example: "AVAILABLE"
            }
          }
        ],
        responses: {
          200: {
            description: "Thành công",
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
                              member_voucher_id: { type: "string", example: "1" },
                              voucher_code: { type: "string", example: "FREEBANH-9F3B1A2C" },
                              status: { type: "string", example: "AVAILABLE" },
                              points_spent: { type: "integer", example: 120 },
                              acquired_at: { type: "string", format: "date-time", example: "2026-06-22T08:31:19.000Z" },
                              expiry_date: { type: "string", format: "date-time", example: "2026-07-22T17:00:00.000Z" },
                              used_at: { type: "string", format: "date-time", example: null, nullable: true },
                              used_invoice_id: { type: "string", example: null, nullable: true },
                              voucher_id: { type: "string", example: "4" },
                              title: { type: "string", example: "Tặng 1 bánh ngọt" },
                              discount_type: { type: "string", example: "FIXED" },
                              discount_value: { type: "number", example: 35000 },
                              max_discount: { type: "number", example: null, nullable: true }
                            }
                          }
                        }
                      }
                    }
                  ]
                }
              }
            }
          },
          401: {
            description: "Chưa xác thực"
          }
        }
      }
    },
    "/api/member/invoices": {
      get: {
        tags: ["Member Info"],
        summary: "Lấy lịch sử hóa đơn kèm chi tiết của thành viên",
        description: "Lấy toàn bộ danh sách hóa đơn của thành viên đang đăng nhập kèm chi tiết các món ăn/sản phẩm đã mua.",
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            name: "limit",
            in: "query",
            required: false,
            description: "Số lượng bản ghi tối đa trả về",
            schema: {
              type: "integer",
              default: 20
            }
          },
          {
            name: "offset",
            in: "query",
            required: false,
            description: "Số lượng bản ghi cần bỏ qua",
            schema: {
              type: "integer",
              default: 0
            }
          }
        ],
        responses: {
          200: {
            description: "Thành công",
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
                              id: { type: "integer", example: 89 },
                              invoice_code: { type: "string", example: "INV-20260616-000089" },
                              sub_total: { type: "number", example: 633000 },
                              discount_amount: { type: "number", example: 0 },
                              voucher_discount: { type: "number", example: 0 },
                              final_amount: { type: "number", example: 648000 },
                              points_earned: { type: "integer", example: 63 },
                              status: { type: "string", example: "COMPLETED" },
                              payment_method: { type: "string", example: "mio" },
                              table_number: { type: "string", example: "A15" },
                              created_at: { type: "string", format: "date-time", example: "2026-06-16T09:28:54.000Z" },
                              paid_at: { type: "string", format: "date-time", example: "2026-06-16T09:29:10.000Z" },
                              branch_name: { type: "string", example: "Chi nhánh 1" },
                              items: {
                                type: "array",
                                items: {
                                  type: "object",
                                  properties: {
                                    id: { type: "integer", example: 3 },
                                    invoice_id: { type: "integer", example: 89 },
                                    product_name: { type: "string", example: "Vé Buffet Người Lớn" },
                                    quantity: { type: "integer", example: 2 },
                                    unit_price: { type: "number", example: 299000 },
                                    product_id: { type: "integer", example: 1 },
                                    created_at: { type: "string", format: "date-time", example: "2026-06-14T05:50:05.000Z" }
                                  }
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  ]
                }
              }
            }
          },
          401: {
            description: "Chưa xác thực"
          }
        }
      }
    },
    "/api/member/point-history": {
      get: {
        tags: ["Member Info"],
        summary: "Lấy lịch sử giao dịch điểm của thành viên",
        description: "Lấy toàn bộ danh sách lịch sử cộng/trừ điểm tích lũy của thành viên đang đăng nhập.",
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            name: "limit",
            in: "query",
            required: false,
            description: "Số lượng bản ghi tối đa trả về",
            schema: {
              type: "integer",
              default: 20
            }
          },
          {
            name: "offset",
            in: "query",
            required: false,
            description: "Số lượng bản ghi cần bỏ qua",
            schema: {
              type: "integer",
              default: 0
            }
          }
        ],
        responses: {
          200: {
            description: "Thành công",
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
                              id: { type: "integer", example: 18 },
                              transaction_type: { type: "string", example: "EARN" },
                              points: { type: "integer", example: 2 },
                              multiplier_applied: { type: "number", example: 1.20 },
                              reference_type: { type: "string", example: "invoice" },
                              reference_id: { type: "integer", example: 324 },
                              description: { type: "string", example: "Tích điểm từ hóa đơn INV-20260618-000324 (PayOS)" },
                              created_at: { type: "string", format: "date-time", example: "2026-06-18T05:31:22.000Z" }
                            }
                          }
                        }
                      }
                    }
                  ]
                }
              }
            }
          },
          401: {
            description: "Chưa xác thực"
          }
        }
      }
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
    "/api/member/phone": {
      get: {
        tags: ["Member Info"],
        summary: "Tìm thành viên theo số điện thoại",
        description: "Tìm kiếm thông tin thành viên (ID, họ tên, hạng thẻ, hệ số nhân điểm) dựa trên số điện thoại. Chỉ dành cho Nhân viên.",
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            name: "phone",
            in: "query",
            required: true,
            description: "Số điện thoại của thành viên cần tìm",
            schema: {
              type: "string",
              pattern: "^(0|\\+?84)(3|5|7|8|9)[0-9]{8}$",
              example: "0987654321",
            },
          },
        ],
        responses: {
          200: {
            description: "Tìm thành viên thành công",
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
                            tier_name: { type: "string", example: "SILVER" },
                            point_multiplier: { type: "number", example: 1.0 },
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
            description: "Không tìm thấy thành viên với số điện thoại này",
          },
        },
      },
    },
    "/api/paymentMethod": {
      get: {
        tags: ["Payment Methods"],
        summary: "Lấy danh sách phương thức thanh toán đang hoạt động",
        description: "Lấy toàn bộ phương thức thanh toán có trạng thái kích hoạt (active). Chỉ dành cho Nhân viên.",
        security: [{ BearerAuth: [] }],
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
                          type: "array",
                          items: {
                            type: "object",
                            properties: {
                              id: { type: "integer", example: 1 },
                              name: { type: "string", example: "Tiền mặt" },
                              code: { type: "string", example: "cash" },
                              description: { type: "string", example: "Thanh toán bằng tiền mặt" },
                              is_active: { type: "boolean", example: true },
                              created_at: { type: "string", format: "date-time", example: "2026-06-15T09:50:09.000Z" },
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
    "/api/paymentMethod/all": {
      get: {
        tags: ["Payment Methods"],
        summary: "Lấy tất cả danh sách phương thức thanh toán",
        description: "Lấy toàn bộ phương thức thanh toán không phân biệt trạng thái kích hoạt.",
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
                          type: "array",
                          items: {
                            type: "object",
                            properties: {
                              id: { type: "integer", example: 1 },
                              name: { type: "string", example: "Tiền mặt" },
                              code: { type: "string", example: "cash" },
                              description: { type: "string", example: "Thanh toán bằng tiền mặt" },
                              is_active: { type: "boolean", example: true },
                              created_at: { type: "string", format: "date-time", example: "2026-06-15T09:50:09.000Z" },
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
        },
      },
    },
    "/api/invoice/{id}/checkout": {
      post: {
        tags: ["Employee Invoices"],
        summary: "Xử lý checkout hóa đơn",
        description: "Thực hiện thanh toán cho hóa đơn bằng phương thức tiền mặt hoặc tạo link thanh toán PayOS. Chỉ dành cho Nhân viên.",
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            description: "ID của hóa đơn cần checkout",
            schema: { type: "integer" },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["payment_method_id"],
                properties: {
                  payment_method_id: {
                    type: "integer",
                    example: 2,
                    description: "ID của phương thức thanh toán",
                  },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "Checkout thành công",
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
                          oneOf: [
                            {
                              type: "object",
                              properties: {
                                type: { type: "string", example: "cash" },
                                message: { type: "string", example: "Thanh toán tiền mặt thành công" },
                                invoice: {
                                  type: "object",
                                  properties: {
                                    id: { type: "integer", example: 1 },
                                    status: { type: "string", example: "COMPLETED" },
                                  },
                                },
                              },
                            },
                            {
                              type: "object",
                              properties: {
                                type: { type: "string", example: "payos" },
                                message: { type: "string", example: "Tạo link thanh toán PayOS thành công" },
                                checkout_url: { type: "string", example: "https://pay.payos.vn/web/..." },
                                qr_code: { type: "string", example: "000201010212..." },
                                order_code: { type: "integer", example: 1 },
                                invoice_id: { type: "integer", example: 1 },
                              },
                            },
                          ],
                        },
                      },
                    },
                  ],
                },
              },
            },
          },
          400: {
            description: "Yêu cầu không hợp lệ hoặc lỗi nghiệp vụ",
          },
          401: {
            description: "Chưa xác thực hoặc không có quyền nhân viên",
          },
        },
      },
    },
    "/api/invoice/{invoiceId}/link-member": {
      patch: {
        tags: ["Employee Invoices"],
        summary: "Gán thành viên vào hóa đơn",
        description: "Gán một thành viên vào hóa đơn đang ở trạng thái nháp (DRAFT) để tích điểm. Chỉ dành cho Nhân viên.",
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            name: "invoiceId",
            in: "path",
            required: true,
            description: "ID của hóa đơn cần gán thành viên",
            schema: { type: "integer" },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["member_id"],
                properties: {
                  member_id: {
                    type: "integer",
                    example: 12,
                    description: "ID của thành viên cần gán",
                  },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "Gán thành viên vào hóa đơn thành công",
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
                            success: { type: "boolean", example: true },
                            message: { type: "string", example: "Gán thành viên vào hóa đơn thành công" },
                            invoice: {
                              type: "object",
                              properties: {
                                id: { type: "integer", example: 1 },
                                member_id: { type: "integer", example: 12 },
                                points_multiplier: { type: "number", example: 1.0 },
                                points_earned: { type: "integer", example: 5 },
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
            description: "Yêu cầu không hợp lệ (ví dụ: member_id bắt buộc, hóa đơn đã có thành viên hoặc không ở trạng thái DRAFT)",
          },
          401: {
            description: "Chưa xác thực hoặc không có quyền nhân viên",
          },
          404: {
            description: "Không tìm thấy hóa đơn",
          },
        },
      },
    },
    "/api/invoice/{invoiceId}/apply-voucher": {
      patch: {
        tags: ["Employee Invoices"],
        summary: "Áp dụng voucher vào hóa đơn",
        description: "Áp dụng mã voucher sở hữu của thành viên vào hóa đơn đang ở trạng thái DRAFT. Hệ thống sẽ tự động tính toán lại tiền giảm giá của voucher, giá trị cuối cùng và số điểm tích lũy dự kiến của hóa đơn. Chỉ dành cho Nhân viên.",
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            name: "invoiceId",
            in: "path",
            required: true,
            description: "ID của hóa đơn cần áp dụng voucher",
            schema: { type: "integer" },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["voucher_code"],
                properties: {
                  voucher_code: {
                    type: "string",
                    example: "GIAM30K-A1B2C3D4",
                    description: "Mã code của voucher sở hữu muốn áp dụng (định dạng CODE-RANDOM)",
                  },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "Áp dụng voucher thành công",
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
                            invoice_code: { type: "string", example: "INV-20260623-000001" },
                            member_id: { type: "integer", example: 12 },
                            sub_total: { type: "number", example: 100000 },
                            voucher_discount: { type: "number", example: 30000 },
                            discount_amount: { type: "number", example: 0 },
                            tax_amount: { type: "number", example: 0 },
                            service_charge: { type: "number", example: 0 },
                            final_amount: { type: "number", example: 70000 },
                            points_earned: { type: "integer", example: 3 },
                            applied_member_voucher_id: { type: "integer", example: 5 },
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
            description: "Yêu cầu không hợp lệ (ví dụ: hóa đơn không ở trạng thái DRAFT, chưa gán thành viên, voucher hết hạn, đã dùng hoặc không thuộc về thành viên này)",
          },
          401: {
            description: "Chưa xác thực hoặc không có quyền nhân viên",
          },
          404: {
            description: "Không tìm thấy hóa đơn hoặc voucher",
          },
        },
      },
    },
    "/api/webhook/payos": {
      post: {
        tags: ["Webhooks"],
        summary: "Webhook nhận kết quả thanh toán từ PayOS",
        description: "Nhận thông báo trạng thái thanh toán tự động từ cổng PayOS để hoàn tất hóa đơn.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["success", "data"],
                properties: {
                  success: {
                    type: "boolean",
                    example: true,
                  },
                  data: {
                    type: "object",
                    required: ["orderCode", "amount", "code"],
                    properties: {
                      orderCode: {
                        type: "integer",
                        example: 1,
                        description: "ID hóa đơn tương ứng với orderCode gửi sang PayOS",
                      },
                      amount: {
                        type: "number",
                        example: 73000,
                      },
                      code: {
                        type: "string",
                        example: "00",
                        description: "Mã trạng thái giao dịch (00 là thành công)",
                      },
                    },
                  },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "Xử lý webhook thành công",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: {
                      type: "string",
                      example: "OK",
                    },
                  },
                },
              },
            },
          },
          400: {
            description: "Payload không hợp lệ",
          },
          500: {
            description: "Lỗi hệ thống",
          },
        },
      },
    },
  },
};

module.exports = swaggerDocument;
