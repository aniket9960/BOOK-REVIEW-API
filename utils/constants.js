const JWT_SECRET = process.env.JWT_SECRET;
const ACCESS_EXPIRY = "15m";
const REFRESH_EXPIRY = "7d";

const createTokens = (userId, email) => {
    const accessToken = jwt.sign({ userId, email }, JWT_SECRET, { expiresIn: ACCESS_EXPIRY });
    const refreshToken = jwt.sign({ userId, email }, JWT_SECRET, { expiresIn: REFRESH_EXPIRY });
    return { accessToken, refreshToken };
};

module.exports = {
  JWT_SECRET,
  ACCESS_EXPIRY,
  REFRESH_EXPIRY,
  createTokens
};
