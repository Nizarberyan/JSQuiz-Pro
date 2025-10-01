
const bcrypt = require('bcryptjs'); 3
const {User} = require('../../models');

const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // anarza ma thin l user nir la 
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'Email déjà utilisé' });
    }

    // Hash du mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    // Création de l'utilisateur
    const user = await User.create({
      name: username,
      email: email,
      password: hashedPassword
    });

    return res.status(201).json({
      message: 'Utilisateur créé avec succès',
      user: {
        id: user.id,
        username: user.username,
        email: user.email
      }
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
};

const showLogin = (req, res) => res.render('auth/login');
const showRegister = (req, res) => res.render('auth/register');

const login = async (req, res) => {
    console.log(req.body);
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

function logout(req, res) {
    req.session.destroy((err) => {
        if (err) {
            console.error('Error destroying session:', err);
            return res.status(500).send('Error logging out');
        }

        res.clearCookie('connect.sid'); // I need to Replace 'connect.sid' with my session cookie name
        res.send('Logged out successfully');
    });
}

module.exports = { showLogin, showRegister, login, register, logout };
