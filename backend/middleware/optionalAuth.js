const jwt = require("jsonwebtoken");

// В отличие от authMiddleware, не отклоняет запрос при отсутствии токена —
// используется на публичных маршрутах (список статей), где неавторизованный
// пользователь должен видеть только опубликованный контент.
module.exports = (req, res, next) => {

  const authHeader = req.headers.authorization;

  if (!authHeader) {
    req.user = null;
    return next();
  }

  const token = authHeader.split(" ")[1];

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    req.user = null;
  }

  next();

};
