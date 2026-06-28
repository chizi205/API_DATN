const reportRepository = require("../../repositories/admin/report.repository");
const ApiResponse = require("../../utils/response");

class ReportController {
  async getOverview(req, res) {
    try {
      const overview = await reportRepository.getDashboardOverview();
      return ApiResponse.success(res, overview, "Lấy thông tin tổng quan thành công");
    } catch (error) {
      console.error("Get Overview Report Error:", error);
      return ApiResponse.serverError(res, "Lỗi server khi lấy báo cáo tổng quan");
    }
  }

  async getRevenue(req, res) {
    try {
      const { start_date, end_date } = req.query;
      const stats = await reportRepository.getRevenueStats(start_date, end_date);
      return ApiResponse.success(res, stats, "Lấy thống kê doanh thu thành công");
    } catch (error) {
      console.error("Get Revenue Report Error:", error);
      return ApiResponse.serverError(res, "Lỗi server khi lấy báo cáo doanh thu");
    }
  }

  async getMemberStats(req, res) {
    try {
      const distribution = await reportRepository.getMemberDistribution();
      return ApiResponse.success(res, distribution, "Lấy thống kê thành viên thành công");
    } catch (error) {
      console.error("Get Member Stats Error:", error);
      return ApiResponse.serverError(res, "Lỗi server khi lấy báo cáo thành viên");
    }
  }

  async getTopCustomers(req, res) {
    try {
      const limit = parseInt(req.query.limit) || 10;
      const spenders = await reportRepository.getTopSpenders(limit);
      return ApiResponse.success(res, spenders, "Lấy danh sách khách hàng tiêu biểu thành công");
    } catch (error) {
      console.error("Get Top Customers Error:", error);
      return ApiResponse.serverError(res, "Lỗi server khi lấy khách hàng tiêu biểu");
    }
  }

  async getTopProducts(req, res) {
    try {
      const limit = parseInt(req.query.limit) || 10;
      const products = await reportRepository.getTopSellingProducts(limit);
      return ApiResponse.success(res, products, "Lấy danh sách sản phẩm bán chạy thành công");
    } catch (error) {
      console.error("Get Top Products Error:", error);
      return ApiResponse.serverError(res, "Lỗi server khi lấy sản phẩm bán chạy");
    }
  }
}

module.exports = new ReportController();
