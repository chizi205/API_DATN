const infoRepository = require("../../repositories/members/info.repositories");
const AuthRepo = require("../../repositories/members/auth.repositories");
const { normalizePhoneNumber } = require("../../utils/normalizePhoneNumber");
class MemberService {
  async getCard(memberId) {
    const profile = await infoRepository.getMemberCard(memberId);

    if (!profile) {
      throw new Error("MEMBER_NOT_FOUND");
    }

    return profile;
  }
  async getProfile(memberId) {
    const profile = await infoRepository.getMemberProfile(memberId);

    if (!profile) {
      throw new Error("MEMBER_NOT_FOUND");
    }

    return profile;
  }
  async updateProfile(memberId, data) {
    if (data.gender !== undefined) {
      console.log(data);
      const allowedGenders = ["MALE", "FEMALE", "OTHER", "UNKNOWN"];
      const normalizedGender = String(data.gender).toUpperCase().trim();

      if (!allowedGenders.includes(normalizedGender)) {
        throw new Error("INVALID_GENDER");
      }
      data.gender = normalizedGender;
    }

    const updated = await AuthRepo.updateProfile(memberId, data);

    if (!updated) {
      throw new Error("NO_FIELDS_TO_UPDATE");
    }

    return await this.getProfile(memberId);
  }

  async getMemberByPhone(phoneNumber) {
    if (!phoneNumber) {
      throw new Error("Vui lòng nhập số điện thoại");
    }

    const normalizedPhone = normalizePhoneNumber(phoneNumber);

    const member = await infoRepository.searchByPhone(normalizedPhone);

    if (!member) {
      throw new Error("Không tìm thấy thành viên với số điện thoại này");
    }

    return member;
  }

  async getInvoicesHistory(memberId, limit = 20, offset = 0) {
    const invoices = await infoRepository.getMemberInvoices(memberId, limit, offset);
    if (invoices.length === 0) return [];

    const invoiceIds = invoices.map(i => i.id);
    const details = await infoRepository.getInvoiceDetailsByInvoiceIds(invoiceIds);

    return invoices.map(invoice => {
      return {
        ...invoice,
        items: details.filter(d => d.invoice_id === invoice.id)
      };
    });
  }

  async getPointHistory(memberId, limit = 20, offset = 0) {
    return await infoRepository.getMemberPointTransactions(memberId, limit, offset);
  }
}

module.exports = new MemberService();
