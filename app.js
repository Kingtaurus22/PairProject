const express = require("express");
const app = express();
const port = 3000;
const routes = require("./routes");
const session = require('express-session')

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
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

app.use("/", routes);

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
