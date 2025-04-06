import jwt from 'jsonwebtoken';

const protect = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer')) {
    const token = authHeader.split(' ')[1];

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded.userId; // Getting User ID
      next();
    } catch (err) {
      return res.status(401).json({ msg: 'Invalid Token' });
    }
  } else {
    res.status(401).json({ msg: 'No Token Provided' });
  }
};
export default protect;
