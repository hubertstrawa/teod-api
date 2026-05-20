import Item from '../models/Item.js'
import Player from '../models/Player.js'
import itemsToSell from '../utils/itemsToSell.js'
import ApiError from '../src/shared/errors/ApiError.js'
import asyncHandler from '../src/shared/http/asyncHandler.js'

const getInventory = asyncHandler(async (req, res) => {
  const userId = req.id

  const player = await Player.findOne({ _id: userId }).populate({
    path: 'inventory',
    populate: {
      path: 'all eq.amulet eq.helmet eq.bag eq.weapon eq.armor eq.shield eq.ring eq.belt eq.boots',
    },
  })

  if (!player) {
    throw ApiError.badRequest('Nie udalo sie pobrac')
  }

  return res.status(200).json({ eq: player.inventory.eq, all: player.inventory.all })
})

const updateInventory = asyncHandler(async (req, res) => {
  const { item, itemToRemove, allInventoryIds } = req.body
  const player = await Player.findOne({ _id: req.id })

  if (!player) {
    throw ApiError.badRequest('Nieeee udalo sie zaktualizowac')
  }

  // unequip
  if (itemToRemove?._id && !item?._id) {
    player.inventory.eq[itemToRemove.type] = null
    player.inventory.all = allInventoryIds
    await player.save()
    return res.status(200).json({ data: player.inventory })
  }
})

const equipItem = asyncHandler(async (req, res) => {
  const { itemToEquip, index } = req.body
  const player = await Player.findOne({ _id: req.id })

  if (!player) {
    throw ApiError.badRequest('Nie udalo sie zalozyc')
  }

  const hasItemInInventory = player.inventory.all.includes(itemToEquip._id)
  if (!hasItemInInventory) {
    throw ApiError.badRequest('Nie udalo sie zalozyc (gracz nie posiada itemu)')
  }

  const item = await Item.findOne({ _id: itemToEquip._id })

  if (!item) {
    throw ApiError.badRequest('Nie udalo sie zalozyc')
  }

  if (itemToEquip.minLevel > player.level) {
    throw ApiError.badRequest('Nie posiadasz wymaganego poziomu')
  }

  if (player.inventory.eq[itemToEquip.type]) {
    const itemCurrentlyEquipped = await Item.findOne({
      _id: player.inventory.eq[itemToEquip.type],
    })

    for (let attr of Object.keys(itemCurrentlyEquipped.attributes)) {
      // vitality, 3
      if (itemCurrentlyEquipped.attributes[attr] > 0) {
        if (attr === 'vitality') {
          player.maxHealthPoints =
            player.maxHealthPoints - itemCurrentlyEquipped.attributes[attr] * 2
        }

        if (attr === 'manaVitality') {
          player.maxManaPoints =
            player.maxManaPoints - itemCurrentlyEquipped.attributes[attr] * 2
        }

        player.attributes[`eq${attr.charAt(0).toUpperCase() + attr.slice(1)}`] =
          player.attributes[
            `eq${attr.charAt(0).toUpperCase() + attr.slice(1)}`
          ] - itemCurrentlyEquipped.attributes[attr]
      }
    }
    player.inventory.all.push(player.inventory.eq[itemToEquip.type]._id)
  }

  for (let attr of Object.keys(item.attributes)) {
    if (item.attributes[attr] > 0) {
      player.attributes[`eq${attr.charAt(0).toUpperCase() + attr.slice(1)}`] =
        player.attributes[`eq${attr.charAt(0).toUpperCase() + attr.slice(1)}`] +
        item.attributes[attr]

      if (attr === 'vitality') {
        player.maxHealthPoints = player.maxHealthPoints + item.attributes[attr] * 2
      }

      if (attr === 'manaVitality') {
        player.maxManaPoints = player.maxManaPoints + item.attributes[attr] * 2
      }
    }
  }

  player.inventory.all.splice(index, 1)
  player.inventory.eq[itemToEquip.type] = itemToEquip._id

  await player.save()
  return res.status(200).json({ data: 'Zalozono przedmiot' })
})

const unequipItem = asyncHandler(async (req, res) => {
  const { itemToUnequip } = req.body
  const player = await Player.findOne({ _id: req.id })

  if (!player || !player.inventory.eq[itemToUnequip.type]) {
    throw ApiError.badRequest('Nie udalo sie zdjac')
  }

  const hasItemEquipped =
    player.inventory.eq[itemToUnequip.type]._id.toString() === itemToUnequip._id

  if (!hasItemEquipped) {
    throw ApiError.badRequest('Nie udalo sie zdjac itemu (gracz nie posiada)')
  }

  const item = await Item.findOne({ _id: itemToUnequip._id })

  if (!item) {
    throw ApiError.badRequest('Nie udalo sie zdjac')
  }

  for (let attr of Object.keys(item.attributes)) {
    if (item.attributes[attr] > 0) {
      player.attributes[`eq${attr.charAt(0).toUpperCase() + attr.slice(1)}`] =
        player.attributes[`eq${attr.charAt(0).toUpperCase() + attr.slice(1)}`] -
        item.attributes[attr]

      if (attr === 'vitality') {
        player.maxHealthPoints = player.maxHealthPoints - item.attributes[attr] * 2
      }

      if (attr === 'manaVitality') {
        player.maxManaPoints = player.maxManaPoints - item.attributes[attr] * 2
      }
    }
  }

  player.inventory.eq[itemToUnequip.type] = null
  player.inventory.all.push(itemToUnequip._id)

  await player.save()
  return res.status(200).json({ data: 'Zdjeto przedmiot' })
})

