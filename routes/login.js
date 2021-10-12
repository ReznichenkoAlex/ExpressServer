const express = require('express')
const router = express.Router()
const db = require('../models/db')

router.get('/', (req, res, next) => {
  res.render('pages/login', {
    title: 'SigIn page',
    msglogin: req.flash('info'),
  })
})

router.post('/', (req, res, next) => {
  const { email, password } = req.body
  const admin = db.getState().admin
  if (admin.login === email && admin.password === password) {
    req.session.isAdmin = true
    req.flash('info', 'Авторизация прошла успешно')
    res.redirect('/admin')
  } else {
    req.flash('info', 'Данные не совпадают')
    res.redirect('/login')
  }
})

module.exports = router
