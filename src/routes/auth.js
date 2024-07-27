const express = require("express");
const {
  signup,
  login,
  logout,
  refreshAccessToken,
  resetPassword,
  validateResetCode,
  sendResetPasswordEmail,
  googleSignIn,
  googleOauth
} = require("./../controllers/auth.js");

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);
router.post("/token", refreshAccessToken);
router.post("/send-reset-email", sendResetPasswordEmail);
router.post("/validate-reset-code", validateResetCode);
router.post("/reset-password", resetPassword);
router.post("/google-sign-in", googleSignIn);

module.exports = router;
