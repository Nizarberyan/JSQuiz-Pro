const authRoutes = require('./src/routes/auth');
const questionRoutes = require('./src/routes/questions');
const scoreRoutes = require('./src/routes/scores');
const express = require('express');
const app = express();

app.set('view engine', 'ejs');
app.set('views', './views');
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const session = require('express-session');
app.use(session({
    secret: process.env.SESSION_SECRET || 'jsquiz-dev-secret-key',
    resave: false,
    saveUninitialized: false
}));


app.get('/', (req, res) => {
    res.render('index');
});

app.use('/auth', authRoutes);
app.use('/questions', questionRoutes);
app.use('/scores', scoreRoutes);

app.listen(3000, () => {
    console.log('Server running on port 3000');
});
