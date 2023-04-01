const User = require("../models/user");
const sendEmail = require("../utils/sendEmail");

module.exports.contactUs = async (req, res) => {
  try {
    const { subject, message } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(400).send({ error: "User not found, please signup." });
    }

    if (!subject || !message) {
      return res.status(400).send({ error: "Missing required fields." });
    }

    const send_to = process.env.EMAIL_USER;
    const sent_from = process.env.EMAIL_USER;
    const reply_to = user.email;
    try {
      await sendEmail(subject, message, send_to, sent_from, reply_to);
      res.status(200).json({ success: true, message: "Email Sent" });
    } catch (error) {
      res.status(500).send({ error: "Email not sent, please try again" });
    }
  } catch (err) {
    res.status(400).send({ error: "Cannot create message for contact." });
  }
};
