import bcrypt from 'bcrypt';
import User from '../models/users.js';

const addUser = async (req, res) => {
  
    const { username, emailAddress, userType, password, confirmPassword } = req.body;

    if (userType !== 'admin' && userType !== 'basic-user') {
        
        req.flash('error', 'Invalid user type');
        return res.json({ success: false, message: 'Invalid user type' });
    };

    if (password !== confirmPassword) {
        req.flash('error', 'Password mismatch');
        res.json({ success: false, message: 'Password mismatch' });
    } 
    else {
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

            req.flash('success', 'User added successfully');
            res.json({ success: true, message: 'User added successfully' });
        } 
        catch (err) {
            
            console.error('Error adding user:', err);
            req.flash('error', 'Error adding user');
            res.json({ success: false, message: 'Error adding user' });
        }
    }
}

export default addUser;
