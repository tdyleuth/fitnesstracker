const express = require('express');
const usersRouter = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');


const  { getAllUsers, getUserByUsername, createUser } = require('../db')

usersRouter.use((req, res, next) => {
    console.log("A request is being made to /users");

    next();
});

usersRouter.get('/', async (req, res) => {
    const users = await getAllUsers();
  
    res.send({
      users
    });
  });

//Log in the user (Require username and password)
usersRouter.post('/login', async (req, res, next) => {
    const { username, password } = req.body;
  
  
    if (!username || !password) {
      next({
        name: "MissingCredentialsError",
        message: "Please supply both a username and password"
      });
    }
  
    try {
      const user = await getUserByUsername(username);
      const hashedPassword = user.password;

      const { id } = user;

      bcrypt.compare(password, hashedPassword, function(err, passwordsMatch) {

      if (passwordsMatch) {
      
        const token = jwt.sign({ username, password, id }, process.env.JWT_SECRET, { expiresIn: '1w' });
  
        res.send({ message: "You're logged in!", token });
      } else {
        next({ 
          name: 'IncorrectCredentialsError', 
          message: 'Username or password is incorrect'
        });
      }
    });
    }
     catch(error) {
      console.log(error);
      next(error);
    }
  
  });


//Create new user (Require username and password)
usersRouter.post('/register', async (req, res, next) => {
    const { username, password, name } = req.body;
    const SALT_COUNT = 10;
  
    try {
      const userExist = await getUserByUsername(username);
  
      if (userExist) {
        next({
          name: 'UserExistsError',
          message: 'A user by that username already exists'
        });
      }

      if (password.length < 8) {
        next({
          name: 'PasswordLengthError',
          message: 'Password must be at least 8 characters'
        });
      }

      const hashedPassword = bcrypt.hash(password, SALT_COUNT);
        createUser({
          username,
          password:hashedPassword,
          name,
          });
  

      const token = jwt.sign({ 
         username
      }, process.env.JWT_SECRET, {
        expiresIn: '1w'
      });
  
      res.send({ 
        message: "Thank you for signing up!",
        token 
      });
    } catch ({ name, message }) {
      console.log(error)
      next({ name, message })
    } 
  });


  
module.exports = usersRouter;