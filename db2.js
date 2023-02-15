const Pool = require('pg').Pool

const pool = new Pool({
  user: 'postgres',
  password: 'jmh8vfmd',
  host: 'localhost',
  port: 5432,
  database: 'game',
})

module.exports = pool
