const customerRepository = require("../../repositories/admin/customer.repository");
const pool = require("../../config/database");

class CustomerService {
  async getCustomers(query) {
    const page = parseInt(query.page, 10) || 1;
    const limit = parseInt(query.limit, 10) || 10;
    const offset = (page - 1) * limit;

    const filters = {
      search: query.search,
      tierId: query.tierId,
      isActive: query.isActive,
      limit,
      offset,
    };

    const [customers, total] = await Promise.all([
      customerRepository.findAll(filters),
      customerRepository.countAll(filters),
    ]);

    return {
      customers,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async getCustomerById(id) {
    const customer = await customerRepository.findById(id);
    if (!customer) {
      throw new Error("Khách hàng không tồn tại");
    }

    const invoices = await customerRepository.getCustomerInvoiceHistory(id);

    return {
      ...customer,
      invoices,
    };
  }

  async createCustomer(data) {
    if (!data.phone_number) {
      throw new Error("Số điện thoại là bắt buộc");
    }

    const existing = await customerRepository.findByPhone(data.phone_number);
    if (existing) {
      throw new Error("Số điện thoại đã được đăng ký cho khách hàng khác");
    }

    // Default tier if not provided
    if (!data.tier_id) {
      const { rows } = await pool.query(
        "SELECT id FROM membership_tiers ORDER BY min_points ASC LIMIT 1"
      );
      data.tier_id = rows[0] ? rows[0].id : null;
    }

    return await customerRepository.create(data);
  }

  async updateCustomer(id, data) {
    const customer = await customerRepository.findById(id);
    if (!customer) {
      throw new Error("Khách hàng không tồn tại");
    }

    if (data.phone_number && data.phone_number !== customer.phone_number) {
      const existing = await customerRepository.findByPhone(data.phone_number);
      if (existing && String(existing.id) !== String(id)) {
        throw new Error("Số điện thoại đã được sử dụng bởi khách hàng khác");
      }
    }

    const updated = await customerRepository.update(id, data);
    return updated;
  }

  async deleteCustomer(id) {
    const customer = await customerRepository.findById(id);
    if (!customer) {
      throw new Error("Khách hàng không tồn tại");
    }

    return await customerRepository.delete(id);
  }
}

module.exports = new CustomerService();
