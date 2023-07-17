import bcrypt from 'bcrypt';
import User from '../models/users.js';

async function addUserHandler(req, res) {
    const username = req.body.username;
    const emailAddress = req.body.email;
    const userType = req.body.userType;
    const password = req.body.password;
    const confirmPassword = req.body.confirmPassword;

    if (password !== confirmPassword) {
        console.log('password mismatch')
        req.flash('error', 'Password mismatch');
        res.json({ success: false, message: 'Password mismatch' });
    } else {
        console.log('password match');

        try {
            // Generate salt and hash the password
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            // Create the document and add it to the database
            const newUser = await User.create({
                username: username,
                email_address: emailAddress,
                user_type: userType,
                salt: salt,
                password: hashedPassword,
                created_at: new Date(),
                updated_at: new Date()
            });

            console.log('User added successfully');
            req.flash('success', 'User added successfully');
            res.json({ success: true, message: 'User added successfully' });
        } catch (err) {
            console.error('Error adding user:', err);
            req.flash('error', 'Error adding user');
            res.json({ success: false, message: 'Error adding user' });
        }
    }
}

export default addUserHandler;
