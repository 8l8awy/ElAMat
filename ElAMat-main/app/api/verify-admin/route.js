export default function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { inputCode } = req.body;
  
  // هنا بنقارن بالمتغيرات اللي إنت ضفتها في الصورة التانية
  const isValid = 
    inputCode === process.env.ADMIN_CODE_1 || 
    inputCode === process.env.ADMIN_CODE_2;

  if (isValid) {
    return res.status(200).json({ authorized: true });
  }

  return res.status(401).json({ authorized: false });
}