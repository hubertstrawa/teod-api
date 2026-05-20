import test from 'node:test'
import assert from 'node:assert/strict'
import express from 'express'
import request from 'supertest'
import mongoose from 'mongoose'
import errorHandler from '../../src/shared/http/errorHandler.js'
import { startBattle, attackEnemy } from '../../src/modules/battlelog/battlelog.controller.js'
import { startTask, finishTask } from '../../src/modules/tasklog/tasklog.controller.js'
import Battlelog from '../../models/Battlelog.js'
import Player from '../../models/Player.js'
import Enemy from '../../models/Enemy.js'
import Item from '../../models/Item.js'
import Task from '../../models/Task.js'
import Tasklog from '../../models/Tasklog.js'

const createTestApp = () => {
  const app = express()
  app.use(express.json())
  app.use((req, _res, next) => {
    req.id = '507f1f77bcf86cd799439011'
    next()
  })

  const battleRouter = express.Router()
  battleRouter.post('/startBattle', startBattle)
  battleRouter.post('/attackEnemy', attackEnemy)
  app.use('/battlelog', battleRouter)

  const taskRouter = express.Router()
  taskRouter.post('/startTask', startTask)
  taskRouter.post('/finishTask', finishTask)
  app.use('/tasklog', taskRouter)

  app.use(errorHandler)
  return app
}

const withPatchedMethod = (target, methodName, implementation) => {
  const original = target[methodName]
  target[methodName] = implementation
  return () => {
    target[methodName] = original
  }
}

test('startBattle creates in-progress typed battle state', async () => {
  const app = createTestApp()
  const enemyId = new mongoose.Types.ObjectId()

  const battlelogDoc = {
    current: { status: 'idle', isOver: true },
    availableBoss: null,
    save: async function save() {
      return this
    },
  }

  const playerDoc = {
    healthPoints: 100,
    manaPoints: 80,
    maxHealthPoints: 100,
    maxManaPoints: 100,
    level: 3,
    experience: 250,
    attributes: {
      strength: 15,
      eqStrength: 2,
      intelligence: 10,
      eqIntelligence: 0,
      vitality: 10,
      eqVitality: 0,
      manaVitality: 10,
      eqManaVitality: 0,
      accuracy: 0,
      eqAccuracy: 0,
      agility: 0,
      eqAgility: 0,
    },
    activeJob: null,
    energy: 100,
    inventory: {
      eq: {
        amulet: null,
        helmet: null,
        bag: null,
        weapon: null,
        armor: null,
        shield: null,
        belt: null,
        boots: null,
      },
    },
  }

  const enemyDoc = {
    _id: enemyId,
    name: 'Spider',
    image: '/enemy/spider.png',
    type: 'bug',
    power: 8,
    health_points: 30,
    max_health_points: 30,
    experience: 20,
    maxMoney: 40,
    loot: [{ chance: 100, itemId: '0' }],
  }

  const restoreBattlelogFindOne = withPatchedMethod(Battlelog, 'findOne', async () => battlelogDoc)
  const restorePlayerFindOne = withPatchedMethod(Player, 'findOne', () => ({
    populate: async () => playerDoc,
  }))
  const restoreEnemyFindOne = withPatchedMethod(Enemy, 'findOne', async () => enemyDoc)

  try {
    const response = await request(app).post('/battlelog/startBattle').send({
      enemyId: enemyId.toString(),
    })

    assert.equal(response.status, 200)
    assert.equal(battlelogDoc.current.status, 'in_progress')
    assert.equal(battlelogDoc.current.isOver, false)
    assert.equal(battlelogDoc.current.turn, 1)
    assert.equal(battlelogDoc.enemy._id.toString(), enemyId.toString())
    assert.equal(battlelogDoc.enemy.name, 'Spider')
    assert.equal(battlelogDoc.enemy.health_points, 30)
    assert.equal(battlelogDoc.enemy.monsterType, 'normal')
    assert.equal(response.body.data.message, 'Walka rozpoczęta')
  } finally {
    restoreBattlelogFindOne()
    restorePlayerFindOne()
    restoreEnemyFindOne()
  }
})

