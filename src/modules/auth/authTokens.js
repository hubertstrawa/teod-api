import jwt from 'jsonwebtoken'

const ACCESS_TOKEN_TTL = '15m'
const REFRESH_TOKEN_TTL = '7d'
const REFRESH_COOKIE_NAME = 'jwt'
const REFRESH_COOKIE_MAX_AGE = 7 * 24 * 60 * 60 * 1000

const refreshCookieOptions = {
  httpOnly: true,
  secure: true,
  sameSite: 'None',
  maxAge: REFRESH_COOKIE_MAX_AGE,
}

const createAccessToken = (user) =>
  jwt.sign(
    {
      UserInfo: {
        email: user.email,
        id: user._id,
        playerName: user.playerName,
      },
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: ACCESS_TOKEN_TTL }
  )

const createRefreshToken = (email) =>
  jwt.sign({ email }, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: REFRESH_TOKEN_TTL,
  })

const verifyRefreshToken = (refreshToken) =>
  jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET)

const setRefreshTokenCookie = (res, refreshToken) => {
  res.cookie(REFRESH_COOKIE_NAME, refreshToken, refreshCookieOptions)
}

const clearRefreshTokenCookie = (res) => {
  res.clearCookie(REFRESH_COOKIE_NAME, {
    httpOnly: refreshCookieOptions.httpOnly,
    secure: refreshCookieOptions.secure,
    sameSite: refreshCookieOptions.sameSite,
  })
}

const readRefreshTokenFromRequest = (req) => req.cookies?.[REFRESH_COOKIE_NAME]

const authTokens = {
  REFRESH_COOKIE_NAME,
  refreshCookieOptions,
  createAccessToken,
  createRefreshToken,
  verifyRefreshToken,
  setRefreshTokenCookie,
  clearRefreshTokenCookie,
  readRefreshTokenFromRequest,
}

export default authTokens
