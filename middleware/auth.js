const jwt = require('jsonwebtoken');

function verifyToken(req, res, next) {
  const token = req.headers['authorization'];
  if (!token) {
    return res.status(403).json({ error: 'Token non fourni' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.agentId = decoded.id;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Token invalide' });
  }
}

module.exports = { verifyToken };
