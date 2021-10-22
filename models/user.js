'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var UserSchema = Schema({
    name: String,
    surname: String,
    nick: String,
    email: String,
    password: String,

    status: {
        type: String, 
        enum: ['Pending', 'Active'],
        default: 'Pending'
      },
      confirmationCode: { 
        type: String, 
        unique: true },

        
    role: String,
    image: String
});

module.exports = mongoose.model('User', UserSchema);
