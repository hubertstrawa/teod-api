import mongoose from 'mongoose'

const battlePlayerAttributesSchema = new mongoose.Schema(
  {
    strength: { type: Number, default: 0 },
    eqStrength: { type: Number, default: 0 },
    intelligence: { type: Number, default: 0 },
    eqIntelligence: { type: Number, default: 0 },
    vitality: { type: Number, default: 0 },
    eqVitality: { type: Number, default: 0 },
    manaVitality: { type: Number, default: 0 },
    eqManaVitality: { type: Number, default: 0 },
    accuracy: { type: Number, default: 0 },
    eqAccuracy: { type: Number, default: 0 },
    agility: { type: Number, default: 0 },
    eqAgility: { type: Number, default: 0 },
  },
  { _id: false }
)

const battleLootedItemSchema = new mongoose.Schema(
  {
    _id: { type: mongoose.Schema.Types.ObjectId, ref: 'Item', required: true },
    name: { type: String, required: true, trim: true },
    image: { type: String, default: null },
    state: { type: String, default: null },
    type: { type: String, default: null },
    attack: { type: Number, default: null },
    defense: { type: Number, default: null },
    value: { type: Number, default: null },
  },
  { _id: false }
)

const battleCurrentSchema = new mongoose.Schema(
  {
    status: {
      type: String,
      enum: ['idle', 'in_progress', 'won', 'lost'],
      default: 'idle',
    },
    playerHealthPoints: { type: Number, default: 0, min: 0 },
    playerManaPoints: { type: Number, default: 0, min: 0 },
    playerMaxHealthPoints: { type: Number, default: 0, min: 0 },
    playerMaxManaPoints: { type: Number, default: 0, min: 0 },
    playerLevel: { type: Number, default: 1, min: 1 },
    playerSpells: { type: [String], default: [] },
    playerExperience: { type: Number, default: 0, min: 0 },
    playerAttributes: {
      type: battlePlayerAttributesSchema,
      default: () => ({}),
    },
    eqPlayerAttack: { type: Number, default: 0, min: 0 },
    eqPlayerDefense: { type: Number, default: 0, min: 0 },
    playerStrength: { type: Number, default: 0 },
    playerIntelligence: { type: Number, default: 0 },
    turn: { type: Number, default: 0, min: 0 },
    isOver: { type: Boolean, default: true },
    playerAttackType: {
      type: String,
      enum: ['normal', 'fire', 'electric', null],
      default: null,
    },
    playerAttackValue: { type: Number, default: null },
    gainedExp: { type: Number, default: null, min: 0 },
    gainedGold: { type: Number, default: null, min: 0 },
    lootedItem: { type: battleLootedItemSchema, default: null },
    enemyAttack: { type: Number, default: null },
    playerSpecial: { type: String, default: null },
  },
  { _id: false }
)

export default battleCurrentSchema
