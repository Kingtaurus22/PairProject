const { User } = require('../models')
const bcrypt = require('bcryptjs');

class Controller {
    static async getLogin(req, res) {
        try {
            const { message } = req.query
            res.render('login', { message })
        } catch (error) {
            res.send(error)
        }
    }

    static async postLogin(req, res) {
        try {
            const { email, password } = req.body

            let data = await User.findOne({
                where: {
                    email
                }
            })

            if (data) {
                const isValidPassword = bcrypt.compareSync(password, data.password)

                if (isValidPassword) {
                    req.session.userId = data.id
                    req.session.role = data.role

                    return res.redirect('/')
                } else {
                    return res.redirect('/login?message=Invalid password')
                }
            } else {
                return res.redirect('/login?message=Invalid email')
            }
        } catch (error) {
            res.send(error)
        }
    }

    static async getRegister(req, res) {
        try {
            res.render('register')
        } catch (error) {
            res.send(error)
        }
    }

    static async postRegister(req, res) {
        try {
            const { username, email, role, password } = req.body

            await User.create({
                username, email, role, password
            })

            res.redirect('/login');
        } catch (error) {
            res.send(error)
        }
    }

    static async logout(req, res) {
        try {
            req.session.destroy(function (err) {
                if (err) {
                    res.send(err)
                } else {
                    res.redirect('/login')
                }
            })
        } catch (error) {
            res.send(error)
        }
    }
}

module.exports = Controller