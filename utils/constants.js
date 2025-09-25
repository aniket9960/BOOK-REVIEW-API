const JWT_SECRET = process.env.JWT_SECRET;
const ACCESS_EXPIRY = "15m";
const REFRESH_EXPIRY = "7d";

module.exports = {
  JWT_SECRET,
  ACCESS_EXPIRY,
  REFRESH_EXPIRY,
};
