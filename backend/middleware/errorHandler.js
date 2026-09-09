// Единый обработчик ошибок. Регистрируется последним в цепочке middleware
// (см. server.js), поэтому получает любую ошибку, переданную через next(err)
// или выброшенную в асинхронном контроллере (см. middleware/asyncHandler.js).
module.exports = (err, req, res, next) => {

  console.error(err);

  // Ошибка валидации, выброшенная контроллером вручную
  if (err.status === 400 || err.name === "ValidationError") {
    return res.status(400).json({
      message: err.message || "Bad Request"
    });
  }

  if (err.status === 401) {
    return res.status(401).json({
      message: err.message || "Unauthorized"
    });
  }

  if (err.status === 403) {
    return res.status(403).json({
      message: err.message || "Forbidden"
    });
  }

  if (err.status === 404) {
    return res.status(404).json({
      message: err.message || "Not Found"
    });
  }

  // Нарушение уникального ограничения в PostgreSQL (например,
  // повторяющийся email или дублирующийся MAC/IP-адрес)
  if (err.code === "23505" || err.status === 409) {
    return res.status(409).json({
      message: err.message || "Conflict: запись уже существует"
    });
  }

  res.status(500).json({
    message: "Internal Server Error"
  });

};
