const invoiceRepository = require("../../repositories/admin/invoice.repository");

class InvoiceService {
  async getInvoices(query) {
    const page = parseInt(query.page, 10) || 1;
    const limit = parseInt(query.limit, 10) || 10;
    const offset = (page - 1) * limit;

    const filters = {
      search: query.search,
      branchId: query.branchId,
      employeeId: query.employeeId,
      memberId: query.memberId,
      status: query.status,
      start_date: query.start_date,
      end_date: query.end_date,
      limit,
      offset,
    };

    const [invoices, total] = await Promise.all([
      invoiceRepository.findAll(filters),
      invoiceRepository.countAll(filters),
    ]);

    return {
      invoices,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async getInvoiceById(id) {
    const invoice = await invoiceRepository.findById(id);
    if (!invoice) {
      throw new Error("Hóa đơn không tồn tại");
    }

    const details = await invoiceRepository.getInvoiceDetails(id);

    return {
      ...invoice,
      details,
    };
  }

  async updateInvoiceStatus(id, status) {
    const invoice = await invoiceRepository.findById(id);
    if (!invoice) {
      throw new Error("Hóa đơn không tồn tại");
    }

    const allowedStatuses = ["DRAFT", "COMPLETED", "CANCELLED"];
    if (!allowedStatuses.includes(status)) {
      throw new Error("Trạng thái hóa đơn không hợp lệ");
    }

    return await invoiceRepository.updateStatus(id, status);
  }
}

module.exports = new InvoiceService();
