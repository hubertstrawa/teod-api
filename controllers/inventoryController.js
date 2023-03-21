const Item = require('../models/Item')
const Player = require('../models/Player')
const itemsToSell = require('../utils/itemsToSell')

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

    // // equip
    // if (item?._id) {
    //   const hasItemInInventory = player.inventory.all.includes(item._id)
    //   if (hasItemInInventory) {
    //     player.inventory.eq[item.type] = item._id
    //     player.inventory.all = allInventoryIds
    //     await player.save()
    //     return res.status(200).json({ data: player.inventory })
    //   }
    // }

    // unequip
    if (itemToRemove?._id && !item?._id) {
      player.inventory.eq[itemToRemove.type] = null
      player.inventory.all = allInventoryIds
      await player.save()
      return res.status(200).json({ data: player.inventory })
    }
  } catch (err) {
    console.log(err)
    return res.status(400).json({ message: 'Nieeee udalo sie zaktualizowac' })
  }
}

const equipItem = async (req, res) => {
  try {
    const { itemToEquip, index } = req.body
    const player = await Player.findOne({ _id: req.id })

    const hasItemInInventory = player.inventory.all.includes(itemToEquip._id)
    if (!hasItemInInventory) {
      return res
        .status(400)
        .json({ message: 'Nie udalo sie zalozyc (gracz nie posiada itemu)' })
    }

    player.inventory.all.splice(index, 1)

    if (player.inventory.eq[itemToEquip.type]) {
      player.inventory.all.push(player.inventory.eq[itemToEquip.type]._id)
    }

    player.inventory.eq[itemToEquip.type] = itemToEquip._id

    await player.save()
    return res.status(200).json({ data: 'Zalozono przedmiot' })
  } catch (err) {
    return res.status(400).json({ message: 'Nie udalo sie zjesc' })
  }
}

const unequipItem = async (req, res) => {
  try {
    console.log('req body', req.body)
    const { itemToUnequip } = req.body
    const player = await Player.findOne({ _id: req.id })

    const hasItemEquipped =
      player.inventory.eq[itemToUnequip.type]._id.toString() ===
      itemToUnequip._id
    console.log('hasITMEQUp', hasItemEquipped)

    if (!hasItemEquipped) {
      return res.status(400).json({
        message: 'Nie udalo sie zdjac itemu (gracz nie posiada)',
      })
    }

    player.inventory.eq[itemToUnequip.type] = null
    player.inventory.all.push(itemToUnequip._id)

    await player.save()
    return res.status(200).json({ data: 'Zdjeto przedmiot' })
  } catch (err) {
    return res.status(400).json({ message: 'Nie udalo sie zdjac' })
  }
}

const eatFood = async (req, res) => {
  try {
    const { itemToConsume, index } = req.body

    const player = await Player.findOne({ _id: req.id })
    // const itemFound = await Item.findOne({ _id: itemToConsume._id })

    console.log('itemToConsume', itemToConsume)
    console.log('index', index)
    // console.log('itemFound', itemFound)

    const hasItem = player.inventory.all.includes(itemToConsume._id)

    console.log('hasITEM', hasItem)
    console.log('player.inventory.all', player.inventory.all)

    if (!itemToConsume || index === -1 || !hasItem) {
      return res
        .status(400)
        .json({ message: 'Nie udalo sie zjesc (brak index/item)' })
    }

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
      // kamien przebudzenia
      case '64198dc4498996fb93e194b5': {
        player.energy >= 50
          ? (player.energy = 100)
          : (player.energy = player.energy + 50)
        break
      }
      default:
        return null
    }

    player.inventory.all.splice(index, 1)
    await player.save()

    return res.status(200).json({ data: 'Zjedzono' })
  } catch (err) {
    return res.status(400).json({ message: 'Nie udalo sie zjesc' })
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

const getItemSell = async (req, res) => {
  try {
    return res.status(200).json({ data: itemsToSell })
  } catch (err) {
    return res.status(400).json({ message: 'Nie udało się pobrać danych' })
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

const sellItem = async (req, res) => {
  try {
    const { itemId } = req.body
    const player = await Player.findOne({ _id: req.id })
    const item = await Item.findOne({ _id: itemId })
    const inInventory = player.inventory.all.find(
      (el) => el._id.toString() === itemId
    )
    if (!inInventory) {
      return res.status(400).json({ message: 'Nie posiadasz tego przedmiotu' })
    }

    player.inventory.all.splice(player.inventory.all.indexOf(inInventory), 1)
    player.money = player.money + Math.round(item.value * 0.7)
    await player.save()
    return res.status(200).json({ message: 'Sprzedano przedmiot' })
  } catch (err) {
    return res
      .status(400)
      .json({ message: 'Nie udało się sprzedać przedmiotu' })
  }
}

module.exports = {
  getInventory,
  addToInventory,
  updateInventory,
  buyItem,
  sellItem,
  eatFood,
  equipItem,
  unequipItem,
  getItemSell,
}
