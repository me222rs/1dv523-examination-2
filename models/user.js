/*jshint esversion: 6 */
var mongoose = require('mongoose');
var bcrypt = require("bcrypt-nodejs");

let userSchema = new mongoose.Schema({
    username: {
        type: String ,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
    }
});

userSchema.methods.comparePassword = function(candidatePassword, cb) {
    bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
        if (err) return cb(err);
        cb(null, isMatch);
    });
};
// Create a model using the schema.
let User = mongoose.model("User", userSchema);

// Export the model.
module.exports = User;
