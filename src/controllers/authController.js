const bcrypt = require('bcrypt');  //bcrypt est une bibliothèque Node.js utilisée pour hachage et vérification sécurisée des mots de passe
const User = require('../models/User');

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
