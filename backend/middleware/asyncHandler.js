// Оборачивает асинхронный контроллер: если промис отклоняется,
// ошибка передаётся в next(err) и попадает в централизованный errorHandler,
// а не приводит к падению процесса (unhandled rejection).
module.exports = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};
