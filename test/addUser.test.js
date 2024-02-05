import chai from 'chai';
import chaiHttp from 'chai-http';
import app from '../index.js';
import User from '../models/users.js';

chai.use(chaiHttp);
const expect = chai.expect;

describe('addUser function', () => {
  // Test 1: Add a new user successfully
  it('should add a new user successfully', async () => {
    const response = await chai
      .request(app)
      .post('/addUser')
      .send({
        username: 'testuser',
        emailAddress: 'testuser@example.com',
        userType: 'admin',
        password: 'password123',
        confirmPassword: 'password123',
      });

    expect(response).to.have.status(200);
    expect(response.body).to.have.property('success', true);
    expect(response.body).to.have.property('message', 'User added successfully');
  });

  // Test 2: Handle password mismatch
  it('should handle password mismatch', async () => {
    const response = await chai
      .request(app)
      .post('/addUser')
      .send({
        username: 'testuser',
        emailAddress: 'testuser@example.com',
        userType: 'admin',
        password: 'password123',
        confirmPassword: 'mismatchedpassword',
      });

    expect(response).to.have.status(200);
    expect(response.body).to.have.property('success', false);
    expect(response.body).to.have.property('message', 'Password mismatch');
  });

  // Test 3: User type validation
  it('should handle invalid user types', async () => {
    const response = await chai
      .request(app)
      .post('/addUser')
      .send({
        username: 'testuser',
        emailAddress: 'testuser@example.com',
        userType: 'invalidType',
        password: 'password123',
        confirmPassword: 'password123',
      });

    expect(response).to.have.status(200); 
    expect(response.body).to.have.property('success', false);
    expect(response.body).to.have.property('message', 'Invalid user type');
    
  });

  // Test 4: Password hashing and salting
  it('should hash and salt the password', async () => {
    const response = await chai
      .request(app)
      .post('/addUser')
      .send({
        username: 'testuser',
        emailAddress: 'testuser@example.com',
        userType: 'admin',
        password: 'password123',
        confirmPassword: 'password123',
      });

    expect(response).to.have.status(200);
    expect(response.body).to.have.property('success', true);
    expect(response.body).to.have.property('message', 'User added successfully');
    
    const userInDatabase = await User.findOne({ username: 'testuser' });
    expect(userInDatabase).to.exist;
    expect(userInDatabase.password).to.not.equal('password123'); // Password should be hashed
    expect(userInDatabase.salt).to.exist; // Salt should be stored
  });
});
