const express = require('express')
const router = express.Router()
const db = require('../models/db')
const nodemailer = require('nodemailer')
const config = require('../config.json')

router.get('/', (req, res, next) => {
  const dbListSkills = db.getState().skills || []
  const dbProducts = db.getState().products || []
  res.render('pages/index', {
    title: 'Main page',
    dbListSkills,
    dbProducts,
    msgemail: req.flash('info'),
  })
})

router.post('/', (req, res, next) => {
  if (!req.body.name || !req.body.email || !req.body.message) {
    req.flash('info', 'Нужно заполнить все поля')
    res.redirect('/')
  }

  const transporter = nodemailer.createTransport(config.mail.smtp)
  const mailOptions = {
    from: `"${req.body.name}" <${req.body.email}>`,
    to: config.mail.smtp.auth.user,
    subject: config.mail.subject,
    text:
      req.body.message.trim().slice(0, 500) + `\n почта: <${req.body.email}>`,
  }
  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      return res.json({
        msg: `При отправке письма произошла ошибка!: ${error}`,
        status: 'Error',
      })
    }
  })
  req.flash('info', 'Письмо отправлено')
  res.redirect('/')
})

module.exports = router
