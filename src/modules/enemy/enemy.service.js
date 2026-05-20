import enemyRepository from './enemy.repository.js'

export const createEnemyService = ({ repository = enemyRepository } = {}) => {
  const getEnemies = async ({ location }) => {
    const enemies = await repository.findEnemiesByLocation(location)
    return { data: enemies }
  }

  const getSingleEnemy = async ({ enemyId }) => {
    const enemy = await repository.findEnemyById(enemyId)
    return { data: enemy }
  }

  return { getEnemies, getSingleEnemy }
}

const enemyService = createEnemyService()
export default enemyService
