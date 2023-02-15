const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const db = require('../db')
const pool = require('../db2')
const Item = require('../models/Item')
const mongoose = require('mongoose')
const Player = require('../models/Player')

const login = async (req, res) => {
  try {
    const { email, password } = req.body
    console.log('REQ BODY', req.body)
    if (!email || !password) {
      return res.status(400).json({ message: 'Podaj email i hasło' })
    }

    // const query = await pool.query('SELECT * FROM player WHERE email=$1', [
    //   email,
    // ])
    const newUser = await Player.findOne({ email })

    if (!newUser) {
      return res.status(400).json({ message: 'Nie ma takiego usera' })
    }

    console.log('NEWUSER', newUser)

    const passwordMatch = await bcrypt.compare(password, newUser.password)

    if (!passwordMatch) {
      return res.status(401).json({ message: 'Niepoprawne hasło' })
    }

    const accessToken = jwt.sign(
      {
        UserInfo: {
          email: newUser.email,
          id: newUser._id,
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

    res.json({ accessToken })
  } catch (err) {
    console.log('err', err)
    return res.json({
      status: 400,
      success: false,
    })
  }
}

// const login = async (req, res) => {
//   try {
//     const { email, password } = req.body
//     console.log('REQ BODY', req.body)
//     if (!email || !password) {
//       return res.status(400).json({ message: 'Podaj email i hasło' })
//     }

//     const query = await pool.query('SELECT * FROM player WHERE email=$1', [
//       email,
//     ])
//     const newUser = query.rows[0]

//     if (!newUser) {
//       return res.status(400).json({ message: 'Nie ma takiego usera' })
//     }

//     console.log('NEWUSER', newUser)

//     const passwordMatch = await bcrypt.compare(password, newUser.password)

//     if (!passwordMatch) {
//       return res.status(401).json({ message: 'Niepoprawne hasło' })
//     }

//     const accessToken = jwt.sign(
//       {
//         UserInfo: {
//           email: newUser.email,
//           id: newUser.id,
//         },
//       },
//       process.env.ACCESS_TOKEN_SECRET,
//       { expiresIn: '15m' }
//     )

//     const refreshToken = jwt.sign(
//       { email: newUser.email },
//       process.env.REFRESH_TOKEN_SECRET,
//       { expiresIn: '7d' }
//     )

//     // Create secure cookie with refresh token
//     res.cookie('jwt', refreshToken, {
//       httpOnly: true, //accessible only by web server
//       secure: true, //https
//       sameSite: 'None', //cross-site cookie
//       maxAge: 7 * 24 * 60 * 60 * 1000, //cookie expiry: set to match rT
//     })

//     res.json({ accessToken })
//   } catch (err) {
//     console.log('err', err)
//     return res.json({
//       status: 400,
//       success: false,
//     })
//   }
// }

const refresh = async (req, res) => {
  try {
    const cookies = req.cookies
    console.log('req', req)

    console.log('req.cookies', req.cookies)
    console.log(cookies)
    if (!cookies?.jwt)
      return res.status(401).json({ message: 'Unauthorized (refresh token)' })

    const refreshToken = cookies.jwt

    jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET,
      async (err, decoded) => {
        if (err)
          return res.status(403).json({ message: 'Forbidden (refresh token)' })

        // sql = `SELECT * FROM players WHERE email=?`

        // const query = await pool.query('SELECT * FROM player WHERE email=$1', [
        //   decoded.email,
        // ])
        // const foundUser = query.rows[0]
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

const updateMe = async (req, res) => {
  try {
    // console.log('UPDATE REQ COOKIES', req.cookies)
    const email = req.email
    // console.log('======= REQ =======', req.body)
    // const data = Object.keys(req.body)
    //   .map((e, i) => {
    //     return `${e} = ${req.body[e]}${
    //       i === Object.keys(req.body).length - 1 ? '' : ','
    //     }`
    //   })
    //   .join(' ')

    // console.log('data', data)

    // // sql = `
    // // UPDATE players
    // // SET ${data}
    // // WHERE email = ?;`

    // const query = await pool.query(
    //   `UPDATE player SET ${data} WHERE email = $1;`,
    //   [email]
    // )

    await Player.updateOne({ email }, { ...req.body })

    return res.status(200).json({ data: 'User updated' })
  } catch (err) {
    console.log(err)
    return res.status(400).json({ message: 'Nie udalo sie zaktualizowac' })
  }
}

// app.use(verifyJWT)

const getMe = async (req, res) => {
  try {
    const email = req.email

    // const query = await pool.query('SELECT * FROM player WHERE email=$1', [
    //   email,
    // ])
    // const currentUser = query.rows[0]

    const currentUser = await Player.findOne({ email })
    if (!currentUser) {
      return res
        .status(400)
        .json({ message: 'Nie udało się pobrać info o current graczu' })
    }

    return res.status(200).json({ data: currentUser })
  } catch (err) {
    return res
      .status(400)
      .json({ message: 'Nie udało się pobrać info o current graczu' })
  }

  // sql = `SELECT * FROM players WHERE email=?`
  // db.get(sql, [email], async (err, row) => {
  //   if (!row || err) {
  //     return res
  //       .status(400)
  //       .json({ message: 'Nie udało się pobrać info o current graczu' })
  //   }

  //   return res.status(200).json({ data: row })
  // })
}

const getInventory = async (req, res) => {
  try {
    // const inv = await Player.findOne({ email: 'test@gmail.com' })

    const userId = req.id
    // const queryInventory = await pool.query(
    //   'SELECT * FROM inventory WHERE inv_id=$1',
    //   [userId]
    // )
    // console.log('USER ID', userId)
    // const inventory = queryInventory.rows[0]
    // const itemIds = [
    //   inventory.weapon ?? 0,
    //   inventory.armor ?? 0,
    //   inventory.bag ?? 0,
    //   inventory.boots ?? 0,
    //   inventory.all_items ?? 0,
    // ].join()
    // console.log('INVENTOERY', inventory)
    // const queryItems = await pool.query(
    //   `SELECT * FROM items WHERE item_id in (${itemIds});`,
    //   []
    // )
    const player = await Player.findOne({ _id: userId }).populate({
      path: 'inventory',
      populate: {
        path: 'all eq.amulet eq.helmet eq.bag eq.weapon eq.armor eq.shield eq.belt eq.boots',
      },
    })

    // console.log('xxxx', inv)
    return res
      .status(200)
      .json({ eq: player.inventory.eq, all: player.inventory.all })

    // console.log(
    //   '===== inventory =====',
    //   Array(inventory.all_items).map((el) => console.log('ellelel', el))
    // )

    // console.log('===== QUERY =====', queryItems.rows)
    // return res.status(200).json({
    //   eq: {
    //     amulet: null,
    //     helmet: null,
    //     bag: queryItems.rows.find((el) => el.item_id === inventory.bag) || null,
    //     weapon:
    //       queryItems.rows.find((el) => el.item_id === inventory.weapon) || null,
    //     armor:
    //       queryItems.rows.find((el) => el.item_id === inventory.armor) || null,
    //     shield: null,
    //     belt: null,
    //     boots:
    //       queryItems.rows.find((el) => el.item_id === inventory.boots) || null,
    //     ring: null,
    //   },
    //   all: inventory.all_items.map((el) => {
    //     const item = queryItems.rows.find((e) => el === e.item_id)
    //     return item
    //   }),
    // })
  } catch (err) {
    console.log(err)
    return res.status(400).json({ message: 'Nie udalo sie pobrac' })
  }
}

// const equipItem = async (req, res) => {
//   try {
//     const { item, currentItem, itemToRemove, allInventoryIds } = req.body

//     if (item) {
//       const player = await Player.findOne({ _id: req.id })
//       console.log('playerINVENTORY', player.inventory)
//       return res.status(200).json({ data: player.inventory })
//     }
//   } catch (err) {}
// }

const updateInventory = async (req, res) => {
  try {
    const { item, itemToConsume, itemToRemove, allInventoryIds } = req.body
    const player = await Player.findOne({ _id: req.id })
    console.log('playerINVENTORY', player.inventory)

    // equip
    if (item?._id) {
      const hasItemInInventory = player.inventory.all.includes(item._id)
      if (hasItemInInventory) {
        player.inventory.eq[item.type] = item._id
        player.inventory.all = allInventoryIds
        await player.save()
        return res.status(200).json({ data: player.inventory })
      }
    }

    // unequip
    if (itemToRemove?._id && !item?._id) {
      player.inventory.eq[itemToRemove.type] = null
      player.inventory.all = allInventoryIds
      await player.save()
      return res.status(200).json({ data: player.inventory })
    }

    // eat
    if (itemToConsume?._id) {
      player.healthPoints = 100
      player.manaPoints = 100
      player.energy = 100
      player.inventory.all = allInventoryIds
      player.save()
      return res.status(200).json({ data: player.inventory })
    }

    // equip item and leave current item in inventory
    // if (item?._id && currentItem?._id) {
    //   const hasItemInInventory = player.inventory.all.includes(item._id)
    //   const hasCurrentItem =
    //     player.inventory.eq[currentItem.type]._id == currentItem?._id
    //   if (hasItemInInventory && hasCurrentItem) {
    //     player.inventory.eq[item.type] = item._id
    //   }
    // }
    // console.log(
    //   '--------allInventoryIdsallInventoryIds-----------------,',
    //   allInventoryIds
    // )

    // if (currentItem?.item_id && item?.item_id) {
    //   const query = await pool.query(
    //     `UPDATE inventory SET ${item.type}=${item.item_id},all_items='{${allInventoryIds}}' WHERE inv_id=${req.id}`,
    //     []
    //   )
    //   console.log('query', query)
    //   return res.status(200).json({ data: 'Inventory updated' })
    // }

    // if (item?.item_id && !currentItem?.item_id) {
    //   const query = await pool.query(
    //     `UPDATE inventory SET ${item.type}=${item.item_id},all_items='{${allInventoryIds}}' WHERE inv_id=${req.id}`,
    //     []
    //   )
    //   return res.status(200).json({ data: 'HEREEE updated' })
    // }

    // if (
    //   allInventoryIds &&
    //   !item?.item_id &&
    //   !currentItem?.item_id &&
    //   !itemToRemove
    // ) {
    //   const query = await pool.query(
    //     `UPDATE inventory SET all_items='{${allInventoryIds}}' WHERE inv_id=${req.id}`,
    //     []
    //   )
    //   return res.status(200).json({ data: 'HEREEE updated' })
    // }

    // if (
    //   allInventoryIds &&
    //   !item?.item_id &&
    //   !currentItem?.item_id &&
    //   itemToRemove
    // ) {
    //   const query = await pool.query(
    //     `UPDATE inventory SET ${itemToRemove.type}=null,all_items='{${allInventoryIds}}' WHERE inv_id=${req.id}`,
    //     []
    //   )
    //   return res.status(200).json({ data: 'HEREEE updated' })
    // }
  } catch (err) {
    console.log(err)
    return res.status(400).json({ message: 'Nieeee udalo sie zaktualizowac' })
  }
}

const addToInventory = async (req, res) => {
  try {
    const { lootedItemId } = req.body

    const player = await Player.findOne({ _id: req.id })
    const item = await Item.findOne({ _id: lootedItemId })
    console.log('player', player)
    console.log('player inv', player.inventory)

    player.inventory.all.push(lootedItemId)
    await player.save()

    return res.status(200).json({ data: item })
  } catch (err) {
    return res.status(400).json({ message: 'Nieeee udalo sie zaktualizowac' })
  }
}

const getUsers = (req, res) => {
  console.log('======= REQ =======', req)
  sql = `SELECT * FROM players`

  try {
    db.all(sql, [], (err, rows) => {
      console.log('rows')
      if (err) return res.json({ status: 300, succ: false, err })

      if (rows.length < 1) {
        return res.json({ status: 300, succ: false, err: 'No match' })
      }

      return res.json({ status: 200, succ: true, data: rows })
    })
  } catch (err) {
    return res.json({
      status: 400,
      success: false,
    })
  }
}

module.exports = {
  getMe,
  getInventory,
  addToInventory,
  login,
  refresh,
  updateMe,
  updateInventory,
  logout,
  getUsers,
}
