const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
var cors = require('cors')
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const sequelize = require('./util/database');
const User = require('./models/users');
const Expense = require('./models/expenses');

const app = express();
const dotenv = require('dotenv');

// get config vars
dotenv.config();


app.use(cors());

// app.use(bodyParser.urlencoded());  ////this is for handling forms
app.use(express.json());  //this is for handling jsons


app.get('/user/signup', (req, res)=>{
    const { name, email, password } = req.body;
    const saltRounds = 10;
    bcrypt.genSalt(saltRounds, function(err, salt) {
        bcrypt.hash(password, salt, function(err, hash) {
            // Store hash in your password DB.
            if(err){
                console.log('Unable to create new user')
                res.json({message: 'Unable to create new user'})
            }
            User.create({ name, email, password: hash }).then(() => {
                res.status(201).json({message: 'Successfuly create new user'})
            }).catch(err => {
                res.status(403).json(err);
            })

        });
    });
} );

function generateAccessToken(id) {
    return jwt.sign(id ,process.env.TOKEN_SECRET);
}

app.post('/user/login', (req, res) => {
    const { email, password } = req.body;
    console.log(password);
    User.findAll({ where : { email }}).then(user => {
        if(user.length > 0){
            bcrypt.compare(password, user[0].password, function(err, response) {
                if (err){
                console.log(err)
                return res.json({success: false, message: 'Something went wrong'})
                }
                if (response){
                    console.log(JSON.stringify(user))
                    const jwttoken = generateAccessToken(user[0].id);
                    res.json({token: jwttoken, success: true, message: 'Successfully Logged In'})
                // Send JWT
                } else {
                // response is OutgoingMessage object that server response http request
                return res.status(401).json({success: false, message: 'passwords do not match'});
                }
            });
        } else {
            return res.status(404).json({success: false, message: 'passwords do not match'})
        }
    })
})

const authenticate = (req, res, next) => {

    try {
        const token = req.header('authorization');
        console.log(token);
        const userid = Number(jwt.verify(token, process.env.TOKEN_SECRET));
        User.findByPk(userid).then(user => {
            console.log(JSON.stringify(user));
            req.user = user;
            next();
        }).catch(err => { throw new Error(err)})

      } catch(err) {
        console.log(err);
        return res.status(401).json({success: false})
        // err
      }

}

app.post('/user/addexpense', authenticate, (req, res) => {
    const { expenseamount, description, category } = req.body;
    console.log('req.user>>>>', JSON.stringify(req.user))
    req.user.createExpense({ expenseamount, description, category }).then(expense => {
        return res.status(201).json({expense, success: true } );
    }).catch(err => {
        return res.status(403).json({success : false, error: err})
    })
})

app.get('/user/getexpenses', authenticate, (req, res)=> {

    req.user.getExpenses().then(expenses => {
        return res.status(200).json({expenses, success: true})
    })
    .catch(err => {
        return res.status(402).json({ error: err, success: false})
    })
})

app.delete('/user/deleteexpense/:expenseid', authenticate, (req, res) => {
    const expenseid = req.params.expenseid;
    Expense.destroy({where: { id: expenseid }}).then(() => {
        return res.status(204).json({ success: true, message: "Deleted Successfuly"})
    }).catch(err => {
        console.log(err);
        return res.status(403).json({ success: true, message: "Failed"})
    })
})

User.hasMany(Expense);
Expense.belongsTo(User);


sequelize.sync()
    .then(() => {
        app.listen(3000);
    })
    .catch(err => {
        console.log(err);
    })
