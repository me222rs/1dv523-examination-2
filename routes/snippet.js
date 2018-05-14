/*jshint esversion: 6 */
const router = require("express").Router();
var Snippet = require('../models/snippet.js');
const session = require("express-session");

const contentRegex = /^.{1,500}$/;
const titleRegex = /^[a-zA-Z0-9]{1,30}$/;

router.route("/snippet/post/:id")
    .get((req, res) => {
      Snippet.findById(req.params.id, function(err, snippet) {
        if (err) throw err;

        var loggedInUserIsSame;
          if(snippet.userName === req.session.user){
            loggedInUserIsSame = true;
          }
          else{
            loggedInUserIsSame = false;
          }
          res.render("snippets/snippet", {csrfToken: req.csrfToken(), title: snippet.title, body: snippet.body, _id: req.params.id, userName: snippet.userName, loggedInUserIsSame: loggedInUserIsSame});
      });
    });

router.route("/snippet/delete/:id")
    .get((req, res) => {
      Snippet.findById(req.params.id, function(err, snippet) {
        if (err) throw err;

      if(req.session.isLoggedIn){
        res.render("snippets/confirmation", {snippet: snippet.body, _id: req.params.id, csrfToken: req.csrfToken()});
      }
      else{
        res.status(401).render("401", {message: "You have to be logged in to access this feature!", link: "/login", linkName:"Log in"});
      }
    });
    }).post((req, res) => {
      if(req.session.isLoggedIn){
        Snippet.findById(req.params.id, function(err, snippet) {
          if(req.session.user === snippet.userName){
          Snippet.findByIdAndRemove(req.params.id, function(err){
            if (err) throw err;

              req.session.flash = {type: "success", text: "Snippet deleted!"};
              res.redirect("/");
            });
          }
          else{
            res.status(403).render("403", {message: "You do not have the rights to do that!", link: "/", linkName:"Home"});
          }

        });
      } else{
        res.status(401).render("401", {message: "You have to be logged in to delete a snippet!", link: "/login", linkName:"Log in"});
      }
    });

router.route("/snippet/update/:id")
    .get((req, res) => {
      Snippet.findById(req.params.id, function(err, snippet) {
        if (err) throw err;

        if(req.session.isLoggedIn){
          res.render("snippets/update", {snippet: snippet.body, id: req.params.id, csrfToken: req.csrfToken()});
        }
        else{
          res.status(401).render("401", {message: "You have to be logged in for this feature!", link: "/login", linkName:"Log in"});
        }
      });


    }).post((req, res) => {
      if(req.session.isLoggedIn){
        Snippet.findById(req.params.id, function(err, snippet) {
          if(req.session.user === snippet.userName){
              if (err) throw err;

              snippet.body = req.body.content;

              if((req.body.content).length > 0 && (req.body.content).length < 501){
                snippet.save(function(err) {
                  if (err) throw err;

                  req.session.flash = {type: "success", text: "Snippet updated!"};
                  res.redirect("/");
                });
              }
              else{
                req.session.flash = {type: "fail", text: "There must be between 1-500 characters!"};
                res.redirect("/snippet/post/"+req.params.id);
              }
            }
            else{
              res.status(403).render("403", {message: "You do not have the rights to do that!", link: "/", linkName:"Home"});
            }
          });
      }
      else{
        res.status(401).render("401", {message: "You have to be logged in for this feature!", link: "/login", linkName:"Log in"});
      }
    });

router.route("/snippet")
    .get((req, res) => {
      if(req.session.isLoggedIn){
        res.render("snippets/createSnippet",{csrfToken: req.csrfToken()});
      }
      else{
        res.status(401).render("401", {message: "You have to be logged in for this feature!", link: "/login", linkName:"Log in"});
      }
    })
    .post((req, res) => {
    let snippetData = new Snippet({
        userID: req.session.userID,
        title: req.body.title,
        body: req.body.content,
        userName : req.session.user,
    });

    if((req.body.content).length > 0 && (req.body.content).length < 501 && (req.body.title).match(titleRegex)){

      snippetData.save()
        .then(function() {
            req.session.flash = {type: "success", text: "Posted snippet!"};
            res.redirect("/snippet");
        })
        .catch(function(err) {
          console.log(err);
          req.session.flash = {type: "fail", text: "Something went wrong, try again later!"};
          res.redirect("/snippet");
        });
    }
    else{
      req.session.flash = {type: "fail", text: "Username must be between 1-30 characters long and the snippet must be between 1-500 characters."};
      res.redirect("/snippet");
    }

  });
module.exports = router;
