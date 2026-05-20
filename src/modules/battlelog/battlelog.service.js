import ApiError from '../../shared/errors/ApiError.js'
import getLootFromEnemy from '../../../utils/getLootFromEnemy.js'
import battlelogRepository from './battlelog.repository.js'

const getRandomIntMinMax = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1) + min)
}

const calculateProbability = (number) => {
  const probability = number / 1000
  return Math.random() <= probability
}

const normalizeEnemyLoot = (loot = []) =>
  loot.map((entry) => ({
    chance: entry.chance ?? 0,
    itemId: entry.itemId ?? entry.id ?? null,
  }))

const mapEnemyToBattleState = (enemyDoc) => ({
  _id: enemyDoc._id,
  name: enemyDoc.name ?? 'Unknown enemy',
  image: enemyDoc.image ?? null,
  type: enemyDoc.type ?? 'normal',
  monsterType: enemyDoc.monsterType ?? 'normal',
  power: enemyDoc.power ?? 0,
  health_points: enemyDoc.health_points ?? 0,
  max_health_points: enemyDoc.max_health_points ?? enemyDoc.health_points ?? 0,
  experience: enemyDoc.experience ?? 0,
  maxMoney: enemyDoc.maxMoney ?? 0,
  loot: normalizeEnemyLoot(enemyDoc.loot ?? []),
})

const toKilledMonstersObject = (killedMonstersMap) => {
  if (!killedMonstersMap) {
    return {}
  }

  if (killedMonstersMap instanceof Map) {
    return Object.fromEntries(killedMonstersMap)
  }

  return killedMonstersMap
}

