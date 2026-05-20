import mongoose from 'mongoose'
import spellSchema from './Spell.js'
import jobSchema from './Job.js'
import notificationSchema from './Notification.js'
import friendsSchema from './Friends.js'
const playerSchema = new mongoose.Schema(
  {
    playerName: {
      type: String,
      required: true,
      unique: true,
      min: 3,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    level: {
      type: Number,
      default: 1,
    },
    experience: {
      type: Number,
      default: 0,
    },
    healthPoints: {
      type: Number,
      required: false,
      default: 100,
    },
    maxHealthPoints: {
      type: Number,
      default: 100,
    },
    manaPoints: {
      type: Number,
      default: 100,
    },
    maxManaPoints: {
      type: Number,
      default: 100,
    },
    money: {
      type: Number,
      default: 0,
    },
    power: {
      type: Number,
      default: 10,
    },
    energy: {
      type: Number,
      default: 100,
    },
    race: {
      type: String,
      enum: ['human', 'elf', 'orc'],
      default: 'human',
    },
    avatar: {
      type: String,
      default: '/avatars/human-m.png',
    },
    tutorial: {
      type: Number,
      default: 1,
    },
    spells: [spellSchema],
    activeJob: {
      type: jobSchema,
    },
    notifications: [notificationSchema],
    friends: friendsSchema,
    locations: {
      type: [String],
      default: ['forgotten-forest'],
    },
    attributes: {
      strength: {
        type: Number,
        default: 10,
      },
      eqStrength: {
        type: Number,
        default: 0,
      },
      intelligence: {
        type: Number,
        default: 10,
      },
      eqIntelligence: {
        type: Number,
        default: 0,
      },
      vitality: {
        type: Number,
        default: 10,
      },
      eqVitality: {
        type: Number,
        default: 0,
      },
      manaVitality: {
        type: Number,
        default: 10,
      },
      eqManaVitality: {
        type: Number,
        default: 0,
      },
      accuracy: {
        type: Number,
        default: 10,
      },
      eqAccuracy: {
        type: Number,
        default: 0,
      },
      agility: {
        type: Number,
        default: 10,
      },
      eqAgility: {
        type: Number,
        default: 0,
      },
    },
    inventory: {
      eq: {
        amulet: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Item',
          default: null,
        },
        helmet: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Item',
          default: null,
        },
        bag: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Item',
          default: { _id: '63e958bfecbb4c981ca9887f' },
        },
        weapon: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Item',
          default: null,
        },
        armor: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Item',
          default: null,
        },
        shield: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Item',
          default: null,
        },
        belt: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Item',
          default: null,
        },
        boots: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Item',
          default: null,
        },
        ring: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Item',
          default: null,
        },
      },
      all: {
        type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Item' }],
        default: [
          { _id: '63e57825740c52afc3339dbf' },
          { _id: '640e04be6a185fc05a969e2a' },
        ],
      },
    },
  },
  { timestamps: true }
)

const Player = mongoose.model('Player', playerSchema)
export default Player
