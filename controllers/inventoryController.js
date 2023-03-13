const Item = require('../models/Item')
const Player = require('../models/Player')

const getInventory = async (req, res) => {
  try {
    const userId = req.id

    const player = await Player.findOne({ _id: userId }).populate({
      path: 'inventory',
      populate: {
        path: 'all eq.amulet eq.helmet eq.bag eq.weapon eq.armor eq.shield eq.belt eq.boots',
      },
    })

    return res
      .status(200)
      .json({ eq: player.inventory.eq, all: player.inventory.all })
  } catch (err) {
    console.log(err)
    return res.status(400).json({ message: 'Nie udalo sie pobrac' })
  }
}

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
      console.log('ITEMTOCONSUME', itemToConsume?._id)
      switch (itemToConsume._id) {
        // surowe mieso
        case '63e96737ecbb4c981ca98882': {
          player.maxHealthPoints - player.healthPoints <= 20
            ? (player.healthPoints = player.maxHealthPoints)
            : (player.healthPoints = player.healthPoints + 20)
          player.energy >= 95
            ? (player.energy = 100)
            : (player.energy = player.energy + 5)
          break
        }
        // mala mikstura
        case '63e57825740c52afc3339dbf': {
          player.maxHealthPoints - player.healthPoints <= 50
            ? (player.healthPoints = player.maxHealthPoints)
            : (player.healthPoints = player.healthPoints + 50)
          player.maxManaPoints - player.manaPoints <= 50
            ? (player.manaPoints = player.maxManaPoints)
            : (player.manaPoints = player.manaPoints + 50)
          player.energy >= 80
            ? (player.energy = 100)
            : (player.energy = player.energy + 20)
          break
        }
        default:
          return null
      }
      player.inventory.all = allInventoryIds
      player.save()
      return res.status(200).json({ data: player.inventory })
    }
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

    player.inventory.all.push(lootedItemId)
    await player.save()

    return res.status(200).json({ data: item })
  } catch (err) {
    return res.status(400).json({ message: 'Nie udalo sie zaktualizowac' })
  }
}

const buyItem = async (req, res) => {
  try {
    const { itemId } = req.body

    const player = await Player.findOne({ _id: req.id })
    const item = await Item.findOne({ _id: itemId })
    console.log('BUY ITEM', player.playerName)
    console.log('BUY ITEM ITEM', item)

    if (player.money < item.value) {
      return res
        .status(400)
        .json({ message: 'Nie masz wystarczająco pieniędzy' })
    }

    player.inventory.all.push(itemId)
    player.money = player.money - item.value
    await player.save()

    return res.status(200).json({ data: item })
  } catch (err) {
    return res.status(400).json({ message: 'Nie udało się kupić przedmiotu' })
  }
}

module.exports = {
  getInventory,
  addToInventory,
  updateInventory,
  buyItem,
}
