import User from '../models/users.js';
import bcrypt from 'bcrypt';

const editUser = async (req, res) => {
    const { selectUser, newUsername, newPassword, confirmNewPassword } = req.body;

    if (newPassword !== confirmNewPassword) {
        req.flash('error', 'Password mismatch');
        res.json({ success: false, message: 'Password mismatch' });
    } 
    else {
        try {
            const user = await User.findOne({ username: selectUser });

            if (!user) {
                req.flash('error', 'User not found');
                res.json({ success: false, message: 'User not found' });
                return;
            }

            // Generate salt and hash the new password
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(newPassword, salt);

            // Update the user document in the database
            user.username = newUsername;
            user.password = hashedPassword;
            user.updated_at = new Date();
            await user.save();

            req.flash('success', 'User updated successfully');
            res.json({ success: true, message: 'User updated successfully' });
        } 
        catch (err) {
            console.error('Error updating user:', err);
            req.flash('error', 'Error updating user');
            res.json({ success: false, message: 'Error updating user' });
        }
    }
};

export default editUser;
