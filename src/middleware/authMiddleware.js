function insureAuth(req, res, next) {
    if (req.session && req.session.user) {
        next()
    } else {
        res.redirect('/auth/login')
    }
}
function  insureGuest(req, res, next) {
    if (!req.session || !req.session.user) {
        res.redirect('/')
    } else {
        next()
    }
}
module.exports = {
    insureAuth,
    insureGuest
}