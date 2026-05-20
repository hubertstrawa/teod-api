import bcrypt from 'bcrypt'
import mongoose from 'mongoose'
import ApiError from '../../shared/errors/ApiError.js'
import authRepository from './auth.repository.js'
import authTokens from './authTokens.js'

const SIGNUP_SUCCESS_MESSAGE =
  'Konto założone pomyślnie! Możesz się teraz zalogować'

const WELCOME_NOTIFICATION = {
  type: 'message',
  sender: '63e959b8588eac38851bd2ea',
  data: 'Witaj w Teod! Gdybyś znalazł/a bugi, daj proszę znać: hubertstrawa@gmail.com',
  isRead: false,
}

const INITIAL_SPELLS = [
  {
    name: 'Ogniste uderzenie',
    spellType: 'fire',
    spellLevel: 1,
    power: 25,
    manaCost: 10,
    minIntelligence: 10,
  },
]

export const createAuthService = ({
  repository = authRepository,
  tokenProvider = authTokens,
  hashProvider = bcrypt,
  sessionProvider = mongoose,
} = {}) => {
  const signup = async ({ email, playerName, password, race, avatar }) => {
    const existingPlayer = await repository.findByEmailOrPlayerName({
      email,
      playerName,
    })

    if (existingPlayer) {
      throw ApiError.badRequest('Gracz z takim e-mailem lub nazwą juz istnieje')
    }

    const hashedPassword = await hashProvider.hash(password, 12)
    const session = await sessionProvider.startSession()

    try {
      await session.withTransaction(async () => {
        const player = await repository.createPlayer(
          {
            playerName,
            password: hashedPassword,
            email,
            race,
            avatar,
            spells: INITIAL_SPELLS,
          },
          session
        )

        await repository.createSignupLogs(player._id, session)

        player.notifications = [WELCOME_NOTIFICATION]
        player.friends = {
          pending: [],
          list: [],
        }

        await repository.savePlayer(player, session)
      })
    } finally {
      await session.endSession()
    }

    return {
      message: SIGNUP_SUCCESS_MESSAGE,
    }
  }

  const login = async ({ email, password }) => {
    const user = await repository.findByEmail(email)

    if (!user) {
      throw ApiError.badRequest('Nie ma takiego gracza')
    }

    const passwordMatch = await hashProvider.compare(password, user.password)

    if (!passwordMatch) {
      throw ApiError.unauthorized('Niepoprawne hasło')
    }

    const accessToken = tokenProvider.createAccessToken(user)
    const refreshToken = tokenProvider.createRefreshToken(user.email)

    return {
      accessToken,
      refreshToken,
      isNewPlayer: user.tutorial === 0,
    }
  }

  const refresh = async (refreshToken) => {
    if (!refreshToken) {
      throw ApiError.unauthorized('Unauthorized (refresh token)')
    }

    let decoded
    try {
      decoded = tokenProvider.verifyRefreshToken(refreshToken)
    } catch (error) {
      throw ApiError.unauthorized('Forbidden (refresh token)')
    }

    const foundUser = await repository.findByEmail(decoded.email)
    if (!foundUser) {
      throw ApiError.unauthorized('Unauthorized (refresh token 2)')
    }

    return {
      accessToken: tokenProvider.createAccessToken(foundUser),
    }
  }

  const logout = (refreshToken) => {
    if (!refreshToken) {
      return { statusCode: 204 }
    }

    return { statusCode: 200, message: 'Cookie cleared' }
  }

  return {
    signup,
    login,
    refresh,
    logout,
  }
}

const authService = createAuthService()
export default authService
