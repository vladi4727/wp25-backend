// middlewares/errorHandler.js
module.exports = function (err, req, res, next) {
  console.error(err); // log it (you can improve with winston/morgan etc)

  const statusCode = err.status || 500;

  res.status(statusCode).json({
    status: "error",
    message: err.message || "Something went wrong",
  });
};
