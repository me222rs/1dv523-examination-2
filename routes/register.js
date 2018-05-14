/*jshint esversion: 6 */
const router = require("express").Router();
var User = require("../models/user.js");
var bcrypt = require("bcrypt-nodejs");

var usernameRegex = /^[a-zA-Z0-9]{3,15}$/; // Whitelisted a-z, A-Z characters and numbers 0-9. Must also be between 3-15 characters long.
var passwordRegex = /^.{8,}$/; // Password whitelist all characters and must be at least 8 characters long
// User registration
router.route("/register/")
    .get((req, res) => {
      //Checks if the there is a logged in user. If it is, send 403 response and show error page.
      if(req.session.isLoggedIn){
        res.status(403).render("403", {message: "You need to log out in order to register a new user.", link:"/logout", linkName:"logout"});
      }
      else{
        res.render("register/register",{csrfToken: req.csrfToken()});
      }
    })
.post(function(req, res, next) {
    //Check if a username and password was entered
    if(req.body.user === "" || req.body.pass === ""){
      req.session.flash = {type: "fail", text: "You have to enter both a username and a password!"};
      res.redirect("/register/");
    }
    //Checks if the username is ok
    else if(!(req.body.user).match(usernameRegex)) {
      req.session.flash = {type: "fail", text: "Username may only contain a-z and 0-9. It must also be 3-15 characters long"};
      res.redirect("/register/");
    }
    //Checks if the password is ok
    else if(!(req.body.pass).match(passwordRegex)){
      req.session.flash = {type: "fail", text: "Password have to be at least 8 characters long"};
      res.redirect("/register/");
    }

    else{
        //encrypts the password and add salt
        //The salt is stored in the hash string in the database
        //The default salt work factor is the number of rounds the data is processed for. The default is 10.
        //The higher work factor the more secure
        bcrypt.genSalt(11, function(err, salt) {
          if (err) throw err;

          bcrypt.hash(req.body.pass, salt, null, function(err, hash) {
            if (err) throw err;

            let user = new User({
              username: req.body.user,
              password: hash
            });
          //Check if there is any users with the same username
          User.find({ username: user.username }, function(err, result) {
            if (result.length === 0){
              //Save the user into the database
              user.save()
                .then(function() {
                    req.session.flash = {type: "success", text: "Registration succeeded!"};
                    res.redirect("/");
                })
                .catch(function(err) {
                  req.session.flash = {type: "fail", text: "Something went wrong, try again!"};
                  res.redirect("/register/");
                });
            }
            else{
              req.session.flash = {type: "fail", text: "That username is already taken!"};
              res.redirect("/register/");
            }
            });
          });
        });
      }
    });

module.exports = router;
