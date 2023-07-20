import User from '../models/users.js';

const deleteUser = async (req, res) => {
  try {
    const { selectUserDelete } = req.body;
    const deletedUser = await User.deleteOne({ username: selectUserDelete });

    if (deletedUser.deletedCount === 1) {
      console.log('User deleted successfully');
      res.json({ success: true, message: 'User deleted successfully' });
    } else {
      console.log('User not found');
      res.json({ success: false, message: 'User not found' });
    }
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, message: 'An error occurred' });
  }
};

export default deleteUser;
