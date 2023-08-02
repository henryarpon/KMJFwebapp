import User from './models/users.js'; // Replace with the correct path to your User model

async function requireAdmin(req, res, next) {
    if (req.session.userId) {
        try {
            // Check if the user is logged in
            const user = await User.findById(req.session.userId);
            if (user && user.user_type === 'admin') {
                // User is logged in and is an admin, proceed to the next middleware
                next();
            } else {
                // User is not logged in or is not an admin, redirect to the login page or show an error page
                // res.status(403).send('Access forbidden');
                res.render('private_views/restricted');
            }
        } catch (error) {
            console.error('Error:', error);
            res.status(500).json({ success: false, message: 'An error occurred' });
        }
    } else {
        // User is not logged in, redirect to the login page
        res.redirect('/login');
    }
}

export default requireAdmin;
