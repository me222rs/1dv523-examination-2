/*jshint esversion: 6 */
const router = require("express").Router();
var User = require("../models/user.js");
var bcrypt = require("bcrypt-nodejs");
const session = require("express-session");

router.route("/login/")
    .get((req, res) => {
      //Checks if the there is a logged in user. If it is, send 403 response and show error page.
      if(req.session.isLoggedIn){
        res.status(403).render("403", {message: "You are already logged in! Go", link: "/", linkName:"home"});
      }
      else{
        res.render("login/login", {csrfToken: req.csrfToken()});
      }
    })
    .post(function(req, res, next) {
        User.find({username: req.body.user}, function(err, test){
            if(test.length === 1){
                User.findOne({ username: req.body.user }, function(err, user) {
                  if (err) throw err;
                  // test a matching password
                  user.comparePassword(req.body.pass, function(err, isMatch) {
                      if (err) throw err;
                      if(isMatch){
                        req.session.userID = user._id;
                        req.session.user = req.body.user;
                        req.session.isLoggedIn = true;
                        req.session.flash = {type: "success", text: "Logged in successfully!"};
                        res.redirect("/");
                      }
                      else{
                        req.session.flash = {type: "fail", text: "Wrong username and/or password!"};
                        res.redirect("/login");
                      }
                  });
              });
            }
            else{
              req.session.flash = {type: "fail", text: "Wrong username or password!"};
              res.redirect("/login");
            }
        });
    });
    router.route("/logout/")
      .get((req, res) => {
            req.session.destroy();
            res.redirect("/");
      });
module.exports = router;
