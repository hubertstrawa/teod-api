import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import Player from '../models/Player.js'
import Tasklog from '../models/Tasklog.js'
import Battlelog from '../models/Battlelog.js'
import Questlog from '../models/Questlog.js'

const signup = async (req, res) => {
  try {
    const { email, playerName, password, race, avatar } = req.body

    if (!playerName || !password || !email) {
      return res.status(400).json({ message: 'Wypełnij wszystkie pola' })
    }

    const findPlayer = await Player.findOne({
      $or: [{ email }, { playerName }],
    })
    if (findPlayer) {
      return res
        .status(400)
        .json({ message: 'Gracz z takim e-mailem lub nazwą juz istnieje' })
    }

    const hashedPassword = await bcrypt.hash(password, 12)

    const playerObject = {
      playerName,
      password: hashedPassword,
      email,
      race,
      avatar,
      spells: [
        {
          name: 'Ogniste uderzenie',
          spellType: 'fire',
          spellLevel: 1,
          power: 25,
          manaCost: 10,
          minIntelligence: 10,
        },
      ],
    }

    const player = await Player.create(playerObject)

    await Promise.all([
      Questlog.create({ playerId: player._id }),
      Battlelog.create({ playerId: player._id }),
      Tasklog.create({ playerId: player._id }),
    ])

    player.notifications = [
      {
        type: 'message',
        sender: '63e959b8588eac38851bd2ea',
        data: 'Witaj w Teod! Gdybyś znalazł/a bugi, daj proszę znać: hubertstrawa@gmail.com',
        isRead: false,
      },
    ]
    player.friends = {
      pending: [],
      list: [],
    }

    await player.save()

    return res.status(200).json({
      message: 'Konto założone pomyślnie! Możesz się teraz zalogować',
    })
  } catch (err) {
    console.error(err)
    return res.json({
      status: 400,
      success: false,
    })
  }
}

const login = async (req, res) => {
  try {
    const { email, password } = req.body
    if (!email || !password) {
      return res.status(400).json({ message: 'Podaj email i hasło' })
    }

    // const query = await pool.query('SELECT * FROM player WHERE email=$1', [
    //   email,
    // ])
    const newUser = await Player.findOne({ email })

    if (!newUser) {
      return res.status(400).json({ message: 'Nie ma takiego gracza' })
    }

    const passwordMatch = await bcrypt.compare(password, newUser.password)

    if (!passwordMatch) {
      return res.status(401).json({ message: 'Niepoprawne hasło' })
    }

    const accessToken = jwt.sign(
      {
        UserInfo: {
          email: newUser.email,
          id: newUser._id,
          playerName: newUser.playerName,
        },
      },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: '15m' }
    )

    const refreshToken = jwt.sign(
      { email: newUser.email },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: '7d' }
    )

    // Create secure cookie with refresh token
    res.cookie('jwt', refreshToken, {
      httpOnly: true, //accessible only by web server
      secure: true, //https
      sameSite: 'None', //cross-site cookie
      maxAge: 7 * 24 * 60 * 60 * 1000, //cookie expiry: set to match rT
    })

    res.json({ accessToken, isNewPlayer: newUser.tutorial === 0 })
  } catch (err) {
    console.log('err', err)
    return res.json({
      status: 400,
      success: false,
    })
  }
}

const refresh = async (req, res) => {
  try {
    const cookies = req.cookies

    if (!cookies?.jwt)
      return res.status(401).json({ message: 'Unauthorized (refresh token)' })

    const refreshToken = cookies.jwt

    jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET,
      async (err, decoded) => {
        if (err) {
          return res.status(401).json({ message: 'Forbidden (refresh token)' })
        }

        const foundUser = await Player.findOne({ email: decoded.email })

        if (!foundUser) {
          return res
            .status(401)
            .json({ message: 'Unauthorized (refresh token 2)' })
        }

        const accessToken = jwt.sign(
          {
            UserInfo: {
              email: foundUser.email,
              id: foundUser._id,
              playerName: foundUser.playerName,
            },
          },
          process.env.ACCESS_TOKEN_SECRET,
          { expiresIn: '15m' }
        )

        res.json({ accessToken })
      }
    )
  } catch (error) {
    console.log('error,', error)
    return res.json({
      status: 400,
      success: false,
    })
  }
}

const logout = (req, res) => {
  const cookies = req.cookies
  if (!cookies?.jwt) return res.sendStatus(204) //No content
  res.clearCookie('jwt', { httpOnly: true, sameSite: 'None', secure: true })
  res.json({ message: 'Cookie cleared' })
}

// module.exports = {
//   signup,
//   login,
//   refresh,
//   logout,
// }
export { signup, login, refresh, logout }
