import asyncHandler from '../../shared/http/asyncHandler.js'
import inventoryService from './inventory.service.js'

export const createInventoryController = (service = inventoryService) => {
  const getInventory = asyncHandler(async (req, res) => {
    const response = await service.getInventory({ userId: req.id })
    return res.status(200).json(response)
  })

  const addToInventory = asyncHandler(async (req, res) => {
    const response = await service.addToInventory({
      playerId: req.id,
      lootedItemId: req.body.lootedItemId,
    })

    return res.status(200).json(response)
  })

  const updateInventory = asyncHandler(async (req, res) => {
    const response = await service.updateInventory({
      playerId: req.id,
      item: req.body.item,
      itemToRemove: req.body.itemToRemove,
      allInventoryIds: req.body.allInventoryIds,
    })

    return res.status(200).json(response)
  })

  const eatFood = asyncHandler(async (req, res) => {
    const response = await service.eatFood({
      playerId: req.id,
      itemToConsume: req.body.itemToConsume,
      index: req.body.index,
    })

    return res.status(200).json(response)
  })

  const equipItem = asyncHandler(async (req, res) => {
    const response = await service.equipItem({
      playerId: req.id,
      itemToEquip: req.body.itemToEquip,
      index: req.body.index,
    })

    return res.status(200).json(response)
  })

  const unequipItem = asyncHandler(async (req, res) => {
    const response = await service.unequipItem({
      playerId: req.id,
      itemToUnequip: req.body.itemToUnequip,
    })

    return res.status(200).json(response)
  })

  const getItemSell = asyncHandler(async (_req, res) => {
    const response = await service.getItemSell()
    return res.status(200).json(response)
  })

  const buyItem = asyncHandler(async (req, res) => {
    const response = await service.buyItem({
      playerId: req.id,
      itemId: req.body.itemId,
    })

    return res.status(200).json(response)
  })

  const sellItem = asyncHandler(async (req, res) => {
    const response = await service.sellItem({
      playerId: req.id,
      itemId: req.body.itemId,
    })

    return res.status(200).json(response)
  })

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

const inventoryController = createInventoryController()
export const {
  getInventory,
  addToInventory,
  updateInventory,
  buyItem,
  sellItem,
  eatFood,
  equipItem,
  unequipItem,
  getItemSell,
} = inventoryController

export default inventoryController