export const createBattlelogService = ({ repository = battlelogRepository } = {}) => {
  const getBattlelog = async ({ playerId }) => {
    const battlelog = await repository.findBattlelogByPlayerId(playerId)

    if (!battlelog) {
      throw ApiError.badRequest('Nie udalo sie pobrac battlelog')
    }

    return {
      data: toKilledMonstersObject(battlelog.killedMonsters),
    }
  }

  const getFullBattlelog = async ({ playerId }) => {
    const battlelog = await repository.findBattlelogByPlayerId(playerId)

    if (!battlelog) {
      throw ApiError.badRequest('Nie udalo sie pobrac battlelog')
    }

    return { data: battlelog }
  }

  const startBattle = async ({ playerId, enemyId }) => {
    if (!enemyId) {
      throw ApiError.badRequest('Brak przeciwnika / no enemy id')
    }

    const battlelog = await repository.findBattlelogByPlayerId(playerId)
    if (!battlelog) {
      throw ApiError.badRequest('No battlelog found')
    }

    if (battlelog.current?.status === 'in_progress' && !battlelog.current?.isOver) {
      throw ApiError.badRequest('Aktualna walka nie została jeszcze zakończona')
    }

    const player = await repository.findPlayerWithInventoryById(playerId)

    if (!player) {
      throw ApiError.badRequest('Nie udalo sie pobrac danych o walce')
    }

    if (player.energy < 5) {
      throw ApiError.badRequest('Nie masz energii')
    }
    if (player.healthPoints <= 0) {
      throw ApiError.badRequest('Nie masz HP')
    }

    if (player.activeJob) {
      throw ApiError.badRequest('Zakończ lub przerwij poszukiwania, aby móc walczyć')
    }

    const eqPlayerAttack = Object.keys(player.inventory.eq).reduce((acc, curr) => {
      return player.inventory.eq[curr]?.attack ? acc + player.inventory.eq[curr].attack : acc
    }, 5)

    const eqPlayerDefense = Object.keys(player.inventory.eq).reduce((acc, curr) => {
      return player.inventory.eq[curr]?.defense ? acc + player.inventory.eq[curr].defense : acc
    }, 0)

    const currentEnemy = await repository.findEnemyById(enemyId)
    if (!currentEnemy) {
      throw ApiError.badRequest('Brak przeciwnika / no enemy found')
    }

    if (currentEnemy.monsterType === 'boss') {
      if (battlelog?.availableBoss?.toString() !== enemyId?.toString()) {
        throw ApiError.badRequest('Nie mozna walczyc z bossem')
      }
      battlelog.availableBoss = null
    }

    battlelog.current = {
      status: 'in_progress',
      playerHealthPoints: player.healthPoints,
      playerManaPoints: player.manaPoints,
      playerMaxHealthPoints: player.maxHealthPoints,
      playerMaxManaPoints: player.maxManaPoints,
      playerLevel: player.level,
      playerSpells: [],
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
    battlelog.enemy = mapEnemyToBattleState(currentEnemy)
    await repository.saveBattlelog(battlelog)

    return {
      data: {
        message: 'Walka rozpoczęta',
        enemy: {
          health_points: currentEnemy.health_points,
          max_health_points: currentEnemy.max_health_points,
          name: currentEnemy.name,
          image: currentEnemy.image,
          type: currentEnemy.type,
        },
      },
    }
  }

  const attackEnemy = async ({ playerId, spell }) => {
    const battlelog = await repository.findBattlelogByPlayerId(playerId)
    const player = await repository.findPlayerById(playerId)

    if (!battlelog || !player || !spell || !battlelog.enemy || !battlelog.current) {
      throw ApiError.badRequest('Nie udalo sie zaatakowac')
    }

    if (battlelog.current.status !== 'in_progress' || battlelog.current.isOver) {
      throw ApiError.badRequest('Nie ma aktywnej walki do wykonania ataku')
    }

    const { eqPlayerAttack, eqPlayerDefense, playerLevel, playerAttributes } = battlelog.current

    let playerAttackValue
    let playerCritical = null

    if (spell.spellType === 'normal') {
      playerAttackValue = getRandomIntMinMax(
        eqPlayerAttack + playerAttributes.eqStrength + playerAttributes.strength - 3,
        eqPlayerAttack + playerAttributes.eqStrength + playerAttributes.strength + 3
      )

      if (calculateProbability(playerAttributes.accuracy)) {
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
        throw ApiError.badRequest('Nie masz wystarczająco many')
      }
      battlelog.current.playerManaPoints = battlelog.current.playerManaPoints - 10
      const enemyType = battlelog.enemy.type ?? ''
      const isEffective = enemyType.includes('bug')
      const isResistant = enemyType.includes('fire') || enemyType.includes('water')

      const findSpell = player.spells.find((el) => el.name === 'Ogniste uderzenie')

      let [min, max] = [
        findSpell.power + playerAttributes.eqIntelligence + playerAttributes.intelligence - 2,
        findSpell.power + playerAttributes.eqIntelligence + playerAttributes.intelligence + 5,
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

      if (calculateProbability(playerAttributes.accuracy)) {
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
        throw ApiError.badRequest('Nie masz wystarczająco many')
      }
      battlelog.current.playerManaPoints = battlelog.current.playerManaPoints - 15
      const enemyType = battlelog.enemy.type ?? ''
      const isEffective = enemyType.includes('water')
      const isResistant = enemyType.includes('electric') || enemyType.includes('fire')

      const findSpell = player.spells.find((el) => el.name === 'Błyskawica')

      let [min, max] = [
        findSpell.spellLevel +
          Math.round(playerAttributes.intelligence + playerAttributes.eqIntelligence / 2),
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

      if (calculateProbability(playerAttributes.accuracy)) {
        playerCritical = true
        playerAttackValue = playerAttackValue * 10
      }
    }

    battlelog.current.playerAttackType = spell.spellType
    battlelog.current.playerAttackValue = playerAttackValue

    const lastHit = playerAttackValue >= battlelog.enemy.health_points
    if (lastHit || battlelog.enemy.health_points <= 0) {
      battlelog.enemy.health_points = 0
      battlelog.current.enemyAttack = null
      battlelog.current.isOver = true
      battlelog.current.status = 'won'
      const expNeededForLevel = playerLevel * (playerLevel + 1) * 100

      const goldEarned = getRandomIntMinMax(
        battlelog.enemy.maxMoney / 2,
        battlelog.enemy.maxMoney
      )

      const expEarned =
        battlelog.enemy.experience - (playerLevel + 3) <= 0
          ? 0
          : battlelog.enemy.experience - (playerLevel + 3)

      battlelog.current.gainedExp = expEarned
      battlelog.current.gainedGold = goldEarned

      const enemyKey = battlelog.enemy._id.toString()
      const currentKills = battlelog.killedMonsters.get(enemyKey) ?? 0
      battlelog.killedMonsters.set(enemyKey, currentKills + 1)

      const enemyLoot = Array.isArray(battlelog.enemy.loot) ? battlelog.enemy.loot : []
      const lootedItem = enemyLoot.length > 0 ? getLootFromEnemy(enemyLoot) : null
      const lootedItemId = lootedItem?.itemId ? String(lootedItem.itemId) : null

      if (lootedItemId && lootedItemId !== '0') {
        player.inventory.all.push(lootedItemId)
        const item = await repository.findItemById(lootedItemId)
        if (item) {
          battlelog.current.lootedItem = {
            _id: item._id,
            name: item.name,
            image: item.image,
            state: item.state,
            type: item.type,
            attack: item.attack ?? null,
            defense: item.defense ?? null,
            value: item.value ?? null,
          }
        }
      }

      const isNewLevel = expNeededForLevel <= player.experience + battlelog.enemy.experience

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

      await repository.savePlayer(player)
      const savedDoc = await repository.saveBattlelog(battlelog)
      return {
        data: savedDoc,
        temp: { playerCritical },
        isNewLevel: isNewLevel ? `Awansowano na nowy poziom ${player.level}!` : null,
      }
    }

    battlelog.enemy.health_points = Math.max(
      0,
      battlelog.enemy.health_points - playerAttackValue
    )

    let enemyAttack = getRandomIntMinMax(
      battlelog.enemy.power - eqPlayerDefense - 3,
      battlelog.enemy.power - eqPlayerDefense + 3
    )

    let playerDodge = null
    if (calculateProbability(playerAttributes.agility)) {
      enemyAttack = 0
      playerDodge = true
    }

    if (enemyAttack <= 0) battlelog.current.enemyAttack = 0
    const lastEnemyHit = enemyAttack >= battlelog.current.playerHealthPoints

    if (lastEnemyHit || battlelog.current.playerHealthPoints <= 0) {
      battlelog.current.playerHealthPoints = 0
      battlelog.current.isOver = true
      battlelog.current.status = 'lost'

      player.healthPoints = 0
      player.manaPoints = battlelog.current.playerManaPoints
      player.energy = player.energy - 5

      await repository.savePlayer(player)

      const savedDoc = await repository.saveBattlelog(battlelog)
      return {
        message: 'Walka przegrana',
        data: savedDoc,
      }
    }

    battlelog.current.enemyAttack = enemyAttack
    battlelog.current.playerHealthPoints =
      battlelog.current.playerHealthPoints - (enemyAttack <= 0 ? 0 : enemyAttack)
    battlelog.current.status = 'in_progress'
    battlelog.current.turn = battlelog.current.turn + 1

    const savedDoc = await repository.saveBattlelog(battlelog)
    return {
      data: savedDoc,
      temp: { playerDodge, playerCritical },
    }
  }

  const getEnemyPlayerData = async ({ playerId }) => {
    const battlelog = await repository.findBattlelogWithEnemyPvpByPlayerId(playerId)
    const player = await repository.findPlayerSanitizedById(playerId)

    if (!battlelog || !player) {
      throw ApiError.badRequest('Nie udalo sie pobrac danych')
    }

    battlelog.pvp.pvpEnemyData = { ...battlelog.pvp.pvpEnemyPlayerName }
    battlelog.pvp.current = { ...player }
    battlelog.markModified('pvpEnemyData')
    await repository.saveBattlelog(battlelog)

    return { data: battlelog.pvp }
  }

  return {
    getBattlelog,
    getFullBattlelog,
    startBattle,
    attackEnemy,
    getEnemyPlayerData,
  }
}

const battlelogService = createBattlelogService()
export default battlelogService
