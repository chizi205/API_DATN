const pool = require("../../config/database");
const invoiceRepo = require("../../repositories/invoices/invoice.repository");
const infoRepository = require("../../repositories/members/info.repositories");

class InvoiceService {
  async createDraftInvoice(data) {
    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      let subTotal = 0;
      const items = data.items.map((item) => {
        const itemTotal = item.quantity * item.unit_price;
        subTotal += itemTotal;
        return {
          invoice_id: null,
          product_id: item.product_id || null,
          product_name: item.product_name,
          quantity: item.quantity,
          unit_price: item.unit_price,
        };
      });

      let pointsMultiplier = data.points_multiplier || 1.0;

      if (data.member_id) {
        const memberTier = await infoRepository.getMemberPointsMultiplier(
          data.member_id,
          client,
        );

        if (memberTier) {
          pointsMultiplier = memberTier.point_multiplier || 1.0;
        }
      }

      const pointConfigs = await invoiceRepo.getActivePointConfig(client);
      let pointsEarned = 0;

      if (pointConfigs.length > 0) {
        const config = pointConfigs[0];
        pointsEarned =
          Math.floor(subTotal / config.spend_amount) * config.earn_points;
      }

      const finalAmount =
        subTotal + (data.tax_amount || 0) + (data.service_charge || 0);

      const invoiceData = {
        employee_id: data.employee_id,
        branch_id: data.branch_id,
        member_id: data.member_id || null,
        table_number: data.table_number || null,
        sub_total: subTotal,
        discount_amount: 0,
        voucher_discount: 0,
        final_amount: finalAmount,
        points_earned: pointsEarned,
        points_multiplier: pointsMultiplier,
        status: "DRAFT",
        tax_amount: data.tax_amount || 0,
        service_charge: data.service_charge || 0,
      };

      const invoice = await invoiceRepo.create(invoiceData, client);

      const detailsWithInvoiceId = items.map((item) => ({
        ...item,
        invoice_id: invoice.id,
      }));

      await invoiceRepo.createManyInvoiceDetails(detailsWithInvoiceId, client);

      await client.query("COMMIT");

      return {
        ...invoice,
        items: detailsWithInvoiceId,
      };
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }
}

module.exports = new InvoiceService();
