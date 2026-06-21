const branchesRepository = require("../../repositories/branches/branches.repository");

class StoreService {
  async getAllStores(filters) {
    const result = await branchesRepository.getAllStoresService(filters);
    return result;
  }
}

module.exports = new StoreService();
