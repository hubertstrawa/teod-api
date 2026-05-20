import asyncHandler from '../../shared/http/asyncHandler.js'
import authService from './auth.service.js'
import authTokens from './authTokens.js'

export const createAuthController = (service = authService) => {
  const signup = asyncHandler(async (req, res) => {
    const response = await service.signup(req.body)
    return res.status(200).json(response)
  })

  const login = asyncHandler(async (req, res) => {
    const { refreshToken, ...response } = await service.login(req.body)
    authTokens.setRefreshTokenCookie(res, refreshToken)
    return res.json(response)
  })

  const refresh = asyncHandler(async (req, res) => {
    const refreshToken = authTokens.readRefreshTokenFromRequest(req)
    const response = await service.refresh(refreshToken)
    return res.json(response)
  })

  const logout = asyncHandler(async (req, res) => {
    const refreshToken = authTokens.readRefreshTokenFromRequest(req)
    const response = service.logout(refreshToken)

    if (response.statusCode === 204) {
      return res.sendStatus(204)
    }

    authTokens.clearRefreshTokenCookie(res)
    return res.json({ message: response.message })
  })

  return { signup, login, refresh, logout }
}

const authController = createAuthController()

export const { signup, login, refresh, logout } = authController
export default authController
