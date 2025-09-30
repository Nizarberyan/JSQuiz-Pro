function ensureAdmin(req, res, next) {
    if (req.session && req.session.userRole === 'admin') {
        return next();
    }
    res.status(403).send('Forbidden');
}

module.exports = { ensureAdmin };
