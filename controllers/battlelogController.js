const Item = require('../models/Item')
const Player = require('../models/Player')
const Questlog = require('../models/Questlog')
const Battlelog = require('../models/Battlelog')
const Quest = require('../models/Quest')
const getLootFromEnemy = require('../utils/getLootFromEnemy')
const enemyData = require('../utils/enemyData')

const getRandomIntMinMax = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1) + min)
}

const calculateProbability = (number) => {
  const probability = number / 1000
  return Math.random() <= probability
}
// export default getRandomIntMinMax

const startBattle = async (req, res) => {
  try {
    const playerId = req.id
    const { enemyId } = req.body

    if (!enemyId) {
      return res.status(400).json({
        message: 'Brak przeciwnika / no enemy id',
      })
    }

    const battlelog = await Battlelog.findOne({ playerId })

    const player = await Player.findOne({ _id: playerId }).populate({
      path: 'inventory',
      populate: {
        path: 'all eq.amulet eq.helmet eq.bag eq.weapon eq.armor eq.shield eq.belt eq.boots',
      },
    })

    if (player.energy < 5) {
      return res.status(400).json({ message: 'Nie masz energii' })
    }

    const eqPlayerAttack = Object.keys(player.inventory.eq).reduce(
      (acc, curr) => {
        return player.inventory.eq[curr]?.attack
          ? acc + player.inventory.eq[curr].attack
          : acc
      },
      5
    )

    const eqPlayerDefense = Object.keys(player.inventory.eq).reduce(
      (acc, curr) => {
        return player.inventory.eq[curr]?.defense
          ? acc + player.inventory.eq[curr].defense
          : acc
      },
      0
    )

    const enemyFound = enemyData.find((el) => el._id === enemyId)
    if (!enemyFound) {
      return res.status(400).json({
        message: 'Brak przeciwnika / no enemy found',
      })
    }

    console.log('ENEMYFOUND', enemyFound)
    const currentEnemy = { ...enemyFound }

    battlelog.current = {
      playerHealthPoints: player.healthPoints,
      playerManaPoints: player.manaPoints,
      playerMaxHealthPoints: player.maxHealthPoints,
      playerMaxManaPoints: player.maxManaPoints,
      playerLevel: player.level,
      playerSpells: null,
      playerExperience: player.experience,
      playerAttributes: player.attributes,
      eqPlayerAttack,
      eqPlayerDefense,
      playerStrength: 0,
      playerIntelligence: 0,
      turn: 1,
      isOver: false,
      playerAttackType: null,
      playerAttackValue: null,
      gainedExp: null,
      gainedGold: null,
      lootedItem: null,
      enemyAttack: 0,
      playerSpecial: null,
    }
    battlelog.enemy = currentEnemy
    await battlelog.save()

    console.log('currentenemy', currentEnemy)

    return res.status(200).json({
      data: {
        message: 'Walka rozpoczęta',
        enemy: {
          health_points: currentEnemy.health_points,
          max_health_points: currentEnemy.max_health_points,
          name: currentEnemy.name,
          image: currentEnemy.image,
        },
      },
    })
  } catch (err) {
    console.log(err)
    return res
      .status(400)
      .json({ message: 'Nie udalo sie pobrac danych o walce' })
  }
}

