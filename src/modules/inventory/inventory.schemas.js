import { z } from 'zod'

const objectIdSchema = z.string().regex(/^[a-f\d]{24}$/i, 'Nieprawidlowy identyfikator')
const emptyBodySchema = z.object({}).strict()
const emptyQuerySchema = z.object({}).strict()
const emptyParamsSchema = z.object({}).strict()

const addToInventoryBodySchema = z
  .object({
    lootedItemId: objectIdSchema,
  })
  .strict()

const updateInventoryBodySchema = z
  .object({
    item: z.record(z.any()).optional(),
    itemToRemove: z.record(z.any()).optional(),
    allInventoryIds: z.array(objectIdSchema),
  })
  .strict()

const itemToConsumeSchema = z
  .object({
    _id: z.string().trim().min(1),
  })
  .passthrough()

const eatFoodBodySchema = z
  .object({
    itemToConsume: itemToConsumeSchema,
    index: z.number().int().min(0),
  })
  .strict()

const itemToEquipSchema = z
  .object({
    _id: objectIdSchema,
    type: z.string().trim().min(1),
    minLevel: z.number().optional(),
  })
  .passthrough()

const equipItemBodySchema = z
  .object({
    itemToEquip: itemToEquipSchema,
    index: z.number().int().min(0),
  })
  .strict()

const itemToUnequipSchema = z
  .object({
    _id: objectIdSchema,
    type: z.string().trim().min(1),
  })
  .passthrough()

const unequipItemBodySchema = z
  .object({
    itemToUnequip: itemToUnequipSchema,
  })
  .strict()

const itemIdBodySchema = z
  .object({
    itemId: objectIdSchema,
  })
  .strict()

const inventorySchemas = {
  getInventory: {
    body: emptyBodySchema,
    query: emptyQuerySchema,
    params: emptyParamsSchema,
  },
  addToInventory: {
    body: addToInventoryBodySchema,
    query: emptyQuerySchema,
    params: emptyParamsSchema,
  },
  updateInventory: {
    body: updateInventoryBodySchema,
    query: emptyQuerySchema,
    params: emptyParamsSchema,
  },
  eatFood: {
    body: eatFoodBodySchema,
    query: emptyQuerySchema,
    params: emptyParamsSchema,
  },
  equipItem: {
    body: equipItemBodySchema,
    query: emptyQuerySchema,
    params: emptyParamsSchema,
  },
  unequipItem: {
    body: unequipItemBodySchema,
    query: emptyQuerySchema,
    params: emptyParamsSchema,
  },
  getItemSell: {
    body: emptyBodySchema,
    query: emptyQuerySchema,
    params: emptyParamsSchema,
  },
  buyItem: {
    body: itemIdBodySchema,
    query: emptyQuerySchema,
    params: emptyParamsSchema,
  },
  sellItem: {
    body: itemIdBodySchema,
    query: emptyQuerySchema,
    params: emptyParamsSchema,
  },
}

export default inventorySchemas
