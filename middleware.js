module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        //redirectUrl 
        req.session.redirectUrl = req.originalUrl;
        req.flash("error", "You Must Be Logged In To Do Any Thing! ");
        return res.redirect("/")
    }
    next();
};

module.exports.saveRedirectUrl = (req,res,next) => {
    if(req.session.redirectUrl) {
        res.locals.redirectUrl = req.session.redirectUrl;
    }
    next();
};

module.exports.isAdmin = (req, res, next) => {
    if (req.isAuthenticated() && req.user.isAdmin) {
        return next();
    }
    req.flash("error", "You do not have permission to access this page.");
    res.redirect("/");
};

module.exports.adminLogout = (req, res, next) => {
    req.logout((err) => {
        if (err) {
            return next(err);
        }
        req.flash("done", "You have logged out successfully.");
        res.redirect("/");
    });
};

