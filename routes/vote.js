'use strict';

var express = require('express');
var FollowController = require('../controllers/vote');
var api = express.Router();
var md_auth = require('../middlewares/authenticated');

api.post('/vote/:id', md_auth.ensureAuth, FollowController.saveVote);
api.get('/getVote/:id',  FollowController.getSingleVotedChallenge);
api.get('/getAllVote', FollowController.getAllVoteChallenge)
module.exports = api;  
