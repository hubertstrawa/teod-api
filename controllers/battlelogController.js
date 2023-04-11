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
const getBattlelog = async (req, res) => {
  try {
    const playerId = req.id
    const battlelog = await Battlelog.findOne({ playerId })

    return res.status(200).json({
      data: battlelog.killedMonsters,
    })
  } catch (err) {
    console.log(err)
    return res.status(400).json({ message: 'Nie udalo sie pobrac battlelog' })
  }
}

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
    if (player.healthPoints <= 0) {
      return res.status(400).json({ message: 'Nie masz HP' })
    }

    if (!!player.activeJob) {
      return res
        .status(400)
        .json({ message: 'Zakończ lub przerwij poszukiwania, aby móc walczyć' })
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
    if (
      battlelog.availableBoss !== enemyId &&
      enemyFound.monsterType === 'boss'
    ) {
      return res.status(400).json({
        message: 'Nie mozna walczyc z bossem',
      })
    }
    if (
      battlelog.availableBoss === enemyId &&
      enemyFound.monsterType === 'boss'
    ) {
      battlelog.availableBoss = null
    }
    console.log('battlelog.availableBosssss', battlelog)
    console.log('enemyFound.monsterType', enemyFound.monsterType)

    console.log('enemyIdd', enemyId)

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
    const { spell } = req.body

    const battlelog = await Battlelog.findOne({ playerId })
    const player = await Player.findOne({ _id: playerId })
    const enemy = { ...battlelog.enemy }

    // console.log('BATTLELOG', battlelog.enemy)

    // @TODO check if player has this attack type/spell
    const { eqPlayerAttack, eqPlayerDefense, playerLevel, playerAttributes } =
      battlelog.current

    let playerAttackValue
    let playerCritical = null

    console.log('player spells', player.spells)

    console.log('attackty', spell)
    if (spell.spellType === 'normal') {
      playerAttackValue = getRandomIntMinMax(
        eqPlayerAttack +
          playerAttributes.eqStrength +
          playerAttributes.strength -
          3,
        eqPlayerAttack +
          playerAttributes.eqStrength +
          playerAttributes.strength +
          3
      )

      if (!!calculateProbability(playerAttributes.accuracy)) {
        playerCritical = true
        playerAttackValue = playerAttackValue * 10
      }
    }

    if (
      spell.spellType === 'fire' &&
      spell.name === 'Ogniste uderzenie' &&
      player.spells.findIndex((el) => el.name === 'Ogniste uderzenie') !== -1
    ) {
      if (battlelog.current.playerManaPoints < 10) {
        return res.status(400).json({ message: 'Nie masz wystarczająco many' })
      }
      battlelog.current.playerManaPoints =
        battlelog.current.playerManaPoints - 10
      const isEffective = battlelog.enemy.type.includes('bug')
      const isResistant = battlelog.enemy.type.includes('fire' || 'water')
      // console.log('isEffective', isEffective)
      // console.log('isResistant', isResistant)

      const findSpell = player.spells.find(
        (el) => el.name === 'Ogniste uderzenie'
      )

      let [min, max] = [
        findSpell.power +
          playerAttributes.eqIntelligence +
          playerAttributes.intelligence -
          2,
        findSpell.power +
          playerAttributes.eqIntelligence +
          playerAttributes.intelligence +
          5,
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

    if (
      spell.spellType === 'electric' &&
      spell.name === 'Błyskawica' &&
      player.spells.findIndex((el) => el.name === 'Błyskawica') !== -1
    ) {
      if (battlelog.current.playerManaPoints < 15) {
        return res.status(400).json({ message: 'Nie masz wystarczająco many' })
      }
      battlelog.current.playerManaPoints =
        battlelog.current.playerManaPoints - 15
      const isEffective = battlelog.enemy.type.includes('water')
      const isResistant = battlelog.enemy.type.includes('electric', 'fire')
      // console.log('isEffective', isEffective)
      // console.log('isResistant', isResistant)

      const findSpell = player.spells.find((el) => el.name === 'Błyskawica')

      let [min, max] = [
        findSpell.spellLevel +
          (playerAttributes.intelligence + playerAttributes.eqIntelligence / 2),
        findSpell.power +
          findSpell.spellLevel +
          playerAttributes.intelligence +
          playerAttributes.eqIntelligence +
          10,
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
      console.log('playerATTACk', playerAttackValue)
      console.log('min', min)
      console.log('max', max)

      if (!!calculateProbability(playerAttributes.accuracy)) {
        playerCritical = true
        playerAttackValue = playerAttackValue * 10
      }
    }

    battlelog.current.playerAttackType = spell.spellType
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
      battlelog.markModified('killedMonsters')

      if (battlelog?.killedMonsters) {
        battlelog.killedMonsters = {
          ...battlelog.killedMonsters,
          [battlelog.enemy._id]: battlelog?.killedMonsters[battlelog.enemy._id]
            ? battlelog.killedMonsters[battlelog.enemy._id] + 1
            : 1,
        }
      } else {
        battlelog.killedMonsters = {
          [battlelog.enemy._id]: 1,
        }
      }

      console.log('battlelog', battlelog.killedMonsters)

      const lootedItem = getLootFromEnemy(battlelog.enemy.loot)

      if (lootedItem.id !== 0) {
        console.log('Loooted item', lootedItem)
        player.inventory.all.push(lootedItem.id)
        const item = await Item.findOne({ _id: lootedItem.id })
        battlelog.current.lootedItem = item
      }

      const isNewLevel =
        expNeededForLevel <= player.experience + battlelog.enemy.experience

      player.manaPoints = battlelog.current.playerManaPoints
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

      console.log('battlelog')

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
      player.manaPoints = battlelog.current.playerManaPoints
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
      battlelog.current.playerHealthPoints -
      (enemyAttack <= 0 ? 0 : enemyAttack)

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
  getBattlelog,
  startBattle,
  attackEnemy,
}
