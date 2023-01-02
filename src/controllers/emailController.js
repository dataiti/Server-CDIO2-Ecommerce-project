const User = require("../models/userModel");
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");

const transport = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.ADMIN_EMAIL,
    pass: process.env.ADMIN_EMAIL_PASSWORD,
  },
});

const sendChangePasswordEmail = async (req, res, next) => {
  const { email, phone, name, title, text, code } = req.message;
  try {
    if (!email && phone) {
      next();
    } else if (!email && !phone) {
      return res.status(400).json("No email provided");
    } else {
      await transport.sendMail({
        from: process.env.ADMIN_EMAIL,
        to: email,
        subject: `Captone 1 Ecommerce MERN stack ${title}`,
        html: `<div>
                <h1>${title}</h1>
                <p>Hi ${name},</p>
                <p>Thank you for choosing GoodDeal.</p>
                <p>${text}</p>
                ${
                  code
                    ? `<button style="background-color:#0d6efd; border:none; border-radius:4px; padding:0;">
                        <a 
                            style="color:#fff; text-decoration:none; font-size:16px; padding: 16px 32px; display: inline-block;"
                            href='http://localhost:${process.env.PORT_CLIENT}/change-password/${code}'
                        >
                        Change password!
                        </a>
                    </button>
                    `
                    : ""
                }
            </div>`,
      });
      console.log("send email successfully");
    }
  } catch (error) {
    console.log("send email error: ", error);
  }
};

const verifyEmail = async (req, res, next) => {
  const { emailCode } = req.params;
  try {
    const user = await User.findByIdAndUpdate(
      { email_code: emailCode },
      { $set: { isEmailActive: true }, $unset: { email_code: "" } }
    ).exec();
    if (!user) {
      throw new Error("User not found");
    }
    return res.status(200).json({
      success: "Cofirm email successfully",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  sendChangePasswordEmail,
  verifyEmail,
};
