import ApiError from '../../shared/errors/ApiError.js'
import itemsToSell from '../../../utils/itemsToSell.js'
import inventoryRepository from './inventory.repository.js'

export const createInventoryService = ({ repository = inventoryRepository } = {}) => {
  const getInventory = async ({ userId }) => {
    const player = await repository.findPlayerWithInventoryById(userId)

    if (!player) {
      throw ApiError.badRequest('Nie udalo sie pobrac')
    }

    return { eq: player.inventory.eq, all: player.inventory.all }
  }

  const updateInventory = async ({ playerId, item, itemToRemove, allInventoryIds }) => {
    const player = await repository.findPlayerById(playerId)

    if (!player) {
      throw ApiError.badRequest('Nieeee udalo sie zaktualizowac')
    }

    if (itemToRemove?._id && !item?._id) {
      player.inventory.eq[itemToRemove.type] = null
      player.inventory.all = allInventoryIds
      await repository.savePlayer(player)
      return { data: player.inventory }
    }

    return { data: player.inventory }
  }

  const equipItem = async ({ playerId, itemToEquip, index }) => {
    const player = await repository.findPlayerById(playerId)

    if (!player) {
      throw ApiError.badRequest('Nie udalo sie zalozyc')
    }

    const hasItemInInventory = player.inventory.all.includes(itemToEquip._id)
    if (!hasItemInInventory) {
      throw ApiError.badRequest('Nie udalo sie zalozyc (gracz nie posiada itemu)')
    }

    const item = await repository.findItemById(itemToEquip._id)

    if (!item) {
      throw ApiError.badRequest('Nie udalo sie zalozyc')
    }

    if (itemToEquip.minLevel != null && itemToEquip.minLevel > player.level) {
      throw ApiError.badRequest('Nie posiadasz wymaganego poziomu')
    }

    if (player.inventory.eq[itemToEquip.type]) {
      const itemCurrentlyEquipped = await repository.findItemById(
        player.inventory.eq[itemToEquip.type]
      )

      for (let attr of Object.keys(itemCurrentlyEquipped.attributes)) {
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
            player.attributes[`eq${attr.charAt(0).toUpperCase() + attr.slice(1)}`] -
            itemCurrentlyEquipped.attributes[attr]
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

    await repository.savePlayer(player)
    return { data: 'Zalozono przedmiot' }
  }

  const unequipItem = async ({ playerId, itemToUnequip }) => {
    const player = await repository.findPlayerById(playerId)

    if (!player || !player.inventory.eq[itemToUnequip.type]) {
      throw ApiError.badRequest('Nie udalo sie zdjac')
    }

    const hasItemEquipped =
      player.inventory.eq[itemToUnequip.type]._id.toString() === itemToUnequip._id

    if (!hasItemEquipped) {
      throw ApiError.badRequest('Nie udalo sie zdjac itemu (gracz nie posiada)')
    }

    const item = await repository.findItemById(itemToUnequip._id)

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

    await repository.savePlayer(player)
    return { data: 'Zdjeto przedmiot' }
  }

  const eatFood = async ({ playerId, itemToConsume, index }) => {
    const player = await repository.findPlayerById(playerId)
    if (!player) {
      throw ApiError.badRequest('Nie udalo sie zjesc')
    }

    const hasItem = player.inventory.all.includes(itemToConsume._id)

    if (!itemToConsume || index === -1 || !hasItem) {
      throw ApiError.badRequest('Nie udalo sie zjesc (brak index/item)')
    }

    switch (itemToConsume._id) {
      case '63e96737ecbb4c981ca98882': {
        player.maxHealthPoints - player.healthPoints <= 20
          ? (player.healthPoints = player.maxHealthPoints)
          : (player.healthPoints = player.healthPoints + 20)
        player.energy >= 98 ? (player.energy = 100) : (player.energy = player.energy + 2)
        break
      }
      case '63e57825740c52afc3339dbf': {
        player.maxHealthPoints - player.healthPoints <= 50
          ? (player.healthPoints = player.maxHealthPoints)
          : (player.healthPoints = player.healthPoints + 50)
        player.energy >= 95 ? (player.energy = 100) : (player.energy = player.energy + 5)
        break
      }
      case '6435c9902b8966851df8ac8b': {
        player.maxManaPoints - player.manaPoints <= 50
          ? (player.manaPoints = player.maxManaPoints)
          : (player.manaPoints = player.manaPoints + 50)
        player.energy >= 95 ? (player.energy = 100) : (player.energy = player.energy + 5)
        break
      }
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
      case '64198dc4498996fb93e194b5': {
        player.energy >= 50 ? (player.energy = 100) : (player.energy = player.energy + 50)
        break
      }
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
    await repository.savePlayer(player)
    return { data: 'Zjedzono' }
  }

  const addToInventory = async ({ playerId, lootedItemId }) => {
    const player = await repository.findPlayerById(playerId)
    const item = await repository.findItemById(lootedItemId)

    if (!player || !item) {
      throw ApiError.badRequest('Nie udalo sie zaktualizowac')
    }

    player.inventory.all.push(lootedItemId)
    await repository.savePlayer(player)
    return { data: item }
  }

  const getItemSell = async () => {
    const itemsToSellIds = itemsToSell.map((item) => item._id)
    void itemsToSellIds
    const items = await repository.findAllItems()
    return { data: items }
  }

  const buyItem = async ({ playerId, itemId }) => {
    const player = await repository.findPlayerById(playerId)
    const item = await repository.findItemById(itemId)

    if (!player || !item) {
      throw ApiError.badRequest('Nie udało się kupić przedmiotu')
    }

    if (player.money < item.value) {
      throw ApiError.badRequest('Masz za mało złota, aby kupić ten przedmiot')
    }

    player.inventory.all.push(itemId)
    player.money = player.money - item.value
    await repository.savePlayer(player)

    return { data: item }
  }

  const sellItem = async ({ playerId, itemId }) => {
    const player = await repository.findPlayerById(playerId)
    const item = await repository.findItemById(itemId)

    if (!player || !item) {
      throw ApiError.badRequest('Nie udało się sprzedać przedmiotu')
    }

    const inInventory = player.inventory.all.find((el) => el._id.toString() === itemId)
    if (!inInventory) {
      throw ApiError.badRequest('Nie posiadasz tego przedmiotu')
    }

    player.inventory.all.splice(player.inventory.all.indexOf(inInventory), 1)
    player.money = player.money + Math.round(item.value * 0.7)
    await repository.savePlayer(player)
    return { message: 'Sprzedano przedmiot' }
  }

  return {
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
}

const inventoryService = createInventoryService()
export default inventoryService
