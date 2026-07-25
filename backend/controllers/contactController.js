const Contact = require('../models/Contact');
const { sendEmail } = require('../utils/email');

exports.submitContact = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;
    if (!name || !email || !message) return res.status(400).json({ message: 'Please fill all required fields' });

    await Contact.create({ name, email, subject, message });

    sendEmail({
      to: process.env.ADMIN_EMAIL,
      subject: `Contact Form: ${subject || 'General Inquiry'}`,
      html: `<p><b>From:</b> ${name} (${email})</p><p><b>Message:</b><br/>${message}</p>`,
    });
    sendEmail({
      to: email,
      subject: 'We received your message - MarketZone',
      html: `<p>Hi ${name}, thanks for reaching out. Our team will get back to you shortly.</p>`,
    });

    res.status(201).json({ message: 'Message sent successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getMessages = async (req, res) => {
  const messages = await Contact.find().sort('-createdAt');
  res.json(messages);
};

exports.markRead = async (req, res) => {
  await Contact.findByIdAndUpdate(req.params.id, { isRead: true });
  res.json({ message: 'Marked as read' });
};
