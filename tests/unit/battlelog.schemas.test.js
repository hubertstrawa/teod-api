import test from 'node:test'
import assert from 'node:assert/strict'
import battlelogSchemas from '../../src/modules/battlelog/battlelog.schemas.js'

test('battlelog attackEnemy schema allows normal attack without spell name', async () => {
  const parsed = await battlelogSchemas.attackEnemy.body.parseAsync({
    spell: {
      spellType: 'normal',
    },
  })

  assert.equal(parsed.spell.spellType, 'normal')
  assert.equal(parsed.spell.name, undefined)
})

test('battlelog attackEnemy schema allows extra spell fields for magic attack', async () => {
  const parsed = await battlelogSchemas.attackEnemy.body.parseAsync({
    spell: {
      name: 'Ogniste uderzenie',
      spellType: 'fire',
      spellLevel: 1,
      power: 25,
      manaCost: 10,
      possibleEveryTurn: 1,
      minIntelligence: 10,
      _id: '69fda19205b6e289f20d5a3d',
    },
  })

  assert.equal(parsed.spell.spellType, 'fire')
  assert.equal(parsed.spell.name, 'Ogniste uderzenie')
  assert.equal(parsed.spell.spellLevel, 1)
})

test('battlelog attackEnemy schema rejects missing spell name for magic attack', async () => {
  await assert.rejects(
    battlelogSchemas.attackEnemy.body.parseAsync({
      spell: {
        spellType: 'fire',
      },
    })
  )
})
