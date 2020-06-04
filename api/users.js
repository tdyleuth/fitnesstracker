const express = require('express');
const usersRouter = express.Router();
const jwt = require('jsonwebtoken');

const  { getAllUsers, getUserByUsername } = require('../db')

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

      const { id } = user;

      if (user && user.password == password) {
      
        const token = jwt.sign({ username, password, id }, process.env.JWT_SECRET, { expiresIn: '1h' });
  
        res.send({ message: "You're logged in!", token });
      } else {
        next({ 
          name: 'IncorrectCredentialsError', 
          message: 'Username or password is incorrect'
        });
      }
    } catch(error) {
      console.log(error);
      next(error);
    }
  });
  
module.exports = usersRouter;