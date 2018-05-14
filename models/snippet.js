/*jshint esversion: 6 */
var mongoose = require('mongoose');

let snippetSchema = new mongoose.Schema({
    userID: {
        type: String,
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
    body: {
        type: String,
        required: true,
    },
    userName: {
        type: String,
        required: true,
    }
});

// Create a model using the schema.
let Snippet = mongoose.model("Snippet", snippetSchema);

// Export the model.
module.exports = Snippet;
