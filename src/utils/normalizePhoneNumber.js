function normalizePhoneNumber(phone) {
  if (!phone) return null;

  let cleaned = phone.replace(/[\s-]/g, "");

  if (cleaned.startsWith("0")) {
    cleaned = "+84" + cleaned.slice(1);
  }

  if (cleaned.startsWith("84") && !cleaned.startsWith("+84")) {
    cleaned = "+" + cleaned;
  }

  return cleaned;
}

module.exports = { normalizePhoneNumber };
