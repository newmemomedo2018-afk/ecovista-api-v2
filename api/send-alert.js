// api/send-alert.js
export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  return res.status(200).json({ 
    success: true, 
    message: 'Alert endpoint working',
    data: req.body
  });
}
