const path = require('path');

const express = require('express');
var cors = require('cors')
const dotenv = require('dotenv');

// get config vars
dotenv.config(); //when process env gets defined

const sequelize = require('./util/database');
const User = require('./models/users');
const Expense = require('./models/expenses');
const Order = require('./models/orders');
const Forgotpassword = require('./models/forgotpassword');




const userRoutes = require('./routes/user')
const purchaseRoutes = require('./routes/purchase')
const resetPasswordRoutes = require('./routes/resetpassword')

const app = express();



app.use(cors());

// app.use(bodyParser.urlencoded());  ////this is for handling forms
app.use(express.json());  //this is for handling jsons

app.use('/user', userRoutes)


app.use('/purchase', purchaseRoutes)

app.use('/password', resetPasswordRoutes);

app.use((req, res) => {
    console.log('urlll', req.url);
    res.sendFile(path.join(__dirname, `public/${req.url}`));
})



User.hasMany(Expense);
Expense.belongsTo(User);

User.hasMany(Order);
Order.belongsTo(User);

User.hasMany(Forgotpassword);
Forgotpassword.belongsTo(User);
// console.log(process.env)
sequelize.sync()
    .then(() => {
        app.listen(3000);
    })
    .catch(err => {
        console.log(err);
    })

