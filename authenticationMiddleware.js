function requireLogin(req, res, next) {
    if (req.session.userId) {
        // User is logged in, proceed to the next middleware
        next();
    } else {
        // User is not logged in, redirect to the login page
        res.redirect('/login');
    }
}

export default requireLogin;

