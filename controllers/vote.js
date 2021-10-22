'use strict';

var fs = require('fs'); 
var path = require('path');
var mongoosePaginate = require('mongoose-pagination');
var User = require('../models/user');
var Vote = require('../models/vote');


 
 
function saveVote(req, res) {
    var params = req.body;
    var vote = new Vote();
    vote.user = req.user.sub;
    vote.challenge = req.params.id; 

    vote.save((err, followStored) => {
        if (err)
            return res.status(500).send({message: "Saving follow error."});
        if (!followStored)
            return res.status(404).send({message: "User follow not saved."});

        return res.status(200).send({follow: followStored});
    });
}


function getSingleVotedChallenge(req, res){
    var challengeId= req.params.id

    Vote.findOne({'challenge': challengeId}, function(err, result) {
        if (err) {
          console.log(err);
        } else {
          res.json(result); 
        }   
      }); 
}

function getAllVoteChallenge(req, res){
    Vote.find({}, function(err, result) {
        if (err) {
          console.log(err);
        } else {
          res.json(result);
        }
      }); 
}

module.exports = {
    saveVote,
    getSingleVotedChallenge,
    getAllVoteChallenge
};