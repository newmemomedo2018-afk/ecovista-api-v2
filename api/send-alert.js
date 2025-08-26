export default function handler(req, res) {
  // التحقق من نوع الطلب
  if (req.method !== 'POST') {
    return res.status(405).json({
      error: 'Method not allowed. Use POST only.'
    });
  }

  // استخراج البيانات من الطلب
  const { type, error, timestamp, app_version, user_count } = req.body;

  // التحقق من وجود البيانات المطلوبة
  if (!type || !error) {
    return res.status(400).json({
      error: 'Missing required fields: type and error'
    });
  }

  // رد نجاح مؤقت
  return res.status(200).json({
    success: true,
    message: 'Alert endpoint is working',
    received_data: {
      type,
      error,
      timestamp,
      app_version,
      user_count
    },
    note: 'Email functionality will be added next'
  });
}
