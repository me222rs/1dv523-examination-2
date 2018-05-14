/*jshint esversion: 6 */
const router = require("express").Router();
const mongoose = require('mongoose');
const session = require("express-session");
var snippetSchema = require('../models/snippet.js');

//Checking if database connection works, move to app.js later
mongoose.connect('mongodb://localhost/snippets');
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log("Connected to database");
});

router.route("/")
    .get((req, res) => {
        //När man är inloggad så visas en annan vy av denna sida som har delete och update-knappar
        if(req.session.isLoggedIn){
          snippetSchema.find({}, function(err, result) {
            res.render("snippets/loggedInHomeView", {snippets: result, user: req.session.user}); //inloggad så renderas denna
            });
        }
        else{
          snippetSchema.find({}, function(err, result) {
            res.render("snippets/snippets", {snippets: result}); //Sista är array
          });
        }
    });

module.exports = router;
