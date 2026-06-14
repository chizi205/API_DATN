const infoRepository = require("../../repositories/members/info.repositories");
const AuthRepo = require("../../repositories/members/auth.repositories");
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

}

module.exports = new MemberService();
