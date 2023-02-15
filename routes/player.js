const express = require('express')
const router = express.Router()

// middleware that is specific to this router
router.use((req, res, next) => {
  console.log('Time: ', Date.now())
  next()
})
// define the home page route
router.get('/', (req, res) => {
  res.status(200).json({ success: 'MAIN PLAYER' })
})
// define the about route
router.get('/me', (req, res) => {
  res.status(200).json({ success: 'ME PLAYER' })
})

module.exports = router
