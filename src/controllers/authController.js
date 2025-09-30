const bcrypt = require('bcryptjs');
const { User } = require('../../models');



const showLogin = (req, res) => res.render('auth/login');
const showRegister = (req, res) => res.render('auth/register');

const login = async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ where: { name: username } });
        if (!user) {
            const hash = await bcrypt.hash('Nizar2005nizar', 10);
            console.log(hash);
            return res.render('auth/login', { error: 'Invalid credentials' });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.render('auth/login', { error: 'Invalid credentials' });
        }
        req.session.userId = user.id;
        req.session.userRole = user.role;
        req.session.userPassword = user.password;

        res.json({ 
            message: 'Login successful',
            session: {
                userId: req.session.userId,
                userRole: req.session.userRole,
                userPassword: req.session.userPassword
            }
        });
    } catch (err) {
        console.error(err);
        res.render('auth/login', { error: 'Something went wrong' });
    }
}

module.exports = { showLogin, showRegister, login };