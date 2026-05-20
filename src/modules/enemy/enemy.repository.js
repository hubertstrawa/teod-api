import Enemy from '../../../models/Enemy.js'

export const createEnemyRepository = ({ enemyModel = Enemy } = {}) => {
  const findEnemiesByLocation = (location) => enemyModel.find({ location })
  const findEnemyById = (enemyId) => enemyModel.findOne({ _id: enemyId })

  return {
    findEnemiesByLocation,
    findEnemyById,
  }
}

const enemyRepository = createEnemyRepository()
export default enemyRepository
