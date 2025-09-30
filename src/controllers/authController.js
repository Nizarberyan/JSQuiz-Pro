const bcrypt = require('bcryptjs');  //bcrypt est une bibliothèque Node.js utilisée pour hachage et vérification sécurisée des mots de passe
const User = require('../../models');

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
      username,
      email,
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

module.exports = { register };




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
