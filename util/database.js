const Sequelize = require('sequelize')

// const pool = mysql.createPool({
//     host: 'localhost',
//     user: 'root',
//     database: 'nodetutorial',
//     password: 'apple@17'
// });

const sequelize = new Sequelize(process.env.DB_Name || 'ExpenseTracker', process.env.DB_USERNAME || 'root', process.env.DB_PASSWORD || 'apple@17',{
    dialect: 'mysql',
    host: process.env.DB_HOST || 'localhost'
})

module.exports = sequelize;
