const Item = require('../models/Item')
const Player = require('../models/Player')

const updateMe = async (req, res) => {
  try {
    const email = req.email

    await Player.updateOne({ email }, { ...req.body })

    return res.status(200).json({ data: 'User updated' })
  } catch (err) {
    console.log(err)
    return res.status(400).json({ message: 'Nie udalo sie zaktualizowac' })
  }
}

const getMe = async (req, res) => {
  try {
    const email = req.email

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
}

module.exports = {
  getMe,
  updateMe,
}
