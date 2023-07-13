
import bcrypt from 'bcrypt';
import User from '../models/users.js';

async function loginHandler(req, res) {
    const { username, password } = req.body;

    try {
        // Find the user by username
        const user = await User.findOne({ username });
    
        if (!user) {
            req.flash('error', 'Invalid username or password');
            return res.json({ success: false, message: 'User not found' });
        }
        // Compare the password using bcrypt
        const passwordMatch = await bcrypt.compare(password, user.password);

        if (passwordMatch) {
            // Store the user's ID in the session
            req.session.userId = user._id;
            req.session.username = user.username;

            // Redirect to the private page (e.g., dashboard)
            return res.json({ success: true, redirectUrl: '/dashboard' });
        } else {
            req.flash('error', 'Invalid username or password');
            return res.json({ success: false, message: 'Invalid username or password' });
        }
    } catch (error) {
        req.flash('error', 'An error occurred');
        return res.json({ success: false, message: 'An error occurred' });
    }
}

export default loginHandler;
