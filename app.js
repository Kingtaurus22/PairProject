const express = require('express');
const Controller = require('./controllers/controller');
const app = express()
const port = 3000
const session = require('express-session')

app.set('view engine', 'ejs')
app.use(express.urlencoded({ extended: false }))
app.use(express.static("css"));

// SESSION
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false,
        sameSite: true
    }
}))

// AUTH
app.get('/login', Controller.getLogin)
app.post('/login', Controller.postLogin)
app.get('/register', Controller.getRegister)
app.post('/register', Controller.postRegister)

// MIDDLEWARE
app.use((req, res, next) => {

    if (!req.session.userId) {
        res.redirect('/login?message=You must be login first!')
    } else {
        next();
    }
});

// LOGOUT
app.post('/logout', Controller.logout)

const isCustomer = function (req, res, next) {

    if (req.session.userId && req.session.role !== 'customer') {
        res.redirect('/?message=You have no access!')
    } else {
        next()
    }
}

// HOME
app.get('/', (req, res) => {
    res.send('ini home!')
})

app.get('/order', isCustomer, (req, res) => {
    const { message } = req.query
    res.send('ini order!')
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})