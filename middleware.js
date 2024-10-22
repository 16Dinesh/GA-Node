module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        //redirectUrl 
        // req.session.redirectUrl = req.originalUrl;
        // req.flash("error", "You Must Be Logged In To Do Any Thing! ");
        return res.redirect("/")
    }
    next();
};



