const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const mongoose = require('mongoose');
const usersRouter = require('./routes/users');
const productsRouter = require('./routes/products');
const app = express();
const serverPort = 3001;

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());

app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

const connectionString = "mongodb+srv://username:costmanager123@costmanager.fhvyz.mongodb.net/costmanager"
mongoose.connect(connectionString);
mongoose.Promise = global.Promise;
const costManagerDataBase = mongoose.connection;

//log db connection result
costManagerDataBase.on('error', (error) => {
  console.log(error);
});
costManagerDataBase.once('open', () => {
  console.log('Connected successfuly');
});

app.use('/users', usersRouter);
app.use('/products',productsRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});
module.exports = app;
app.listen(serverPort);