const jwt = require('jsonwebtoken')

const verifyJWT = (req, res, next) => {
  const authHeader = req.headers.authorization || req.headers.Authorization

  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized (from verifyJWT.js)' })
  }

  const token = authHeader.split(' ')[1]

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) return res.status(401).json({ message: 'Forbidden' })
    req.email = decoded.UserInfo.email
    req.id = decoded.UserInfo.id
    req.playerName = decoded.UserInfo.playerName
    next()
  })
}

module.exports = verifyJWT
