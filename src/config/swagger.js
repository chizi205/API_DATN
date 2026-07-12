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
    // === MEMBER APP ===
    {
      name: "Member Auth",
      description: "Các API xác thực và tài khoản cho Thành viên (Member)",
    },
    {
      name: "Member Info",
      description: "Các API thông tin cá nhân, thẻ thành viên, điểm và hóa đơn lịch sử",
    },
    {
      name: "Member Vouchers",
      description: "Các API quản lý, tra cứu và đổi voucher dành cho Thành viên",
    },
    {
      name: "Member Notifications",
      description: "Các API quản lý và nhận thông báo cá nhân của Thành viên",
    },
    {
      name: "Member Device",
      description: "Các API liên quan đến thiết bị và đăng ký nhận thông báo FCM",
    },
    {
      name: "Member Self-Payment",
      description: "Các API tự thanh toán và tự tích điểm cho Thành viên",
    },
    {
      name: "Member Reservations",
      description: "Các API đặt bàn/đặt lịch của Thành viên",
    },

    // === EMPLOYEE APP ===
    {
      name: "Employee Auth",
      description: "Các API xác thực và tài khoản dành cho Nhân viên (Employee)",
    },
    {
      name: "Employee Products & Categories",
      description: "Các API quản lý và tra cứu sản phẩm/danh mục dành cho Nhân viên",
    },
    {
      name: "Employee Invoices",
      description: "Các API quản lý và xử lý hóa đơn (chỉ dành cho Nhân viên)",
    },
    {
      name: "Employee Reservations",
      description: "Các API quản lý lịch đặt bàn dành cho Nhân viên",
    },

    // === ADMIN & MANAGER ===
    {
      name: "Admin Accounts",
      description: "Các API quản lý tài khoản nhân viên (chỉ dành cho ADMIN)",
    },
    {
      name: "Admin Vouchers",
      description: "Các API quản lý cấu hình voucher ưu đãi hệ thống (chỉ dành cho ADMIN/MANAGER)",
    },
    {
      name: "Admin Point Configs",
      description: "Các API cấu hình điểm tích lũy và các hạng thành viên (chỉ dành cho ADMIN/MANAGER)",
    },
    {
      name: "Admin Reports",
      description: "Các API xem báo cáo thống kê hoạt động cửa hàng (chỉ dành cho ADMIN/MANAGER)",
    },
    {
      name: "Admin Customers",
      description: "Các API quản lý khách hàng/thành viên (chỉ dành cho ADMIN/MANAGER)",
    },
    {
      name: "Admin Invoices",
      description: "Các API quản lý hóa đơn hệ thống (chỉ dành cho ADMIN/MANAGER)",
    },
    {
      name: "Admin Products",
      description: "Các API quản lý sản phẩm (chỉ dành cho ADMIN/MANAGER)",
    },
    {
      name: "Admin Categories",
      description: "Các API quản lý loại/danh mục sản phẩm (chỉ dành cho ADMIN/MANAGER)",
    },

    // === SYSTEM INTEGRATIONS ===
    {
      name: "Branches",
      description: "Các API liên quan đến chi nhánh và cửa hàng",
    },
    {
      name: "Payment Methods",
      description: "Các API quản lý và tra cứu phương thức thanh toán",
    },
    {
      name: "Webhooks",
      description: "Các API webhook tích hợp dịch vụ bên ngoài (PayOS, Mio...)",
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
      CreateEmployeeRequest: {
        type: "object",
        required: ["employee_code", "full_name", "email", "password"],
        properties: {
          employee_code: { type: "string", example: "EMP001" },
          full_name: { type: "string", example: "Nguyễn Văn A" },
          email: { type: "string", format: "email", example: "empa@example.com" },
          password: { type: "string", example: "123456" },
          role: { type: "string", enum: ["ADMIN", "MANAGER", "STAFF"], example: "STAFF" },
          branch_id: { type: "integer", example: 1 },
          is_active: { type: "boolean", example: true }
        }
      },
      UpdateEmployeeRequest: {
        type: "object",
        properties: {
          full_name: { type: "string", example: "Nguyễn Văn A" },
          email: { type: "string", format: "email", example: "empa@example.com" },
          password: { type: "string", example: "123456" },
          role: { type: "string", enum: ["ADMIN", "MANAGER", "STAFF"], example: "STAFF" },
          branch_id: { type: "integer", example: 1 },
          is_active: { type: "boolean", example: true }
        }
      },
      CreateVoucherRequest: {
        type: "object",
        required: ["code", "title", "discount_type", "discount_value"],
        properties: {
          code: { type: "string", example: "GIAM20K" },
          title: { type: "string", example: "Giảm 20k cho đơn từ 100k" },
          discount_type: { type: "string", enum: ["FIXED", "PERCENTAGE"], example: "FIXED" },
          discount_value: { type: "number", example: 20000 },
          max_discount: { type: "number", example: 20000, nullable: true },
          point_cost: { type: "integer", example: 50 },
          stock_quantity: { type: "integer", example: 100 },
          applicable_tiers: { type: "array", items: { type: "integer" }, example: [1, 2] },
          valid_from: { type: "string", format: "date-time", example: "2026-07-01T00:00:00.000Z" },
          valid_to: { type: "string", format: "date-time", example: "2026-12-31T23:59:59.000Z" },
          expiry_days: { type: "integer", example: 30 },
          is_active: { type: "boolean", example: true }
        }
      },
      UpdateVoucherRequest: {
        type: "object",
        properties: {
          code: { type: "string", example: "GIAM20K" },
          title: { type: "string", example: "Giảm 20k cho đơn từ 100k" },
          discount_type: { type: "string", enum: ["FIXED", "PERCENTAGE"], example: "FIXED" },
          discount_value: { type: "number", example: 20000 },
          max_discount: { type: "number", example: 20000, nullable: true },
          point_cost: { type: "integer", example: 50 },
          stock_quantity: { type: "integer", example: 100 },
          applicable_tiers: { type: "array", items: { type: "integer" }, example: [1, 2] },
          valid_from: { type: "string", format: "date-time", example: "2026-07-01T00:00:00.000Z" },
          valid_to: { type: "string", format: "date-time", example: "2026-12-31T23:59:59.000Z" },
          expiry_days: { type: "integer", example: 30 },
          is_active: { type: "boolean", example: true }
        }
      },
      CreatePointConfigRequest: {
        type: "object",
        required: ["spend_amount", "earn_points"],
        properties: {
          spend_amount: { type: "number", example: 10000 },
          earn_points: { type: "integer", example: 1 },
          is_active: { type: "boolean", example: true }
        }
      },
      UpdatePointConfigRequest: {
        type: "object",
        properties: {
          spend_amount: { type: "number", example: 10000 },
          earn_points: { type: "integer", example: 1 },
          is_active: { type: "boolean", example: true }
        }
      },
      UpdateTierRequest: {
        type: "object",
        properties: {
          tier_name: { type: "string", example: "Gold" },
          min_points: { type: "integer", example: 2000 },
          point_multiplier: { type: "number", example: 1.2 },
          color_code: { type: "string", example: "#FFD700" }
        }
      },
      CreateCustomerRequest: {
        type: "object",
        required: ["phone_number", "full_name"],
        properties: {
          phone_number: { type: "string", example: "0987654321" },
          full_name: { type: "string", example: "Nguyễn Văn C" },
          email: { type: "string", format: "email", example: "customerc@example.com" },
          gender: { type: "string", enum: ["MALE", "FEMALE", "OTHER", "UNKNOWN"], example: "MALE" },
          date_of_birth: { type: "string", example: "20/05/2000" },
          tier_id: { type: "integer", example: 1 },
          current_points: { type: "integer", example: 0 },
          total_accumulated_points: { type: "integer", example: 0 },
          is_active: { type: "boolean", example: true }
        }
      },
      UpdateCustomerRequest: {
        type: "object",
        properties: {
          phone_number: { type: "string", example: "0987654321" },
          full_name: { type: "string", example: "Nguyễn Văn C" },
          email: { type: "string", format: "email", example: "customerc@example.com" },
          gender: { type: "string", enum: ["MALE", "FEMALE", "OTHER", "UNKNOWN"], example: "MALE" },
          date_of_birth: { type: "string", example: "20/05/2000" },
          tier_id: { type: "integer", example: 1 },
          current_points: { type: "integer", example: 0 },
          total_accumulated_points: { type: "integer", example: 0 },
          is_active: { type: "boolean", example: true }
        }
      },
      CreateReservationRequest: {
        type: "object",
        required: ["branch_id", "reservation_time", "guest_count"],
        properties: {
          branch_id: {
            type: "integer",
            example: 1,
            description: "ID của chi nhánh nhà hàng/quán",
          },
          reservation_time: {
            type: "string",
            format: "date-time",
            example: "2026-07-20T18:30:00.000Z",
            description: "Thời gian đặt lịch ở tương lai",
          },
          guest_count: {
            type: "integer",
            minimum: 1,
            example: 4,
            description: "Số lượng khách tham gia đặt bàn",
          },
          note: {
            type: "string",
            example: "Bàn gần cửa sổ, không hút thuốc",
            description: "Ghi chú thêm (tùy chọn)",
          },
        },
      },
    },
  },
  paths: {
    "/api/branches": {
      get: {
        tags: ["Branches"],
        summary: "Lấy danh sách chi nhánh/cửa hàng",
        description: "Lấy danh sách các chi nhánh của hệ thống hỗ trợ lọc và phân trang bằng cursor.",
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            name: "last_id",
            in: "query",
            required: false,
            description: "ID cuối cùng của trang trước (cursor)",
            schema: {
              type: "integer",
              example: 10
            }
          },
          {
            name: "limit",
            in: "query",
            required: false,
            description: "Số lượng bản ghi muốn lấy (mặc định 20)",
            schema: {
              type: "integer",
              example: 20
            }
          },
          {
            name: "is_active",
            in: "query",
            required: false,
            description: "Lọc theo trạng thái hoạt động (true/false)",
            schema: {
              type: "boolean",
              example: true
            }
          }
        ],
        responses: {
          200: {
            description: "Lấy danh sách chi nhánh thành công",
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
                            stores: {
                              type: "array",
                              items: {
                                type: "object",
                                properties: {
                                  id: { type: "integer", example: 1 },
                                  name: { type: "string", example: "Chi nhánh Quận 1" },
                                  address: { type: "string", example: "123 Nguyễn Huệ, Quận 1, TP. HCM" },
                                  phone: { type: "string", example: "02812345678" },
                                  is_active: { type: "boolean", example: true },
                                  created_at: { type: "string", format: "date-time" },
                                  updated_at: { type: "string", format: "date-time" }
                                }
                              }
                            },
                            pagination: {
                              type: "object",
                              properties: {
                                limit: { type: "integer", example: 20 },
                                has_more: { type: "boolean", example: false },
                                next_last_id: { type: "integer", example: null, nullable: true }
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
    "/api/member/reservations": {
      post: {
        tags: ["Member Reservations"],
        summary: "Tạo lịch đặt bàn mới",
        description: "Thành viên tạo lịch hẹn đặt bàn trước tại một chi nhánh cụ thể.",
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/CreateReservationRequest",
              },
            },
          },
        },
        responses: {
          201: {
            description: "Tạo lịch đặt bàn thành công",
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
                            branch_id: { type: "integer", example: 1 },
                            reservation_time: { type: "string", format: "date-time", example: "2026-07-20T18:30:00.000Z" },
                            guest_count: { type: "integer", example: 4 },
                            status: { type: "string", example: "PENDING" },
                            note: { type: "string", example: "Bàn gần cửa sổ, không hút thuốc" },
                            created_at: { type: "string", format: "date-time", example: "2026-07-12T19:30:00.000Z" },
                            updated_at: { type: "string", format: "date-time", example: "2026-07-12T19:30:00.000Z" },
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
            description: "Dữ liệu đầu vào không hợp lệ hoặc thời gian đặt lịch trong quá khứ/không hợp lệ",
          },
          401: {
            description: "Chưa xác thực",
          },
          404: {
            description: "Không tìm thấy chi nhánh",
          },
        },
      },
      get: {
        tags: ["Member Reservations"],
        summary: "Lấy danh sách lịch đặt bàn của thành viên",
        description: "Lấy danh sách các lịch đặt bàn của thành viên hiện đang đăng nhập (hỗ trợ phân trang và lọc theo trạng thái).",
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            name: "status",
            in: "query",
            required: false,
            description: "Lọc theo trạng thái đặt bàn (PENDING, CONFIRMED, CANCELLED, COMPLETED)",
            schema: {
              type: "string",
              example: "PENDING"
            }
          },
          {
            name: "limit",
            in: "query",
            required: false,
            description: "Số lượng kết quả tối đa mỗi trang (mặc định 20)",
            schema: {
              type: "integer",
              example: 20
            }
          },
          {
            name: "page",
            in: "query",
            required: false,
            description: "Trang kết quả muốn lấy (mặc định 1)",
            schema: {
              type: "integer",
              example: 1
            }
          }
        ],
        responses: {
          200: {
            description: "Lấy danh sách đặt lịch thành công",
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
                            reservations: {
                              type: "array",
                              items: {
                                type: "object",
                                properties: {
                                  id: { type: "integer", example: 1 },
                                  member_id: { type: "integer", example: 12 },
                                  branch_id: { type: "integer", example: 1 },
                                  reservation_time: { type: "string", format: "date-time", example: "2026-07-20T18:30:00.000Z" },
                                  guest_count: { type: "integer", example: 4 },
                                  status: { type: "string", example: "PENDING" },
                                  note: { type: "string", example: "Bàn gần cửa sổ, không hút thuốc" },
                                  created_at: { type: "string", format: "date-time" },
                                  updated_at: { type: "string", format: "date-time" },
                                  branch_name: { type: "string", example: "Chi nhánh Quận 1" }
                                }
                              }
                            },
                            pagination: {
                              type: "object",
                              properties: {
                                total: { type: "integer", example: 10 },
                                page: { type: "integer", example: 1 },
                                limit: { type: "integer", example: 20 },
                                total_pages: { type: "integer", example: 1 }
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
    "/api/member/reservations/{id}/cancel": {
      patch: {
        tags: ["Member Reservations"],
        summary: "Thành viên tự hủy lịch đặt bàn",
        description: "Khách hàng tự hủy lịch đặt bàn của mình trước thời gian diễn ra. Hệ thống sẽ cập nhật trạng thái thành CANCELLED và gửi Socket thông báo cho nhân viên tại chi nhánh.",
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            description: "ID của lịch đặt bàn cần hủy",
            schema: {
              type: "integer",
              example: 2
            }
          }
        ],
        requestBody: {
          required: false,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  cancel_reason: {
                    type: "string",
                    example: "Thay đổi kế hoạch cá nhân",
                    description: "Lý do hủy bàn (tùy chọn)"
                  }
                }
              }
            }
          }
        },
        responses: {
          200: {
            description: "Hủy lịch đặt bàn thành công",
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
                            member_id: { type: "integer", example: 12 },
                            branch_id: { type: "integer", example: 1 },
                            reservation_time: { type: "string", format: "date-time" },
                            guest_count: { type: "integer", example: 3 },
                            status: { type: "string", example: "CANCELLED" },
                            note: { type: "string", example: "" },
                            cancel_reason: { type: "string", example: "Thay đổi kế hoạch cá nhân" },
                            created_at: { type: "string", format: "date-time" },
                            updated_at: { type: "string", format: "date-time" }
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
            description: "Lịch đặt bàn đã bị hủy/từ chối hoặc hoàn thành từ trước"
          },
          401: {
            description: "Chưa xác thực"
          },
          403: {
            description: "Không có quyền hủy lịch đặt bàn của người khác"
          },
          404: {
            description: "Không tìm thấy lịch đặt bàn"
          }
        }
      }
    },
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
    "/api/member/self-payment/preview": {
      get: {
        tags: ["Member Self-Payment"],
        summary: "Xem trước thông tin thanh toán hoặc tích điểm",
        description: "Quét claim_qr_token để kiểm tra hóa đơn. Nếu hóa đơn chưa thanh toán, trả về thông tin chi tiết hóa đơn, các voucher có thể áp dụng và phương thức thanh toán. Nếu hóa đơn đã thanh toán nhưng chưa tích điểm, trả về thông tin điểm tích lũy dự kiến.",
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            name: "token",
            in: "query",
            required: true,
            description: "Token tích điểm/thanh toán (claim_qr_token) của hóa đơn",
            schema: {
              type: "string",
              example: "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d"
            }
          },
          {
            name: "voucher_code",
            in: "query",
            required: false,
            description: "Mã voucher của thành viên muốn áp thử để xem trước tiền giảm giá",
            schema: {
              type: "string",
              example: "GIAM20K-9F3B1A2C"
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
                          type: "object",
                          properties: {
                            action: {
                              type: "string",
                              enum: ["SELF_PAYMENT", "CLAIM_POINTS"],
                              example: "SELF_PAYMENT"
                            },
                            invoice: {
                              type: "object",
                              properties: {
                                id: { type: "integer", example: 1 },
                                invoice_code: { type: "string", example: "INV-20260615-000001" },
                                final_amount: { type: "number", example: 73000 },
                                status: { type: "string", example: "DRAFT" }
                              }
                            },
                            vouchers: {
                              type: "array",
                              description: "Danh sách voucher khả dụng (chỉ trả về khi action là SELF_PAYMENT)",
                              items: {
                                type: "object"
                              }
                            },
                            payment_methods: {
                              type: "array",
                              description: "Danh sách phương thức thanh toán hoạt động (chỉ trả về khi action là SELF_PAYMENT)",
                              items: {
                                type: "object"
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
          400: {
            description: "Yêu cầu không hợp lệ hoặc token hết hạn/hóa đơn bị hủy"
          },
          401: {
            description: "Chưa xác thực"
          },
          404: {
            description: "Không tìm thấy hóa đơn hợp lệ"
          }
        }
      }
    },
    "/api/member/self-payment/checkout": {
      post: {
        tags: ["Member Self-Payment"],
        summary: "Thực hiện tự thanh toán hoặc tích điểm",
        description: "Gửi yêu cầu thanh toán (nếu hóa đơn DRAFT) hoặc tích điểm (nếu hóa đơn COMPLETED) bằng claim_qr_token.",
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["token"],
                properties: {
                  token: {
                    type: "string",
                    example: "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
                    description: "Token thanh toán/tích điểm (claim_qr_token)"
                  },
                  voucher_code: {
                    type: "string",
                    example: "GIAM20K-9F3B1A2C",
                    description: "Mã voucher của thành viên cần áp dụng (tùy chọn, chỉ cho SELF_PAYMENT)"
                  },
                  payment_method_id: {
                    type: "integer",
                    example: 2,
                    description: "ID phương thức thanh toán (chỉ bắt buộc cho SELF_PAYMENT)"
                  }
                }
              }
            }
          }
        },
        responses: {
          200: {
            description: "Thao tác thành công",
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
                            action: {
                              type: "string",
                              enum: ["SELF_PAYMENT", "CLAIM_POINTS"],
                              example: "SELF_PAYMENT"
                            },
                            type: {
                              type: "string",
                              description: "Loại thanh toán (cash, payos, mio) - chỉ có khi action là SELF_PAYMENT",
                              example: "payos"
                            },
                            checkout_url: {
                              type: "string",
                              description: "Link thanh toán nếu chọn payos/mio",
                              example: "https://pay.payos.vn/web/..."
                            },
                            message: {
                              type: "string",
                              example: "Tích điểm thành công / Thanh toán thành công"
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
          400: {
            description: "Yêu cầu không hợp lệ (ví dụ: thiếu token, voucher không hợp lệ, hoặc phương thức thanh toán không hợp lệ)"
          },
          401: {
            description: "Chưa xác thực"
          },
          404: {
            description: "Không tìm thấy hóa đơn"
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
    "/api/employee/reservations": {
      get: {
        tags: ["Employee Reservations"],
        summary: "Lấy danh sách lịch đặt bàn",
        description: "Lấy danh sách các lịch đặt bàn của khách hàng. Nhân viên/Staff chỉ xem được lịch của chi nhánh mình. Admin/Manager có thể xem toàn bộ hoặc lọc theo branch_id.",
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            name: "branch_id",
            in: "query",
            required: false,
            description: "ID chi nhánh muốn lọc (Chỉ có tác dụng với ADMIN/MANAGER)",
            schema: {
              type: "integer",
              example: 1
            }
          },
          {
            name: "status",
            in: "query",
            required: false,
            description: "Lọc theo trạng thái đặt bàn (PENDING, CONFIRMED, CANCELLED, COMPLETED)",
            schema: {
              type: "string",
              example: "PENDING"
            }
          },
          {
            name: "date",
            in: "query",
            required: false,
            description: "Lọc lịch đặt theo ngày cụ thể (định dạng YYYY-MM-DD)",
            schema: {
              type: "string",
              format: "date",
              example: "2026-07-20"
            }
          },
          {
            name: "limit",
            in: "query",
            required: false,
            description: "Số lượng kết quả tối đa mỗi trang (mặc định 20)",
            schema: {
              type: "integer",
              example: 20
            }
          },
          {
            name: "page",
            in: "query",
            required: false,
            description: "Trang kết quả muốn lấy (mặc định 1)",
            schema: {
              type: "integer",
              example: 1
            }
          }
        ],
        responses: {
          200: {
            description: "Lấy danh sách lịch đặt bàn thành công",
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
                            reservations: {
                              type: "array",
                              items: {
                                type: "object",
                                properties: {
                                  id: { type: "integer", example: 1 },
                                  member_id: { type: "integer", example: 12 },
                                  branch_id: { type: "integer", example: 1 },
                                  reservation_time: { type: "string", format: "date-time", example: "2026-07-20T18:30:00.000Z" },
                                  guest_count: { type: "integer", example: 4 },
                                  status: { type: "string", example: "PENDING" },
                                  note: { type: "string", example: "Bàn gần cửa sổ, không hút thuốc" },
                                  created_at: { type: "string", format: "date-time" },
                                  updated_at: { type: "string", format: "date-time" },
                                  member_name: { type: "string", example: "Nguyễn Văn A" },
                                  member_phone: { type: "string", example: "0987654321" },
                                  branch_name: { type: "string", example: "Chi nhánh Quận 1" }
                                }
                              }
                            },
                            pagination: {
                              type: "object",
                              properties: {
                                total: { type: "integer", example: 50 },
                                page: { type: "integer", example: 1 },
                                limit: { type: "integer", example: 20 },
                                total_pages: { type: "integer", example: 3 }
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
            description: "Chưa xác thực nhân viên"
          }
        }
      }
    },
    "/api/employee/reservations/{id}/status": {
      patch: {
        tags: ["Employee Reservations"],
        summary: "Cập nhật trạng thái lịch đặt bàn",
        description: "Nhân viên xác nhận (CONFIRMED) hoặc từ chối/hủy (CANCELLED) lịch đặt bàn của khách hàng, sau đó hệ thống tự động gửi thông báo qua Firebase.",
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            description: "ID của lịch đặt bàn",
            schema: {
              type: "integer",
              example: 1
            }
          }
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["status"],
                properties: {
                  status: {
                    type: "string",
                    enum: ["CONFIRMED", "CANCELLED", "COMPLETED"],
                    example: "CONFIRMED",
                    description: "Trạng thái mới cần cập nhật"
                  },
                  cancel_reason: {
                    type: "string",
                    example: "Nhà hàng đã hết bàn trống vào khung giờ này",
                    description: "Lý do hủy đặt bàn (chỉ bắt buộc/khuyến nghị khi status = CANCELLED)"
                  }
                }
              }
            }
          }
        },
        responses: {
          200: {
            description: "Cập nhật trạng thái thành công",
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
                            branch_id: { type: "integer", example: 1 },
                            reservation_time: { type: "string", format: "date-time" },
                            guest_count: { type: "integer", example: 6 },
                            status: { type: "string", example: "CONFIRMED" },
                            note: { type: "string", example: "" },
                            cancel_reason: { type: "string", example: null, nullable: true },
                            created_at: { type: "string", format: "date-time" },
                            updated_at: { type: "string", format: "date-time" }
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
            description: "Dữ liệu đầu vào hoặc trạng thái không hợp lệ"
          },
          401: {
            description: "Chưa xác thực nhân viên"
          },
          403: {
            description: "Không có quyền quản lý lịch đặt của chi nhánh khác"
          },
          404: {
            description: "Không tìm thấy thông tin đặt bàn"
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
                            claim_qr_token: { type: "string", nullable: true, example: "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d" },
                            claim_qr_expired_at: { type: "string", format: "date-time", nullable: true, example: "2026-06-16T09:50:09Z" },
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
    "/api/admin/products": {
      get: {
        tags: ["Admin Products"],
        summary: "Lấy danh sách sản phẩm (Admin/Manager)",
        description: "Lấy danh sách sản phẩm của hệ thống hỗ trợ lọc theo category, trạng thái is_active, tìm kiếm và phân trang.",
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            name: "page",
            in: "query",
            required: false,
            description: "Số trang kết quả (mặc định 1)",
            schema: { type: "integer", example: 1 }
          },
          {
            name: "limit",
            in: "query",
            required: false,
            description: "Số lượng sản phẩm mỗi trang (mặc định 20)",
            schema: { type: "integer", example: 20 }
          },
          {
            name: "search",
            in: "query",
            required: false,
            description: "Tìm kiếm sản phẩm theo tên",
            schema: { type: "string", example: "cà phê" }
          },
          {
            name: "category_id",
            in: "query",
            required: false,
            description: "Lọc theo ID danh mục",
            schema: { type: "integer", example: 2 }
          },
          {
            name: "is_active",
            in: "query",
            required: false,
            description: "Lọc theo trạng thái hoạt động (true/false)",
            schema: { type: "boolean", example: true }
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
                          type: "object",
                          properties: {
                            products: {
                              type: "array",
                              items: {
                                type: "object",
                                properties: {
                                  id: { type: "integer", example: 1 },
                                  category_id: { type: "integer", example: 2 },
                                  name: { type: "string", example: "Cà phê sữa đá" },
                                  description: { type: "string", example: "Cà phê truyền thống Việt Nam" },
                                  base_price: { type: "number", example: 29000 },
                                  image_url: { type: "string", example: "http://example.com/caphe.png" },
                                  is_active: { type: "boolean", example: true },
                                  created_at: { type: "string", format: "date-time" },
                                  updated_at: { type: "string", format: "date-time" },
                                  category_name: { type: "string", example: "Đồ uống" }
                                }
                              }
                            },
                            pagination: {
                              type: "object",
                              properties: {
                                total: { type: "integer", example: 100 },
                                page: { type: "integer", example: 1 },
                                limit: { type: "integer", example: 20 },
                                total_pages: { type: "integer", example: 5 }
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
          401: { description: "Chưa xác thực" },
          403: { description: "Không có quyền truy cập" }
        }
      },
      post: {
        tags: ["Admin Products"],
        summary: "Tạo sản phẩm mới",
        description: "Tạo một sản phẩm mới trong hệ thống (chỉ dành cho ADMIN/MANAGER).",
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["name", "base_price"],
                properties: {
                  category_id: { type: "integer", example: 2, description: "ID danh mục (tùy chọn)" },
                  name: { type: "string", example: "Trà đào cam sả" },
                  description: { type: "string", example: "Trà đào thơm ngon mát lạnh" },
                  base_price: { type: "number", example: 39000 },
                  image_url: { type: "string", example: "http://example.com/tradao.png" },
                  is_active: { type: "boolean", example: true }
                }
              }
            }
          }
        },
        responses: {
          201: {
            description: "Tạo sản phẩm thành công",
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
                            id: { type: "integer", example: 10 },
                            category_id: { type: "integer", example: 2 },
                            name: { type: "string", example: "Trà đào cam sả" },
                            description: { type: "string", example: "Trà đào thơm ngon mát lạnh" },
                            base_price: { type: "number", example: 39000 },
                            image_url: { type: "string", example: "http://example.com/tradao.png" },
                            is_active: { type: "boolean", example: true },
                            created_at: { type: "string", format: "date-time" },
                            updated_at: { type: "string", format: "date-time" }
                          }
                        }
                      }
                    }
                  ]
                }
              }
            }
          },
          400: { description: "Dữ liệu đầu vào không hợp lệ hoặc danh mục không tồn tại" },
          401: { description: "Chưa xác thực" },
          403: { description: "Không có quyền thực hiện" }
        }
      }
    },
    "/api/admin/products/{id}": {
      get: {
        tags: ["Admin Products"],
        summary: "Lấy chi tiết sản phẩm",
        description: "Lấy chi tiết của một sản phẩm cụ thể theo ID.",
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            description: "ID sản phẩm",
            schema: { type: "integer", example: 1 }
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
                          type: "object",
                          properties: {
                            id: { type: "integer", example: 1 },
                            category_id: { type: "integer", example: 2 },
                            name: { type: "string", example: "Cà phê sữa đá" },
                            description: { type: "string", example: "Cà phê truyền thống" },
                            base_price: { type: "number", example: 29000 },
                            image_url: { type: "string", example: "http://example.com/caphe.png" },
                            is_active: { type: "boolean", example: true },
                            created_at: { type: "string", format: "date-time" },
                            updated_at: { type: "string", format: "date-time" },
                            category_name: { type: "string", example: "Đồ uống" }
                          }
                        }
                      }
                    }
                  ]
                }
              }
            }
          },
          401: { description: "Chưa xác thực" },
          404: { description: "Không tìm thấy sản phẩm" }
        }
      },
      put: {
        tags: ["Admin Products"],
        summary: "Cập nhật sản phẩm",
        description: "Cập nhật thông tin của sản phẩm hiện có (chỉ dành cho ADMIN/MANAGER).",
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            description: "ID sản phẩm",
            schema: { type: "integer", example: 1 }
          }
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  category_id: { type: "integer", example: 2 },
                  name: { type: "string", example: "Cà phê sữa đá đặc biệt" },
                  description: { type: "string", example: "Nhiều sữa hơn thơm béo hơn" },
                  base_price: { type: "number", example: 35000 },
                  image_url: { type: "string", example: "http://example.com/caphedacbiet.png" },
                  is_active: { type: "boolean", example: true }
                }
              }
            }
          }
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
                            id: { type: "integer", example: 1 },
                            category_id: { type: "integer", example: 2 },
                            name: { type: "string", example: "Cà phê sữa đá đặc biệt" },
                            description: { type: "string", example: "Nhiều sữa hơn thơm béo hơn" },
                            base_price: { type: "number", example: 35000 },
                            image_url: { type: "string", example: "http://example.com/caphedacbiet.png" },
                            is_active: { type: "boolean", example: true },
                            created_at: { type: "string", format: "date-time" },
                            updated_at: { type: "string", format: "date-time" }
                          }
                        }
                      }
                    }
                  ]
                }
              }
            }
          },
          400: { description: "Dữ liệu cập nhật không hợp lệ hoặc danh mục không tồn tại" },
          401: { description: "Chưa xác thực" },
          403: { description: "Không có quyền thực hiện" },
          404: { description: "Không tìm thấy sản phẩm" }
        }
      },
      delete: {
        tags: ["Admin Products"],
        summary: "Xóa sản phẩm",
        description: "Xóa mềm sản phẩm bằng cách chuyển trạng thái is_active thành false (chỉ dành cho ADMIN).",
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            description: "ID sản phẩm",
            schema: { type: "integer", example: 1 }
          }
        ],
        responses: {
          200: {
            description: "Xóa sản phẩm thành công",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ApiResponse"
                }
              }
            }
          },
          401: { description: "Chưa xác thực" },
          403: { description: "Không có quyền thực hiện (chỉ ADMIN)" },
          404: { description: "Không tìm thấy sản phẩm" }
        }
      }
    },
    "/api/admin/categories": {
      get: {
        tags: ["Admin Categories"],
        summary: "Lấy danh sách danh mục (Admin/Manager)",
        description: "Lấy danh sách danh mục/loại sản phẩm của hệ thống hỗ trợ lọc theo trạng thái is_active, tìm kiếm và phân trang.",
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            name: "page",
            in: "query",
            required: false,
            description: "Số trang kết quả (mặc định 1)",
            schema: { type: "integer", example: 1 }
          },
          {
            name: "limit",
            in: "query",
            required: false,
            description: "Số lượng danh mục mỗi trang (mặc định 20)",
            schema: { type: "integer", example: 20 }
          },
          {
            name: "search",
            in: "query",
            required: false,
            description: "Tìm kiếm danh mục theo tên",
            schema: { type: "string", example: "Đồ uống" }
          },
          {
            name: "is_active",
            in: "query",
            required: false,
            description: "Lọc theo trạng thái hoạt động (true/false)",
            schema: { type: "boolean", example: true }
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
                          type: "object",
                          properties: {
                            categories: {
                              type: "array",
                              items: {
                                type: "object",
                                properties: {
                                  id: { type: "integer", example: 1 },
                                  name: { type: "string", example: "Cà phê" },
                                  description: { type: "string", example: "Các loại cà phê thơm ngon" },
                                  is_active: { type: "boolean", example: true },
                                  created_at: { type: "string", format: "date-time" },
                                  updated_at: { type: "string", format: "date-time" }
                                }
                              }
                            },
                            pagination: {
                              type: "object",
                              properties: {
                                total: { type: "integer", example: 10 },
                                page: { type: "integer", example: 1 },
                                limit: { type: "integer", example: 20 },
                                total_pages: { type: "integer", example: 1 }
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
          401: { description: "Chưa xác thực" },
          403: { description: "Không có quyền truy cập" }
        }
      },
      post: {
        tags: ["Admin Categories"],
        summary: "Tạo danh mục mới",
        description: "Tạo một danh mục sản phẩm mới trong hệ thống (chỉ dành cho ADMIN/MANAGER).",
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["name"],
                properties: {
                  name: { type: "string", example: "Bánh ngọt" },
                  description: { type: "string", example: "Các loại bánh ngọt ăn kèm" },
                  is_active: { type: "boolean", example: true }
                }
              }
            }
          }
        },
        responses: {
          201: {
            description: "Tạo danh mục thành công",
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
                            id: { type: "integer", example: 5 },
                            name: { type: "string", example: "Bánh ngọt" },
                            description: { type: "string", example: "Các loại bánh ngọt ăn kèm" },
                            is_active: { type: "boolean", example: true },
                            created_at: { type: "string", format: "date-time" },
                            updated_at: { type: "string", format: "date-time" }
                          }
                        }
                      }
                    }
                  ]
                }
              }
            }
          },
          400: { description: "Dữ liệu đầu vào không hợp lệ" },
          401: { description: "Chưa xác thực" },
          403: { description: "Không có quyền thực hiện" }
        }
      }
    },
    "/api/admin/categories/{id}": {
      get: {
        tags: ["Admin Categories"],
        summary: "Lấy chi tiết danh mục",
        description: "Lấy chi tiết của một danh mục cụ thể theo ID.",
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            description: "ID danh mục",
            schema: { type: "integer", example: 1 }
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
                          type: "object",
                          properties: {
                            id: { type: "integer", example: 1 },
                            name: { type: "string", example: "Cà phê" },
                            description: { type: "string", example: "Các loại cà phê thơm ngon" },
                            is_active: { type: "boolean", example: true },
                            created_at: { type: "string", format: "date-time" },
                            updated_at: { type: "string", format: "date-time" }
                          }
                        }
                      }
                    }
                  ]
                }
              }
            }
          },
          401: { description: "Chưa xác thực" },
          404: { description: "Không tìm thấy danh mục" }
        }
      },
      put: {
        tags: ["Admin Categories"],
        summary: "Cập nhật danh mục",
        description: "Cập nhật thông tin của danh mục hiện có (chỉ dành cho ADMIN/MANAGER).",
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            description: "ID danh mục",
            schema: { type: "integer", example: 1 }
          }
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  name: { type: "string", example: "Cà phê & Trà" },
                  description: { type: "string", example: "Các loại đồ uống đá xay và trà nóng" },
                  is_active: { type: "boolean", example: true }
                }
              }
            }
          }
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
                            id: { type: "integer", example: 1 },
                            name: { type: "string", example: "Cà phê & Trà" },
                            description: { type: "string", example: "Các loại đồ uống đá xay và trà nóng" },
                            is_active: { type: "boolean", example: true },
                            created_at: { type: "string", format: "date-time" },
                            updated_at: { type: "string", format: "date-time" }
                          }
                        }
                      }
                    }
                  ]
                }
              }
            }
          },
          400: { description: "Dữ liệu cập nhật không hợp lệ" },
          401: { description: "Chưa xác thực" },
          403: { description: "Không có quyền thực hiện" },
          404: { description: "Không tìm thấy danh mục" }
        }
      },
      delete: {
        tags: ["Admin Categories"],
        summary: "Xóa danh mục",
        description: "Xóa mềm danh mục sản phẩm bằng cách chuyển trạng thái is_active thành false (chỉ dành cho ADMIN).",
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            description: "ID danh mục",
            schema: { type: "integer", example: 1 }
          }
        ],
        responses: {
          200: {
            description: "Xóa danh mục thành công",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ApiResponse"
                }
              }
            }
          },
          401: { description: "Chưa xác thực" },
          403: { description: "Không có quyền thực hiện (chỉ ADMIN)" },
          404: { description: "Không tìm thấy danh mục" }
        }
      }
    },
    "/api/admin/employees": {
      get: {
        tags: ["Admin Accounts"],
        summary: "Lấy danh sách nhân viên",
        description: "Lấy danh sách tài khoản nhân viên (chỉ dành cho ADMIN).",
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            name: "limit",
            in: "query",
            required: false,
            schema: { type: "integer", default: 20 }
          },
          {
            name: "offset",
            in: "query",
            required: false,
            schema: { type: "integer", default: 0 }
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
                              id: { type: "integer", example: 1 },
                              employee_code: { type: "string", example: "EMP001" },
                              full_name: { type: "string", example: "Nguyễn Văn A" },
                              email: { type: "string", example: "empa@example.com" },
                              role: { type: "string", example: "STAFF" },
                              branch_id: { type: "integer", example: 1 },
                              is_active: { type: "boolean", example: true },
                              created_at: { type: "string", format: "date-time" },
                              updated_at: { type: "string", format: "date-time" }
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
          401: { description: "Chưa xác thực" },
          403: { description: "Không có quyền truy cập" }
        }
      },
      post: {
        tags: ["Admin Accounts"],
        summary: "Tạo tài khoản nhân viên mới",
        description: "Tạo tài khoản cho nhân viên mới (chỉ dành cho ADMIN).",
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CreateEmployeeRequest" }
            }
          }
        },
        responses: {
          201: {
            description: "Tạo thành công",
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
                            employee_code: { type: "string", example: "EMP001" },
                            full_name: { type: "string", example: "Nguyễn Văn A" },
                            email: { type: "string", example: "empa@example.com" },
                            role: { type: "string", example: "STAFF" },
                            branch_id: { type: "integer", example: 1 },
                            is_active: { type: "boolean", example: true },
                            created_at: { type: "string", format: "date-time" }
                          }
                        }
                      }
                    }
                  ]
                }
              }
            }
          },
          400: { description: "Dữ liệu không hợp lệ hoặc trùng lặp" },
          401: { description: "Chưa xác thực" },
          403: { description: "Không có quyền truy cập" }
        }
      }
    },
    "/api/admin/employees/{id}": {
      get: {
        tags: ["Admin Accounts"],
        summary: "Chi tiết tài khoản nhân viên",
        description: "Lấy chi tiết tài khoản nhân viên theo ID (chỉ dành cho ADMIN).",
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" }
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
                          type: "object",
                          properties: {
                            id: { type: "integer", example: 1 },
                            employee_code: { type: "string", example: "EMP001" },
                            full_name: { type: "string", example: "Nguyễn Văn A" },
                            email: { type: "string", example: "empa@example.com" },
                            role: { type: "string", example: "STAFF" },
                            branch_id: { type: "integer", example: 1 },
                            is_active: { type: "boolean", example: true },
                            created_at: { type: "string", format: "date-time" },
                            updated_at: { type: "string", format: "date-time" }
                          }
                        }
                      }
                    }
                  ]
                }
              }
            }
          },
          401: { description: "Chưa xác thực" },
          403: { description: "Không có quyền truy cập" },
          404: { description: "Tài khoản nhân viên không tồn tại" }
        }
      },
      put: {
        tags: ["Admin Accounts"],
        summary: "Cập nhật tài khoản nhân viên",
        description: "Cập nhật tài khoản nhân viên theo ID (chỉ dành cho ADMIN).",
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" }
          }
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/UpdateEmployeeRequest" }
            }
          }
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
                            id: { type: "integer", example: 1 },
                            employee_code: { type: "string", example: "EMP001" },
                            full_name: { type: "string", example: "Nguyễn Văn A" },
                            email: { type: "string", example: "empa@example.com" },
                            role: { type: "string", example: "STAFF" },
                            branch_id: { type: "integer", example: 1 },
                            is_active: { type: "boolean", example: true },
                            updated_at: { type: "string", format: "date-time" }
                          }
                        }
                      }
                    }
                  ]
                }
              }
            }
          },
          401: { description: "Chưa xác thực" },
          403: { description: "Không có quyền truy cập" },
          404: { description: "Tài khoản nhân viên không tồn tại" }
        }
      },
      delete: {
        tags: ["Admin Accounts"],
        summary: "Vô hiệu hóa tài khoản nhân viên",
        description: "Vô hiệu hóa hoạt động của tài khoản nhân viên (chỉ dành cho ADMIN).",
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" }
          }
        ],
        responses: {
          200: {
            description: "Thành công",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ApiResponse" }
              }
            }
          },
          401: { description: "Chưa xác thực" },
          403: { description: "Không có quyền truy cập" },
          404: { description: "Tài khoản nhân viên không tồn tại" }
        }
      }
    },
    "/api/admin/customers": {
      get: {
        tags: ["Admin Customers"],
        summary: "Lấy danh sách khách hàng",
        description: "Lấy danh sách tài khoản thành viên/khách hàng (chỉ dành cho ADMIN và MANAGER).",
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: "search", in: "query", required: false, schema: { type: "string" }, description: "Tìm theo tên, SĐT hoặc email" },
          { name: "tierId", in: "query", required: false, schema: { type: "integer" }, description: "Lọc theo ID hạng thành viên" },
          { name: "isActive", in: "query", required: false, schema: { type: "string" }, description: "Lọc theo trạng thái hoạt động ('true' hoặc 'false')" },
          { name: "page", in: "query", required: false, schema: { type: "integer", default: 1 } },
          { name: "limit", in: "query", required: false, schema: { type: "integer", default: 10 } }
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
                          type: "object",
                          properties: {
                            customers: {
                              type: "array",
                              items: {
                                type: "object",
                                properties: {
                                  id: { type: "integer" },
                                  full_name: { type: "string" },
                                  phone_number: { type: "string" },
                                  email: { type: "string" },
                                  gender: { type: "string" },
                                  date_of_birth: { type: "string" },
                                  current_points: { type: "integer" },
                                  total_accumulated_points: { type: "integer" },
                                  barcode: { type: "string" },
                                  is_active: { type: "boolean" },
                                  tier_name: { type: "string" },
                                  color_code: { type: "string" }
                                }
                              }
                            },
                            pagination: {
                              type: "object",
                              properties: {
                                total: { type: "integer" },
                                page: { type: "integer" },
                                limit: { type: "integer" },
                                pages: { type: "integer" }
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
          401: { description: "Chưa xác thực" },
          403: { description: "Không có quyền truy cập" }
        }
      },
      post: {
        tags: ["Admin Customers"],
        summary: "Tạo khách hàng mới",
        description: "Tạo tài khoản thành viên/khách hàng thủ công (chỉ dành cho ADMIN và MANAGER).",
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CreateCustomerRequest" }
            }
          }
        },
        responses: {
          201: {
            description: "Tạo thành công",
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
                            id: { type: "integer" },
                            full_name: { type: "string" },
                            phone_number: { type: "string" },
                            barcode: { type: "string" }
                          }
                        }
                      }
                    }
                  ]
                }
              }
            }
          },
          400: { description: "Số điện thoại đã tồn tại hoặc dữ liệu không hợp lệ" },
          401: { description: "Chưa xác thực" }
        }
      }
    },
    "/api/admin/customers/{id}": {
      get: {
        tags: ["Admin Customers"],
        summary: "Lấy chi tiết khách hàng",
        description: "Lấy thông tin chi tiết và lịch sử mua hàng của khách hàng theo ID (chỉ dành cho ADMIN và MANAGER).",
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "integer" } }
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
                          type: "object",
                          properties: {
                            id: { type: "integer" },
                            full_name: { type: "string" },
                            phone_number: { type: "string" },
                            email: { type: "string" },
                            gender: { type: "string" },
                            date_of_birth: { type: "string" },
                            current_points: { type: "integer" },
                            total_accumulated_points: { type: "integer" },
                            barcode: { type: "string" },
                            is_active: { type: "boolean" },
                            tier_name: { type: "string" },
                            color_code: { type: "string" },
                            invoices: {
                              type: "array",
                              items: {
                                type: "object",
                                properties: {
                                  id: { type: "integer" },
                                  invoice_code: { type: "string" },
                                  final_amount: { type: "number" },
                                  status: { type: "string" },
                                  paid_at: { type: "string" },
                                  created_at: { type: "string" },
                                  branch_name: { type: "string" }
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
          401: { description: "Chưa xác thực" },
          404: { description: "Khách hàng không tồn tại" }
        }
      },
      put: {
        tags: ["Admin Customers"],
        summary: "Cập nhật thông tin khách hàng",
        description: "Cập nhật các thông tin của khách hàng theo ID (chỉ dành cho ADMIN và MANAGER).",
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "integer" } }
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/UpdateCustomerRequest" }
            }
          }
        },
        responses: {
          200: {
            description: "Cập nhật thành công",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ApiResponse" }
              }
            }
          },
          400: { description: "Số điện thoại đã được sử dụng hoặc dữ liệu không hợp lệ" },
          401: { description: "Chưa xác thực" },
          404: { description: "Khách hàng không tồn tại" }
        }
      },
      delete: {
        tags: ["Admin Customers"],
        summary: "Vô hiệu hóa khách hàng",
        description: "Vô hiệu hóa hoạt động của tài khoản khách hàng (chỉ dành cho ADMIN).",
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "integer" } }
        ],
        responses: {
          200: {
            description: "Thành công",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ApiResponse" }
              }
            }
          },
          401: { description: "Chưa xác thực" },
          404: { description: "Khách hàng không tồn tại" }
        }
      }
    },
    "/api/admin/invoices": {
      get: {
        tags: ["Admin Invoices"],
        summary: "Lấy danh sách tất cả hóa đơn",
        description: "Lấy toàn bộ danh sách hóa đơn trong hệ thống có bộ lọc và phân trang (chỉ dành cho ADMIN và MANAGER).",
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: "search", in: "query", required: false, schema: { type: "string" }, description: "Tìm kiếm theo mã hóa đơn" },
          { name: "branchId", in: "query", required: false, schema: { type: "integer" } },
          { name: "employeeId", in: "query", required: false, schema: { type: "integer" } },
          { name: "memberId", in: "query", required: false, schema: { type: "integer" } },
          { name: "status", in: "query", required: false, schema: { type: "string", enum: ["DRAFT", "COMPLETED", "CANCELLED"] } },
          { name: "startDate", in: "query", required: false, schema: { type: "string" }, description: "ISO format (ví dụ: '2026-07-01T00:00:00Z')" },
          { name: "endDate", in: "query", required: false, schema: { type: "string" } },
          { name: "page", in: "query", required: false, schema: { type: "integer", default: 1 } },
          { name: "limit", in: "query", required: false, schema: { type: "integer", default: 10 } }
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
                          type: "object",
                          properties: {
                            invoices: {
                              type: "array",
                              items: {
                                type: "object",
                                properties: {
                                  id: { type: "integer" },
                                  invoice_code: { type: "string" },
                                  sub_total: { type: "number" },
                                  discount_amount: { type: "number" },
                                  voucher_discount: { type: "number" },
                                  final_amount: { type: "number" },
                                  status: { type: "string" },
                                  created_at: { type: "string" },
                                  branch_name: { type: "string" },
                                  employee_name: { type: "string" },
                                  member_name: { type: "string" }
                                }
                              }
                            },
                            pagination: {
                              type: "object",
                              properties: {
                                total: { type: "integer" },
                                page: { type: "integer" },
                                limit: { type: "integer" },
                                pages: { type: "integer" }
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
          401: { description: "Chưa xác thực" }
        }
      }
    },
    "/api/admin/invoices/{id}": {
      get: {
        tags: ["Admin Invoices"],
        summary: "Lấy chi tiết hóa đơn",
        description: "Lấy thông tin chi tiết một hóa đơn kèm các dòng sản phẩm chi tiết (chỉ dành cho ADMIN và MANAGER).",
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "integer" } }
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
                          type: "object",
                          properties: {
                            id: { type: "integer" },
                            invoice_code: { type: "string" },
                            sub_total: { type: "number" },
                            discount_amount: { type: "number" },
                            voucher_discount: { type: "number" },
                            final_amount: { type: "number" },
                            status: { type: "string" },
                            table_number: { type: "string" },
                            created_at: { type: "string" },
                            branch_name: { type: "string" },
                            employee_name: { type: "string" },
                            member_name: { type: "string" },
                            member_phone: { type: "string" },
                            details: {
                              type: "array",
                              items: {
                                type: "object",
                                properties: {
                                  id: { type: "integer" },
                                  product_name: { type: "string" },
                                  quantity: { type: "integer" },
                                  unit_price: { type: "number" }
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
          401: { description: "Chưa xác thực" },
          404: { description: "Hóa đơn không tồn tại" }
        }
      }
    },
    "/api/admin/invoices/{id}/status": {
      put: {
        tags: ["Admin Invoices"],
        summary: "Cập nhật trạng thái hóa đơn",
        description: "Cập nhật trạng thái cho hóa đơn (chỉ dành cho ADMIN).",
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "integer" } }
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["status"],
                properties: {
                  status: { type: "string", enum: ["DRAFT", "COMPLETED", "CANCELLED"], example: "CANCELLED" }
                }
              }
            }
          }
        },
        responses: {
          200: {
            description: "Cập nhật thành công",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ApiResponse" }
              }
            }
          },
          400: { description: "Trạng thái không hợp lệ hoặc dữ liệu sai" },
          401: { description: "Chưa xác thực" },
          404: { description: "Hóa đơn không tồn tại" }
        }
      }
    },
    "/api/admin/vouchers": {
      get: {
        tags: ["Admin Vouchers"],
        summary: "Lấy danh sách tất cả voucher",
        description: "Lấy danh sách tất cả các voucher đang được quản lý (chỉ dành cho ADMIN và MANAGER).",
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            name: "limit",
            in: "query",
            required: false,
            schema: { type: "integer", default: 20 }
          },
          {
            name: "offset",
            in: "query",
            required: false,
            schema: { type: "integer", default: 0 }
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
                              id: { type: "integer", example: 1 },
                              code: { type: "string", example: "GIAM20K" },
                              title: { type: "string", example: "Giảm 20k cho đơn từ 100k" },
                              discount_type: { type: "string", example: "FIXED" },
                              discount_value: { type: "number", example: 20000 },
                              max_discount: { type: "number", example: 20000, nullable: true },
                              point_cost: { type: "integer", example: 50 },
                              stock_quantity: { type: "integer", example: 100 },
                              applicable_tiers: { type: "array", items: { type: "integer" } },
                              valid_from: { type: "string", format: "date-time" },
                              valid_to: { type: "string", format: "date-time" },
                              expiry_days: { type: "integer", example: 30 },
                              is_active: { type: "boolean", example: true }
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
          401: { description: "Chưa xác thực" },
          403: { description: "Không có quyền truy cập" }
        }
      },
      post: {
        tags: ["Admin Vouchers"],
        summary: "Tạo ưu đãi voucher mới",
        description: "Tạo mới một chương trình ưu đãi voucher (chỉ dành cho ADMIN và MANAGER).",
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CreateVoucherRequest" }
            }
          }
        },
        responses: {
          201: {
            description: "Tạo thành công",
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
                            code: { type: "string", example: "GIAM20K" },
                            title: { type: "string", example: "Giảm 20k cho đơn từ 100k" },
                            discount_type: { type: "string", example: "FIXED" },
                            discount_value: { type: "number", example: 20000 },
                            max_discount: { type: "number", example: 20000, nullable: true },
                            point_cost: { type: "integer", example: 50 },
                            stock_quantity: { type: "integer", example: 100 },
                            applicable_tiers: { type: "array", items: { type: "integer" } },
                            valid_from: { type: "string", format: "date-time" },
                            valid_to: { type: "string", format: "date-time" },
                            expiry_days: { type: "integer", example: 30 },
                            is_active: { type: "boolean", example: true }
                          }
                        }
                      }
                    }
                  ]
                }
              }
            }
          },
          400: { description: "Mã ưu đãi đã được sử dụng hoặc dữ liệu không hợp lệ" },
          401: { description: "Chưa xác thực" },
          403: { description: "Không có quyền truy cập" }
        }
      }
    },
    "/api/admin/vouchers/{id}": {
      get: {
        tags: ["Admin Vouchers"],
        summary: "Lấy chi tiết voucher",
        description: "Lấy chi tiết voucher theo ID (chỉ dành cho ADMIN và MANAGER).",
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" }
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
                          type: "object",
                          properties: {
                            id: { type: "integer", example: 1 },
                            code: { type: "string", example: "GIAM20K" },
                            title: { type: "string", example: "Giảm 20k cho đơn từ 100k" },
                            discount_type: { type: "string", example: "FIXED" },
                            discount_value: { type: "number", example: 20000 },
                            max_discount: { type: "number", example: 20000, nullable: true },
                            point_cost: { type: "integer", example: 50 },
                            stock_quantity: { type: "integer", example: 100 },
                            applicable_tiers: { type: "array", items: { type: "integer" } },
                            valid_from: { type: "string", format: "date-time" },
                            valid_to: { type: "string", format: "date-time" },
                            expiry_days: { type: "integer", example: 30 },
                            is_active: { type: "boolean", example: true }
                          }
                        }
                      }
                    }
                  ]
                }
              }
            }
          },
          401: { description: "Chưa xác thực" },
          403: { description: "Không có quyền truy cập" },
          404: { description: "Ưu đãi không tồn tại" }
        }
      },
      put: {
        tags: ["Admin Vouchers"],
        summary: "Cập nhật ưu đãi voucher",
        description: "Cập nhật thông tin voucher theo ID (chỉ dành cho ADMIN và MANAGER).",
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" }
          }
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/UpdateVoucherRequest" }
            }
          }
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
                            id: { type: "integer", example: 1 },
                            code: { type: "string", example: "GIAM20K" },
                            title: { type: "string", example: "Giảm 20k cho đơn từ 100k" },
                            discount_type: { type: "string", example: "FIXED" },
                            discount_value: { type: "number", example: 20000 },
                            max_discount: { type: "number", example: 20000, nullable: true },
                            point_cost: { type: "integer", example: 50 },
                            stock_quantity: { type: "integer", example: 100 },
                            applicable_tiers: { type: "array", items: { type: "integer" } },
                            valid_from: { type: "string", format: "date-time" },
                            valid_to: { type: "string", format: "date-time" },
                            expiry_days: { type: "integer", example: 30 },
                            is_active: { type: "boolean", example: true }
                          }
                        }
                      }
                    }
                  ]
                }
              }
            }
          },
          400: { description: "Mã ưu đãi mới đã được sử dụng hoặc dữ liệu không hợp lệ" },
          401: { description: "Chưa xác thực" },
          403: { description: "Không có quyền truy cập" },
          404: { description: "Ưu đãi không tồn tại" }
        }
      },
      delete: {
        tags: ["Admin Vouchers"],
        summary: "Vô hiệu hóa ưu đãi voucher",
        description: "Vô hiệu hóa hoạt động của voucher (chỉ dành cho ADMIN và MANAGER).",
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" }
          }
        ],
        responses: {
          200: {
            description: "Thành công",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ApiResponse" }
              }
            }
          },
          401: { description: "Chưa xác thực" },
          403: { description: "Không có quyền truy cập" },
          404: { description: "Ưu đãi không tồn tại" }
        }
      }
    },
    "/api/admin/point-configs": {
      get: {
        tags: ["Admin Point Configs"],
        summary: "Lấy cấu hình điểm tích lũy",
        description: "Lấy toàn bộ danh sách cấu hình điểm tích lũy (chỉ dành cho ADMIN và MANAGER).",
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
                              id: { type: "integer", example: 1 },
                              spend_amount: { type: "number", example: 10000 },
                              earn_points: { type: "integer", example: 1 },
                              is_active: { type: "boolean", example: true }
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
          401: { description: "Chưa xác thực" },
          403: { description: "Không có quyền truy cập" }
        }
      },
      post: {
        tags: ["Admin Point Configs"],
        summary: "Tạo cấu hình điểm tích lũy mới",
        description: "Tạo cấu hình quy đổi điểm mới. Nếu set is_active=true thì các cấu hình cũ sẽ bị deactive (chỉ dành cho ADMIN và MANAGER).",
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CreatePointConfigRequest" }
            }
          }
        },
        responses: {
          201: {
            description: "Tạo thành công",
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
                            spend_amount: { type: "number", example: 10000 },
                            earn_points: { type: "integer", example: 1 },
                            is_active: { type: "boolean", example: true }
                          }
                        }
                      }
                    }
                  ]
                }
              }
            }
          },
          400: { description: "Dữ liệu không hợp lệ" },
          401: { description: "Chưa xác thực" },
          403: { description: "Không có quyền truy cập" }
        }
      }
    },
    "/api/admin/point-configs/{id}": {
      put: {
        tags: ["Admin Point Configs"],
        summary: "Cập nhật cấu hình điểm tích lũy",
        description: "Cập nhật cấu hình quy đổi điểm theo ID (chỉ dành cho ADMIN và MANAGER).",
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" }
          }
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/UpdatePointConfigRequest" }
            }
          }
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
                            id: { type: "integer", example: 1 },
                            spend_amount: { type: "number", example: 10000 },
                            earn_points: { type: "integer", example: 1 },
                            is_active: { type: "boolean", example: true }
                          }
                        }
                      }
                    }
                  ]
                }
              }
            }
          },
          401: { description: "Chưa xác thực" },
          403: { description: "Không có quyền truy cập" },
          404: { description: "Cấu hình điểm không tồn tại" }
        }
      }
    },
    "/api/admin/tiers": {
      get: {
        tags: ["Admin Point Configs"],
        summary: "Lấy cấu hình hạng thành viên",
        description: "Lấy danh sách các hạng thành viên kèm hệ số điểm (chỉ dành cho ADMIN và MANAGER).",
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
                              id: { type: "integer", example: 1 },
                              tier_name: { type: "string", example: "Silver" },
                              min_points: { type: "integer", example: 1000 },
                              point_multiplier: { type: "number", example: 1.2 },
                              color_code: { type: "string", example: "#C0C0C0" }
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
          401: { description: "Chưa xác thực" },
          403: { description: "Không có quyền truy cập" }
        }
      }
    },
    "/api/admin/tiers/{id}": {
      put: {
        tags: ["Admin Point Configs"],
        summary: "Cập nhật hạng thành viên",
        description: "Cập nhật cấu hình của hạng thành viên theo ID (chỉ dành cho ADMIN và MANAGER).",
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" }
          }
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/UpdateTierRequest" }
            }
          }
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
                            id: { type: "integer", example: 1 },
                            tier_name: { type: "string", example: "Silver" },
                            min_points: { type: "integer", example: 1000 },
                            point_multiplier: { type: "number", example: 1.2 },
                            color_code: { type: "string", example: "#C0C0C0" }
                          }
                        }
                      }
                    }
                  ]
                }
              }
            }
          },
          401: { description: "Chưa xác thực" },
          403: { description: "Không có quyền truy cập" },
          404: { description: "Hạng thành viên không tồn tại" }
        }
      }
    },
    "/api/admin/reports/overview": {
      get: {
        tags: ["Admin Reports"],
        summary: "Báo cáo tổng quan Dashboard",
        description: "Lấy số liệu tổng hợp doanh thu, số hóa đơn, số lượng thành viên, và tỷ lệ tăng trưởng (chỉ dành cho ADMIN và MANAGER).",
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
                          type: "object",
                          properties: {
                            todayRevenue: { type: "number", example: 5000000 },
                            todayInvoices: { type: "integer", example: 25 },
                            activeMembers: { type: "integer", example: 120 },
                            growthRate: { type: "number", example: 12.5 }
                          }
                        }
                      }
                    }
                  ]
                }
              }
            }
          },
          401: { description: "Chưa xác thực" },
          403: { description: "Không có quyền truy cập" }
        }
      }
    },
    "/api/admin/reports/revenue": {
      get: {
        tags: ["Admin Reports"],
        summary: "Báo cáo doanh thu",
        description: "Lấy doanh thu theo thời gian lọc từ start_date đến end_date (chỉ dành cho ADMIN và MANAGER).",
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            name: "start_date",
            in: "query",
            required: false,
            schema: { type: "string", format: "date-time" }
          },
          {
            name: "end_date",
            in: "query",
            required: false,
            schema: { type: "string", format: "date-time" }
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
                              date: { type: "string", format: "date", example: "2026-06-15" },
                              total_revenue: { type: "number", example: 15400000 },
                              invoice_count: { type: "integer", example: 78 }
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
          401: { description: "Chưa xác thực" },
          403: { description: "Không có quyền truy cập" }
        }
      }
    },
    "/api/admin/reports/monthly-revenue": {
      get: {
        tags: ["Admin Reports"],
        summary: "Báo cáo doanh thu 12 tháng",
        description: "Lấy doanh thu tổng hợp của 12 tháng trong năm được chọn (mặc định là năm hiện tại, chỉ dành cho ADMIN và MANAGER).",
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            name: "year",
            in: "query",
            required: false,
            schema: { type: "integer" },
            description: "Năm cần lấy báo cáo (ví dụ: 2026)"
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
                              month: { type: "integer", example: 1, description: "Tháng trong năm (1-12)" },
                              revenue: { type: "number", example: 125000000 },
                              order_count: { type: "integer", example: 154 }
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
          401: { description: "Chưa xác thực" },
          403: { description: "Không có quyền truy cập" }
        }
      }
    },
    "/api/admin/reports/members": {
      get: {
        tags: ["Admin Reports"],
        summary: "Thống kê phân bố hạng thành viên",
        description: "Lấy số lượng thành viên phân loại theo từng hạng thẻ (chỉ dành cho ADMIN và MANAGER).",
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
                              tier_name: { type: "string", example: "Silver" },
                              member_count: { type: "integer", example: 342 }
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
          401: { description: "Chưa xác thực" },
          403: { description: "Không có quyền truy cập" }
        }
      }
    },
    "/api/admin/reports/top-customers": {
      get: {
        tags: ["Admin Reports"],
        summary: "Top khách hàng tiêu biểu",
        description: "Lấy danh sách các khách hàng chi tiêu nhiều nhất (chỉ dành cho ADMIN và MANAGER).",
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            name: "limit",
            in: "query",
            required: false,
            schema: { type: "integer", default: 10 }
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
                              member_id: { type: "integer", example: 12 },
                              full_name: { type: "string", example: "Nguyễn Văn B" },
                              phone: { type: "string", example: "0987654321" },
                              total_spent: { type: "number", example: 12500000 }
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
          401: { description: "Chưa xác thực" },
          403: { description: "Không có quyền truy cập" }
        }
      }
    },
    "/api/admin/reports/top-products": {
      get: {
        tags: ["Admin Reports"],
        summary: "Top sản phẩm bán chạy nhất",
        description: "Lấy danh sách các sản phẩm/món ăn có doanh số cao nhất (chỉ dành cho ADMIN và MANAGER).",
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            name: "limit",
            in: "query",
            required: false,
            schema: { type: "integer", default: 10 }
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
                              product_name: { type: "string", example: "Cà phê sữa đá" },
                              total_quantity: { type: "integer", example: 512 },
                              total_revenue: { type: "number", example: 14848000 }
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
          401: { description: "Chưa xác thực" },
          403: { description: "Không có quyền truy cập" }
        }
      }
    },
    "/api/member/notifications": {
      get: {
        tags: ["Member Notifications"],
        summary: "Lấy danh sách thông báo của thành viên",
        description: "Lấy toàn bộ danh sách thông báo cá nhân và hệ thống dành cho thành viên hiện tại.",
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            name: "limit",
            in: "query",
            required: false,
            schema: { type: "integer", default: 20 }
          },
          {
            name: "offset",
            in: "query",
            required: false,
            schema: { type: "integer", default: 0 }
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
                              id: { type: "integer", example: 1 },
                              member_id: { type: "integer", example: 12, nullable: true },
                              title: { type: "string", example: "Tích lũy điểm thành công" },
                              body: { type: "string", example: "Bạn vừa tích thành công +10 điểm từ hóa đơn INV-001." },
                              type: { type: "string", example: "POINTS_EARNED" },
                              reference_id: { type: "integer", example: 5, nullable: true },
                              reference_type: { type: "string", example: "INVOICE", nullable: true },
                              is_read: { type: "boolean", example: false },
                              read_at: { type: "string", format: "date-time", nullable: true },
                              created_at: { type: "string", format: "date-time" }
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
          401: { description: "Chưa xác thực" }
        }
      }
    },
    "/api/member/notifications/{id}/read": {
      patch: {
        tags: ["Member Notifications"],
        summary: "Đánh dấu đã đọc một thông báo",
        description: "Đánh dấu đã đọc một thông báo cụ thể dựa trên ID.",
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" }
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
                          type: "object",
                          properties: {
                            id: { type: "integer", example: 1 },
                            is_read: { type: "boolean", example: true },
                            read_at: { type: "string", format: "date-time" }
                          }
                        }
                      }
                    }
                  ]
                }
              }
            }
          },
          401: { description: "Chưa xác thực" },
          403: { description: "Không có quyền thao tác trên thông báo này" },
          404: { description: "Không tìm thấy thông báo" }
        }
      }
    },
    "/api/member/notifications/read-all": {
      patch: {
        tags: ["Member Notifications"],
        summary: "Đánh dấu đọc tất cả thông báo",
        description: "Đánh dấu đã đọc toàn bộ danh sách thông báo chưa đọc của thành viên.",
        security: [{ BearerAuth: [] }],
        responses: {
          200: {
            description: "Thành công",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ApiResponse"
                }
              }
            }
          },
          401: { description: "Chưa xác thực" }
        }
      }
    },
  },
};

module.exports = swaggerDocument;
