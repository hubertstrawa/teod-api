const getLootFromEnemy = (items) => {
  let filler = items
    .map((r) => r.chance)
    .reduce((sum, current) => sum + current)

  if (filler <= 0) {
    console.log('chances sum is higher than 100!')
    return
  }

  let probability = items
    .map((r, i) => Array(r.chance === 0 ? filler : r.chance).fill(i))
    .reduce((c, v) => c.concat(v), [])

  let pIndex = Math.floor(Math.random() * 100)
  let rarity = items[probability[pIndex]]

  return rarity
}

module.exports = getLootFromEnemy
