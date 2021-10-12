const express = require('express')
const router = express.Router()
const db = require('../models/db')
const formidable = require('formidable')
const path = require('path')
const fs = require('fs')
const util = require('util')
const shortid = require('shortid')

const rename = util.promisify(fs.rename)
const mkdir = util.promisify(fs.mkdir)
const unlink = util.promisify(fs.unlink)
const access = util.promisify(fs.access)

const isAdmin = (req, res, next) => {
  if (req.session.isAdmin) {
    return next()
  }
  res.redirect('/')
}

router.get('/', isAdmin, (req, res, next) => {
  const dbListSkills = db.getState().skills || []
  res.render('pages/admin', {
    title: 'Admin page',
    dbListSkills,
    msgskill: req.flash('info'),
    msgfile: req.flash('file'),
  })
})

router.post('/skills', (req, res, next) => {
  const listSkillsNumber = []
  for (const key in req.body) {
    listSkillsNumber.push(req.body[key])
  }
  for (let i = 0; i < listSkillsNumber.length; i++) {
    const dbListSkills = db.getState().skills
    dbListSkills[i].number = listSkillsNumber[i]
    db.write()
  }
  req.flash('info', 'Скилы обновлены')
  res.redirect('/admin')
})

router.post('/upload', async (req, res, next) => {
  const form = new formidable.IncomingForm()
  const upload = path.join('./public', 'assets', 'img', 'products')

  if (await !access(upload, fs.constants.R_OK || fs.constants.W_OK)) {
    await mkdir(upload)
  }

  form.uploadDir = path.join(process.cwd(), upload)

  form.parse(req, async (err, fields, files) => {
    if (err) {
      return next(err)
    }
    const valid = validation(fields, files)
    if (valid.err) {
      unlink(files.photo.path)
      req.flash('file', valid.status)
      return res.redirect('/admin')
    }
    const fileName = path.join(upload, shortid.generate() + files.photo.name)
    await rename(files.photo.path, fileName)

    const dir = fileName.substr(fileName.indexOf('\\'))

    db.get('products')
      .push({
        src: dir,
        name: fields.name,
        price: fields.price,
      })
      .write()
    req.flash('file', 'Картинка успешно загружена')
    res.redirect('/admin')
  })
})

const validation = (fields, files) => {
  if (files.photo.name === '' || files.photo.size === 0) {
    return { status: 'Не загружена картинка', err: true }
  }
  if (!fields.name) {
    return { status: 'Не указано название товара', err: true }
  }
  if (!fields.price) {
    return { status: 'Не указана цена товара', err: true }
  }
  return { status: 'Ok', err: false }
}

module.exports = router
