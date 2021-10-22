'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var VoteSchema = Schema({

    user: {type: Schema.ObjectId, ref: 'User'},
    challenge: {type: Schema.ObjectId, ref: 'Message'},
     
});

module.exports = mongoose.model('Vote', VoteSchema);