'use strict';

var express = require('express');
var MessageController = require('../controllers/message');
var api = express.Router();
var md_auth = require('../middlewares/authenticated');
var multipart = require('connect-multiparty');
// l'instruction de la ligne suivante permet de telecharger l'image du challenge dans le dossier des assets du frontend
var md_upload = multipart({uploadDir: './uploads/publications/'});                                                                                                                                           
api.post('/message', md_auth.ensureAuth, MessageController.saveMessage);
api.post("/initialize", md_auth.ensureAuth,MessageController.inititChallenge)
api.put("/update/:id", md_auth.ensureAuth, MessageController.edition)
api.post('/compt1/:id',MessageController.addCompt1);
api.post('/compt2/:id',MessageController.addCompt2);
api.post('/upload-image-pub/:id', [md_auth.ensureAuth, md_upload], MessageController.uploadImage);
api.get('/get-image-pub/:imageFile', MessageController.getImageFile);
api.get('/getAllChallenge', MessageController.getAllMessages);
api.get('/getChallengeForSorting', MessageController.getAllMessagesForSorting);
api.get('/getOneChallenge/:id', MessageController.getOneChallenge);
api.get('/getChallengeNumber', MessageController.countMessage);
api.get('/getChallengeNumberPerUser/:id', MessageController.CountMessagePerUser);
api.get('/populateEmitter/:id', MessageController.getEmitterName)
api.get('/actual-challenge', MessageController.countActualMessages)
api.get('/expired-challenge/:id', MessageController.countExpiredMessages)
module.exports = api;


 