test('attackEnemy updates Map counters and ends battle on kill', async () => {
  const app = createTestApp()
  const enemyId = new mongoose.Types.ObjectId()
  const droppedItemId = new mongoose.Types.ObjectId()

  const battlelogDoc = {
    enemy: {
      _id: enemyId,
      name: 'Spider',
      image: '/enemy/spider.png',
      type: 'bug',
      monsterType: 'normal',
      power: 8,
      health_points: 10,
      max_health_points: 10,
      experience: 20,
      maxMoney: 30,
      loot: [{ chance: 100, itemId: droppedItemId.toString() }],
    },
    current: {
      status: 'in_progress',
      isOver: false,
      playerHealthPoints: 100,
      playerManaPoints: 50,
      playerLevel: 5,
      playerAttributes: {
        strength: 100,
        eqStrength: 0,
        intelligence: 10,
        eqIntelligence: 0,
        vitality: 10,
        eqVitality: 0,
        manaVitality: 10,
        eqManaVitality: 0,
        accuracy: 0,
        eqAccuracy: 0,
        agility: 0,
        eqAgility: 0,
      },
      eqPlayerAttack: 10,
      eqPlayerDefense: 0,
      turn: 1,
    },
    killedMonsters: new Map(),
    save: async function save() {
      return this
    },
  }

  const playerDoc = {
    level: 5,
    experience: 100,
    healthPoints: 100,
    manaPoints: 50,
    maxHealthPoints: 100,
    maxManaPoints: 100,
    money: 0,
    energy: 100,
    spells: [],
    inventory: { all: [] },
    save: async function save() {
      return this
    },
  }

  const restoreBattlelogFindOne = withPatchedMethod(Battlelog, 'findOne', async () => battlelogDoc)
  const restorePlayerFindOne = withPatchedMethod(Player, 'findOne', async () => playerDoc)
  const restoreItemFindOne = withPatchedMethod(Item, 'findOne', async () => ({
    _id: droppedItemId,
    name: 'Drop test item',
    image: '/items/drop.png',
    state: 'common',
    type: 'weapon',
    attack: 4,
    defense: 0,
    value: 15,
  }))

  try {
    const response = await request(app).post('/battlelog/attackEnemy').send({
      spell: { spellType: 'normal', name: 'Atak' },
    })

    assert.equal(response.status, 200)
    assert.equal(battlelogDoc.current.status, 'won')
    assert.equal(battlelogDoc.current.isOver, true)
    assert.equal(battlelogDoc.enemy.health_points, 0)
    assert.equal(battlelogDoc.killedMonsters.get(enemyId.toString()), 1)
    assert.equal(playerDoc.inventory.all.length, 1)
    assert.equal(playerDoc.inventory.all[0].toString(), droppedItemId.toString())
    assert.equal(battlelogDoc.current.lootedItem.name, 'Drop test item')
  } finally {
    restoreBattlelogFindOne()
    restorePlayerFindOne()
    restoreItemFindOne()
  }
})

test('startTask and finishTask work with typed activeTask and Map counters', async () => {
  const app = createTestApp()
  const taskId = new mongoose.Types.ObjectId()
  const enemyId = new mongoose.Types.ObjectId()
  const bossId = new mongoose.Types.ObjectId()

  const tasklogDoc = {
    activeTask: null,
    taskPoints: 0,
    save: async function save() {
      return this
    },
  }

  const battlelogDoc = {
    current: { status: 'idle', isOver: true },
    killedMonsters: new Map([[enemyId.toString(), 120]]),
    availableBoss: null,
    save: async function save() {
      return this
    },
  }

  const playerDoc = { level: 20 }
  const taskDoc = {
    _id: taskId,
    name: 'Spider Hunt',
    enemyId,
    bossId,
    minLevel: 10,
    taskPointsAdd: 3,
  }

  const restoreTaskFindOne = withPatchedMethod(Task, 'findOne', async () => taskDoc)
  const restorePlayerFindOne = withPatchedMethod(Player, 'findOne', async () => playerDoc)
  const restoreTasklogFindOne = withPatchedMethod(Tasklog, 'findOne', async () => tasklogDoc)
  const restoreBattlelogFindOne = withPatchedMethod(Battlelog, 'findOne', async () => battlelogDoc)

  try {
    const startResponse = await request(app).post('/tasklog/startTask').send({
      taskId: taskId.toString(),
    })

    assert.equal(startResponse.status, 200)
    assert.equal(tasklogDoc.activeTask.status, 'active')
    assert.equal(tasklogDoc.activeTask.countStart, 120)
    assert.equal(tasklogDoc.activeTask.countEnd, 220)

    const finishResponse = await request(app).post('/tasklog/finishTask').send({
      taskId: taskId.toString(),
    })

    assert.equal(finishResponse.status, 400)
    assert.equal(finishResponse.body.error.message, 'Nie udalo sie zakończyć taska (1)')

    battlelogDoc.killedMonsters.set(enemyId.toString(), 220)
    const finishSuccess = await request(app).post('/tasklog/finishTask').send({
      taskId: taskId.toString(),
    })

    assert.equal(finishSuccess.status, 200)
    assert.equal(tasklogDoc.activeTask, null)
    assert.equal(tasklogDoc.taskPoints, 3)
    assert.equal(battlelogDoc.availableBoss.toString(), bossId.toString())
  } finally {
    restoreTaskFindOne()
    restorePlayerFindOne()
    restoreTasklogFindOne()
    restoreBattlelogFindOne()
  }
})
