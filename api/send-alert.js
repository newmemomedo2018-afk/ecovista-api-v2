// Updated for email alerts
  const nodemailer = require('nodemailer');

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { type, error, timestamp, app_version, user_count } = req.body;
    
    if (!type || !error) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const transporter = nodemailer.createTransporter({
      service: 'gmail',
      auth: {
        user: process.env.ALERT_EMAIL,
        pass: process.env.ALERT_PASSWORD
      }
    });

    const mailOptions = {
      from: process.env.ALERT_EMAIL,
      to: process.env.ALERT_EMAIL,
      subject: `🚨 EcoVista Alert - ${type}`,
      html: `
        <h2>⚠️ EcoVista API Alert</h2>
        <p><strong>Type:</strong> ${type}</p>
        <p><strong>Error:</strong> ${error}</p>
        <p><strong>Time:</strong> ${timestamp ? new Date(timestamp * 1000).toLocaleString() : 'Unknown'}</p>
        <p><strong>App Version:</strong> ${app_version || 'Unknown'}</p>
        <p><strong>User Count:</strong> ${user_count || 'Unknown'}</p>
        <hr>
        <p><strong>Action Required:</strong> Check Dumpling AI dashboard</p>
      `
    };

    await transporter.sendMail(mailOptions);
    
    res.status(200).json({ 
      success: true, 
      message: 'Alert sent successfully'
    });

  } catch (error) {
    console.error('Email error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to send email',
      details: error.message
    });
  }
}
