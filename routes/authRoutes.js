// const express = require('express')
import express from 'express'
import {
  signup,
  login,
  refresh,
  logout,
} from '../src/modules/auth/auth.controller.js'
import validate from '../src/shared/http/validate.js'
import authSchemas from '../src/modules/auth/auth.schemas.js'

const router = express.Router()

router.route('/signup').post(validate(authSchemas.signup), signup)
router.route('/login').post(validate(authSchemas.login), login)
router.route('/refresh').get(validate(authSchemas.refresh), refresh)
router.route('/logout').post(validate(authSchemas.logout), logout)

const authRoutes = router
export default authRoutes
