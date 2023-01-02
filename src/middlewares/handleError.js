const handleError = (app) => {
  app.use((req, res, next) => {
    const err = new Error('Not found');
    err.status = 404;
    next(err);
  });

  app.use((err, req, res, next) => {
    const error = app.get('env') === 'development' ? err : {};
    const status = err.status || 500;
    return res.status(status).json({
      error: error.message,
      stack: error.stack,
    });
  });
};

module.exports = handleError;
