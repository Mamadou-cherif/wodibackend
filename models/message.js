'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var MessageSchema = Schema({
    emitter: {type: Schema.ObjectId,  ref: 'User'},
    receiver: {type: Schema.ObjectId, ref: 'User'},
    text: String,
    compt1: Number,
    created_at: Number,
    montant: String,
    maxTime: Number,
    viewed: String
});

module.exports = mongoose.model('Message', MessageSchema);


 









