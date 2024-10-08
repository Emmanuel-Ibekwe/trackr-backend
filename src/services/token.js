const tokenUtils = require("./../utils/token.js");
const { sign, verify } = tokenUtils;

const generateToken = async (payload, expiresIn, secret) => {
  const token = await sign(payload, expiresIn, secret);
  return token;
};

const verifyToken = async (token, secret) => {
  const payload = await verify(token, secret);
  return payload;
};

module.exports = { generateToken, verifyToken };
