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

/**
 * @swagger
 * /api/v1/auth/signup:
 *   post:
 *     summary: Signs up a new user
 *     description: Signs up a new user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: The name of the user
 *                 example: John Doe
 *               email:
 *                 type: string
 *                 description: The user's email
 *                 example: johndoe4@gmail.com
 *               picture:
 *                 type: string
 *                 description: The link to the user's profile picture
 *                 example: https://picture.com
 *               password:
 *                 type: string
 *                 description: The user's password
 *                 example: rree44r:?
 *     responses:
 *       201:
 *         description: user signed up successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: success message of the response
 *                   example: sign up successful
 *                 accessToken:
 *                   type: string
 *                   description: random string generated using jwt
 *                   example: fghjkjhhjkjh88uiyuhjuyhu76tyuy7
 *                 refreshToken:
 *                   type: string
 *                   description: random string generated using jwt
 *                   example: fghjkjhhjkjh88uiyuhjuyhu76tyuy7
 *                 user:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       description: auto database generated id
 *                       example: 67787y8hh8587676634f
 *                     name:
 *                       type: string
 *                       description: The name of the user
 *                       example: John Doe
 *                     email:
 *                       type: string
 *                       description: The user's email
 *                       example: johndoe4@gmail.com
 *                     picture:
 *                       type: string
 *                       description: The link to the user's profile picture
 *                       example: https://picture.com
 *       400:
 *         description: Please fill all fields || email is invalid || password must be atleast 8 characters and contain atleast an uppercase, a lowercase, a number or a special character
 *       409:
 *         description: email already exists. Try a new email.
 */
router.post("/signup", signup);

/**
 * @swagger
 * /api/v1/auth/login:
 *   post:
 *     summary: Logs in a user
 *     description: Logs in a user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: The user's email
 *                 example: johndoe4@gmail.com
 *               password:
 *                 type: string
 *                 description: The user's password
 *                 example: ghhggGHHG66?'
 *     responses:
 *       201:
 *         description: User logged in successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: The success message
 *                   example: login successful
 *                 accessToken:
 *                   type: string
 *                   description: random string generated using jwt
 *                   example: ukjjfhjksjhuhnjhebghng
 *                 refreshToken:
 *                   type: string
 *                   description: random string generated using jwt
 *                   example: ukjjfhjksjhuhnjhebghng
 *                 user:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       description: auto database generated id
 *                       example: 3456545tf67877jh
 *                     name:
 *                       type: string
 *                       description: The name of the user
 *                       example: John Doe
 *                     email:
 *                       type: string
 *                       description: Email of the user
 *                       example: johndoe4@gmail.com
 *                     picture:
 *                       type: string
 *                       description: Profile picture of the user
 *                       example: hhtps://picture.com
 *       400:
 *         description: Please fill all fields || invalid email
 *       404:
 *         description: User with this email could not be found.
 *       401:
 *         description: wrong password.
 *       500:
 *         description: Internal server error
 */

router.post("/login", login);

router.post("/logout", logout);

/**
 * @swagger
 * /api/v1/auth/token:
 *   post:
 *     summary: Endpoint for refreshing the access token
 *     description: Endpoint for refreshing the access token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 description: the refresh token
 *                 example: yuiiuyyjkjhu8iuiopoiu89i
 *     responses:
 *       200:
 *         description: access token refreshed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: success message
 *                   example: success
 *                 accessToken:
 *                   type: string
 *                   description: the access token
 *                   example: yuiiuyyjkjhu8iuiopoiu89i
 *                 user:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                       description: Name of the user
 *                       example: John Doe
 *                     email:
 *                       type: string
 *                       description: Email of the user
 *                       example: John Doe
 *                     _id:
 *                       type: string
 *                       description: auto  database generated ID
 *                       example: 2345trg545678735654hg
 *                     picture:
 *                       type: string
 *                       description: Profile picture of the user
 *                       example: https://picture.com
 *       401:
 *         description: User not authorized.
 *
 *
 */
router.post("/token", refreshAccessToken);

/**
 * @swagger
 * /api/v1/auth/send-reset-email:
 *   post:
 *     summary: Endpoints for sending password reset emails
 *     description: Endpoints for sending password reset emails
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: Email of the user
 *                 example: johndoe4@gmail.com
 *     responses:
 *       200:
 *         description: Reset email sent
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Success message
 *                   example: Password reset email sent successfuly
 *       400:
 *         description: Email not provided.
 *       404:
 *         description: User does not exist.
 *
 */
router.post("/send-reset-email", sendResetPasswordEmail);

/**
 * @swagger
 * /api/v1/auth/validate-reset-code:
 *   post:
 *     summary: End point for validating reset code sent in password reset email
 *     description: End point for validating reset code sent in password reset email
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type:
 *             properties:
 *               code:
 *                 type: number
 *                 description: Reset code sent to the email. Must be six digits.
 *                 example: 123456
 *               email:
 *                 type: string
 *                 string: Email of the user
 *                 example: johndoe4@gmail.com
 *     responses:
 *       200:
 *         description: Reset code is valid
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Success message
 *                   example: Reset code valid
 *       400:
 *         description: Email not provided. || Reset code not provided. || Invalid reset code
 *       410:
 *         description: Reset code no longer valid. Generate new one.
 *       404:
 *         description: Email does not exist.
 *
 */
router.post("/validate-reset-code", validateResetCode);

/**
 * @swagger
 * /api/v1/auth/reset-password:
 *   patch:
 *     summary: Endpoint for resetting the user's password
 *     description: Endpoint for resetting the user's password
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: User's email
 *                 example: johndoe4@gmail.com
 *               newPassword:
 *                 type: string
 *                 description: New user's password
 *                 example: QWWhhjjb334?;
 *     responses:
 *       200:
 *         description: Password reset successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Success message
 *                   example: Password reset successful
 *       400:
 *         description: Password not provided. || Email not provided. || password must be atleast 8 characters and contain atleast an uppercase, a lowercase, a number or a special character ||  New password cannot be same as old password.
 *       404:
 *         description: No user has the email provided.
 */
router.patch("/reset-password", resetPassword);

/**
 * @swagger
 * /api/v1/auth/google-sign-in:
 *   post:
 *     summary: Endpoint for signing in or signing up with google
 *     description: Endpoint for signing in or signing up with google
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               token:
 *                 type: string
 *                 description: Google token generated at the front end
 *                 example: uuuuijhgyujnmju8io98uikjh
 *     responses:
 *       201:
 *         description: login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Success message
 *                   example: login successful
 *                 accessToken:
 *                   type: string
 *                   description: The generated access token (the string is longer than is shown in the example)
 *                   example: hjklkjhyuiki8u8iokjiolkjkj
 *                 refreshToken:
 *                   type: string
 *                   description: The generated access token (the string is longer than is shown in the example)
 *                   example: hjklkjhyuiki8u8iokjiolkjkj
 *                 user:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       description: auto database generated ID
 *                       example: 6738uhr76g7898787654r
 *                     name:
 *                       type: string
 *                       description: Name of the user
 *                       example: John Doe
 *                     email:
 *                       type: string
 *                       description: Email of user
 *                       example: johndoe4@gmail.com
 *                     picture:
 *                       type: string
 *                       description: link to the user's profile picture
 *                       example: http://picture.com
 *       400:
 *         description: Token not provided.
 */
router.post("/google-sign-in", googleSignIn);

module.exports = router;
