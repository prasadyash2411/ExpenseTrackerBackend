const Sequelize = require('sequelize')

// const pool = mysql.createPool({
//     host: 'localhost',
//     user: 'root',
//     database: 'nodetutorial',
//     password: 'apple@17'
// });
// console.log(process.env)
const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USERNAME, process.env.DB_PASSWORD,{
    dialect: 'mysql',
    host: process.env.DB_HOST
})

module.exports = sequelize;
