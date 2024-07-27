// require("dotenv").config();

const nodemailer = require("nodemailer");
const dotenv = require("dotenv");

dotenv.config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASSWORD
  }
});

const sendEmail = async emailOption => {
  const { to, subject, type, name, code } = emailOption;

  const content = `
             ${
               type === "sign up"
                 ? `<p>Hello ${name},</p>
                    <p>Thank you choosing Tracker. You are most welcome. Get ready to up your productivity.</p>`
                 : `
             <p>Hello ${name},</p>
             <p>Copy this ${code} to be used to reset your password. It will expire in 2 hours.</p>
             `
             }
  `;
  const html = `
    <html>
    <head>
      <style>
        .header {
          background-color: #4CAF50;
          color: white;
          padding: 10px;
          text-align: center;
        }
        .content {
          margin: 20px;
          font-family: Arial, sans-serif;
          color: #333;
        }
        
        a.button {
          background-color: #4CAF50;
          color: white;
          padding: 10px 20px;
          text-align: center;
          text-decoration: none;
          display: inline-block;
          margin-top: 20px;
          border-radius: 5px;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Welcome to Our Service</h1>
      </div>
      <div class="content">
        ${content}
      </div>
    </body>
  </html>    
    `;
  const mailOptions = {
    from: `Trackr <${process.env.EMAIL}>`,
    to: to,
    subject: subject,
    html: html
  };

  try {
    // Use async/await with transporter.sendMail to handle errors
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent: " + info.response);
  } catch (error) {
    console.error("Error sending email:", error);
    throw new Error("Error sending email");
  }
};

module.exports = { sendEmail };

// sendEmail({
//   to: "emmanuelibekwe7@gmail.com",
//   subject: "Signup succeeded",
//   html: "<h1>You successfully signed up!</h1>"
// });
