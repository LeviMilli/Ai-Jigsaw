const express = require('express')
const router = express.Router()

// ℹ️ Handles password encryption
const bcrypt = require("bcrypt");


// Require the User model in order to interact with the database
const UserModel = require("../models/User.model");

// Require necessary (isLoggedOut and isLoggedIn) middleware in order to control access to specific routes

router.all('/', function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  next()
});

router.post('/signup', (req, res, next) => {
  const {username, email, password } = req.body;
  console.log(username, email, password);
   // -----SERVER SIDE VALIDATION ----------
  /* 
  if (!username || !email || !password) {
      res.status(500)
        .json({
          errorMessage: 'Please enter username, email and password'
        });
      return;  
  }
  const myRegex = new RegExp(/^[a-z0-9](?!.*?[^\na-z0-9]{2})[^\s@]+@[^\s@]+\.[^\s@]+[a-z0-9]$/);
  if (!myRegex.test(email)) {
      res.status(500).json({
        errorMessage: 'Email format not correct'
      });
      return;  
  }
  const myPassRegex = new RegExp(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})/);
  if (!myPassRegex.test(password)) {
    res.status(500).json({
      errorMessage: 'Password needs to have 8 characters, a number and an Uppercase alphabet'
    });
    return;  
  }
  */

  // NOTE: We have used the Sync methods here. 
  // creating a salt 
  let salt = bcrypt.genSaltSync(10);
  let hash = bcrypt.hashSync(password, salt);
  UserModel.create({username: username, email, password: hash})
    .then((user) => {
      // ensuring that we don't share the hash as well with the user
      user.password = "***";
      res.status(200).json(user);
    })
    .catch((err) => {
      if (err.code === 11000) {
        res.status(500).json({
          errorMessage: 'username or email entered already exists!',
          message: err,
        });
      } 
      else {
        res.status(500).json({
          errorMessage: 'Something went wrong! Go to sleep!',
          message: err,
        });
      }
    })
});

  //   ! This use case is using a regular expression to control for special characters and min length
  /*
  const regex = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}/;
  if (!regex.test(password)) {
    return res.status(400).json( {
      errorMessage:
        "Password needs to have at least 8 chars and must contain at least one number, one lowercase and one uppercase letter.",
    });
  }
  */
  router.post('/signin', (req, res) => {
    const {email, password } = req.body;

    // -----SERVER SIDE VALIDATION ----------
    /*
    if ( !email || !password) {
        res.status(500).json({
            error: 'Please enter Username. email and password',
       })
      return;  
    }
    const myRegex = new RegExp(/^[a-z0-9](?!.*?[^\na-z0-9]{2})[^\s@]+@[^\s@]+\.[^\s@]+[a-z0-9]$/);
    if (!myRegex.test(email)) {
        res.status(500).json({
            error: 'Email format not correct',
        })
        return;  
    }
    */

    // Find if the user exists in the database 
    UserModel.findOne({email})
      .then((userData) => {
        console.log(userData)
           //check if passwords match
          let doesItMatch = bcrypt.compareSync(password, userData.password)
          //if it matches
          if (doesItMatch) {
            // req.session is the special object that is available to you
            userData.password = "***";
            req.session.loggedInUser = userData;
            res.status(200).json(userData)
          }
          //if passwords do not match
          else {
              res.status(500).json({
                  error: 'Passwords don\'t match',
              })
            return; 
          }
      })
      //throw an error if the user does not exists 
      .catch((err) => {
        res.status(500).json({
            error: 'Email does not exist',
            message: err
        })
        return;  
      });
  
});

// will handle all POST requests to http:localhost:5005/api/logout
router.get('/logout', (req, res) => {
  req.session.destroy();
    // Nothing to send back to the user
    res.status(200).json({});
})


const isLoggedIn = (req, res, next) => {  
  if (req.session.loggedInUser) {
      //calls whatever is to be executed after the isLoggedIn function is over
      next()
  }
  else {
      res.status(401).json({
          message: 'Unauthorized user',
          code: 401,
      })
  };
};


router.get("/user", isLoggedIn, (req, res, next) => {
  res.status(200).json(req.session.loggedInUser);
});

 
module.exports = router;