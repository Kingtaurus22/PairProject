const express = require('express');
const Controller = require('./controllers/controller');
const app = express()
const port = 3000

app.set('view engine', 'ejs')
app.use(express.urlencoded({ extended: false }))
app.use(express.static("css"));

app.get('/', (req, res) => {
    res.send('Hello World!')
})
app.get('/login', Controller.getLogin)
app.post('/login', Controller.postLogin)
app.get('/register', Controller.getRegister)
app.post('/register', Controller.postRegister)
app.post('/logout', Controller.logout)

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})