const attackEnemy = async (req, res) => {
  try {
    const playerId = req.id
    const { attackType } = req.body

    const battlelog = await Battlelog.findOne({ playerId })
    const player = await Player.findOne({ _id: playerId })
    const enemy = { ...battlelog.enemy }

    // console.log('BATTLELOG', battlelog.enemy)

    // @TODO check if player has this attack type/spell
    const { eqPlayerAttack, eqPlayerDefense, playerLevel, playerAttributes } =
      battlelog.current

    let playerAttackValue
    let playerCritical = null

    if (attackType === 'normal') {
      playerAttackValue = getRandomIntMinMax(
        eqPlayerAttack + playerLevel + playerAttributes.strength - 3,
        eqPlayerAttack + playerLevel + playerAttributes.strength + 3
      )

      if (!!calculateProbability(playerAttributes.accuracy)) {
        playerCritical = true
        playerAttackValue = playerAttackValue * 10
      }
    }

    if (attackType === 'fire') {
      const isEffective = battlelog.enemy.type.includes('water')
      const isResistant = battlelog.enemy.type.includes('fire')
      // console.log('isEffective', isEffective)
      // console.log('isResistant', isResistant)

      let [min, max] = [
        eqPlayerAttack + playerLevel + playerAttributes.intelligence - 2,
        eqPlayerAttack + playerLevel + playerAttributes.intelligence + 5,
      ]
      if (isResistant) {
        min = min / 2
        max = max / 2
      }
      if (isEffective && !isResistant) {
        min = min * 2
        max = max * 2
      }
      playerAttackValue = getRandomIntMinMax(min, max)

      if (!!calculateProbability(playerAttributes.accuracy)) {
        playerCritical = true
        playerAttackValue = playerAttackValue * 10
      }
    }

    battlelog.current.playerAttackType = attackType
    battlelog.current.playerAttackValue = playerAttackValue

    const lastHit = playerAttackValue >= battlelog.enemy.health_points
    // PLAYER WON
    if (lastHit || battlelog.enemy.health_points <= 0) {
      battlelog.enemy.health_points = 0
      battlelog.current.enemyAttack = null
      battlelog.current.isOver = true
      const expNeededForLevel = playerLevel * (playerLevel + 1) * 100

      const goldEarned = getRandomIntMinMax(
        battlelog.enemy.maxMoney / 2,
        battlelog.enemy.maxMoney
      )

      const expEarned =
        battlelog.enemy.experience - (playerLevel + 3) <= 0
          ? 0
          : battlelog.enemy.experience - (playerLevel + 3)

      // battlelog.current.lootedItem = lootedItem.id === 0 ? null : lootedItem
      battlelog.current.gainedExp = expEarned
      battlelog.current.gainedGold = goldEarned

      battlelog.markModified('enemy')
      battlelog.markModified('current')

      const lootedItem = getLootFromEnemy(battlelog.enemy.loot)

      if (lootedItem.id !== 0) {
        player.inventory.all.push(lootedItem.id)
        const item = await Item.findOne({ _id: lootedItem.id })
        battlelog.current.lootedItem = item
      }

      const isNewLevel =
        expNeededForLevel <= player.experience + battlelog.enemy.experience

      player.experience = player.experience + expEarned
      player.healthPoints = battlelog.current.playerHealthPoints
      player.money = player.money + goldEarned
      player.energy = player.energy - 5

      if (isNewLevel) {
        player.level = player.level + 1
        player.healthPoints = player.maxHealthPoints
        player.manaPoints = player.maxManaPoints
        player.energy = 100
      }

      await player.save()

      const savedDoc = await battlelog.save()
      return res.status(200).json({
        data: savedDoc,
        temp: { playerCritical },
        isNewLevel: isNewLevel
          ? `Awansowano na nowy poziom ${player.level}!`
          : null,
      })
    }

    battlelog.enemy.health_points =
      battlelog.enemy.health_points - playerAttackValue

    // ENEMY ATTACK

    let enemyAttack = getRandomIntMinMax(
      battlelog.enemy.power - eqPlayerDefense - 3,
      battlelog.enemy.power - eqPlayerDefense + 3
    )

    let playerDodge = null
    if (!!calculateProbability(playerAttributes.agility)) {
      enemyAttack = 0
      playerDodge = true
    }

    if (enemyAttack <= 0) battlelog.current.enemyAttack = 0
    const lastEnemyHit = enemyAttack >= battlelog.current.playerHealthPoints

    if (lastEnemyHit || battlelog.current.playerHealthPoints <= 0) {
      battlelog.current.playerHealthPoints = 0
      battlelog.current.isOver = true
      battlelog.markModified('enemy')
      battlelog.markModified('current')

      player.healthPoints = 0
      player.energy = player.energy - 5

      await player.save()

      const savedDoc = await battlelog.save()
      return res.status(200).json({
        message: 'Walka przegrana',
        data: savedDoc,
      })
    }

    battlelog.current.enemyAttack = enemyAttack
    battlelog.current.playerHealthPoints =
      battlelog.current.playerHealthPoints - enemyAttack

    battlelog.current.turn = battlelog.current.turn + 1

    battlelog.markModified('enemy')
    battlelog.markModified('current')

    const savedDoc = await battlelog.save()
    return res.status(200).json({
      data: savedDoc,
      temp: { playerDodge, playerCritical },
    })
  } catch (err) {
    console.log(err)
    return res.status(400).json({ message: 'Nie udalo sie zaatakowac' })
  }
}

module.exports = {
  startBattle,
  attackEnemy,
}
