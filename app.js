const createError = require('http-errors')
const express = require('express')
const path = require('path')
const logger = require('morgan')
const flash = require('connect-flash')
const cookie = require('cookie-parser')
const session = require('express-session')
require('dotenv').config()

const mainRouter = require('./routes/')

const app = express()

// view engine setup
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'pug')

process.env.NODE_ENV === 'development'
  ? app.use(logger('dev'))
  : app.use(logger('short'))

app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookie())
app.use(
  session({
    secret: 'loft',
    cookie: { maxAge: 600000 },
  })
)
app.use(flash())

app.use(express.static(path.join(__dirname, 'public')))

app.use('/', mainRouter)

// catch 404 and forward to error handler
app.use((req, __, next) => {
  next(
    createError(404, `Ой, извините, но по пути ${req.url} ничего не найдено!`)
  )
})

// error handler
app.use((err, req, res, next) => {
  // set locals, only providing error in development
  res.locals.message = err.message
  res.locals.error = req.app.get('env') === 'development' ? err : {}

  // render the error page
  res.status(err.status || 500)
  res.render('error')
})

app.listen(3000, () => {})