const eatFood = asyncHandler(async (req, res) => {
  const { itemToConsume, index } = req.body

  const player = await Player.findOne({ _id: req.id })
  if (!player) {
    throw ApiError.badRequest('Nie udalo sie zjesc')
  }

  const hasItem = player.inventory.all.includes(itemToConsume._id)

  if (!itemToConsume || index === -1 || !hasItem) {
    throw ApiError.badRequest('Nie udalo sie zjesc (brak index/item)')
  }

  switch (itemToConsume._id) {
    // surowe mieso
    case '63e96737ecbb4c981ca98882': {
      player.maxHealthPoints - player.healthPoints <= 20
        ? (player.healthPoints = player.maxHealthPoints)
        : (player.healthPoints = player.healthPoints + 20)
      player.energy >= 98 ? (player.energy = 100) : (player.energy = player.energy + 2)
      break
    }
    // mala mikstura
    case '63e57825740c52afc3339dbf': {
      player.maxHealthPoints - player.healthPoints <= 50
        ? (player.healthPoints = player.maxHealthPoints)
        : (player.healthPoints = player.healthPoints + 50)
      player.energy >= 95 ? (player.energy = 100) : (player.energy = player.energy + 5)
      break
    }
    // mala mikstura many
    case '6435c9902b8966851df8ac8b': {
      player.maxManaPoints - player.manaPoints <= 50
        ? (player.manaPoints = player.maxManaPoints)
        : (player.manaPoints = player.manaPoints + 50)
      player.energy >= 95 ? (player.energy = 100) : (player.energy = player.energy + 5)
      break
    }
    // ksiega czaru Błyskawica
    case '642353e6483b9202619f6095': {
      const spell = player.spells.find((el) => el.name === 'Błyskawica')
      if (!!spell) {
        spell.spellLevel = spell.spellLevel + 1
        spell.power = spell.power + 2
      } else {
        player.spells.push({
          name: 'Błyskawica',
          spellType: 'electric',
          spellLevel: 1,
          power: 35,
          manaCost: 15,
          minIntelligence: 10,
        })
      }
      break
    }
    // ksiega czaru Ogniste uderzenie
    case '64329ab23fcef17a9c96b8e3': {
      const spell = player.spells.find((el) => el.name === 'Ogniste uderzenie')
      if (!!spell) {
        spell.spellLevel = spell.spellLevel + 1
        spell.power = spell.power + 2
      } else {
        player.spells.push({
          name: 'Ogniste uderzenie',
          spellType: 'fire',
          spellLevel: 1,
          power: 25,
          manaCost: 10,
          minIntelligence: 10,
        })
      }
      break
    }
    // kamien przebudzenia
    case '64198dc4498996fb93e194b5': {
      player.energy >= 50 ? (player.energy = 100) : (player.energy = player.energy + 50)
      break
    }
    // LOKACJA krolewskie ruiny
    case '64e158aca2080c12d0207df2': {
      player.locations.includes('royal-ruins')
        ? null
        : player.locations.push('royal-ruins')
      break
    }
    default:
      return null
  }

  player.inventory.all.splice(index, 1)
  await player.save()
  return res.status(200).json({ data: 'Zjedzono' })
})

const addToInventory = asyncHandler(async (req, res) => {
  const { lootedItemId } = req.body

  const player = await Player.findOne({ _id: req.id })
  const item = await Item.findOne({ _id: lootedItemId })

  if (!player || !item) {
    throw ApiError.badRequest('Nie udalo sie zaktualizowac')
  }

  player.inventory.all.push(lootedItemId)
  await player.save()
  return res.status(200).json({ data: item })
})

const getItemSell = asyncHandler(async (req, res) => {
  const itemsToSellIds = itemsToSell.map((item) => item._id)
  const items = await Item.find({ _id: { $in: itemsToSellIds } })
  return res.status(200).json({ data: items })
})

const buyItem = asyncHandler(async (req, res) => {
  const { itemId } = req.body

  const player = await Player.findOne({ _id: req.id })
  const item = await Item.findOne({ _id: itemId })

  if (!player || !item) {
    throw ApiError.badRequest('Nie udało się kupić przedmiotu')
  }

  if (player.money < item.value) {
    throw ApiError.badRequest('Masz za mało złota, aby kupić ten przedmiot')
  }

  player.inventory.all.push(itemId)
  player.money = player.money - item.value
  await player.save()

  return res.status(200).json({ data: item })
})

const sellItem = asyncHandler(async (req, res) => {
  const { itemId } = req.body
  const player = await Player.findOne({ _id: req.id })
  const item = await Item.findOne({ _id: itemId })

  if (!player || !item) {
    throw ApiError.badRequest('Nie udało się sprzedać przedmiotu')
  }

  const inInventory = player.inventory.all.find((el) => el._id.toString() === itemId)
  if (!inInventory) {
    throw ApiError.badRequest('Nie posiadasz tego przedmiotu')
  }

  player.inventory.all.splice(player.inventory.all.indexOf(inInventory), 1)
  player.money = player.money + Math.round(item.value * 0.7)
  await player.save()
  return res.status(200).json({ message: 'Sprzedano przedmiot' })
})

export {
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
