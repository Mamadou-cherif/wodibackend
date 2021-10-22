'use strict';

var moment = require('moment');
var mongoosePaginate = require('mongoose-pagination');
var User = require('../models/user');
var Follow = require('../models/follow');
var Message = require('../models/message');
var fs = require('fs');
var path = require('path');
var cloudinary = require('cloudinary').v2;
var Vote = require('../models/vote');
const { param } = require('../routes/message');
const message = require('../models/message');
const { text } = require('body-parser');


cloudinary.config({ 
    cloud_name: 'cashyapp', 
    api_key: '313655258477521', 
    api_secret: 'CKMyqbQiGb--yzS0D2bduCxSKLw',
    secure: true
  });
var date= new Date();
 
function saveMessage(req, res) {
    var params = req.body;
    // if (!params.text || ! params.receiver) {
    //     return res.status(200).send({message: 'Please, send the message text and receiver...'});
    // }
    var message = new Message();
    message.receiver = params.receiver;

    message.save((err, messageStored) => {
        if (err)
            return res.status(500).send({message: 'Sending message error...'});
        if (!messageStored)
            return res.status(500).send({message: 'Error saving sended message...'});

        return res.status(200).json({message});
    });
}


/* cette methode permet de  */
function edition(req, res, next){
    Message.updateOne({_id: req.params.id}, {receiver:req.body.receiver,compt1:req.body.compt1,created_at : moment().unix(), _id: req.params.id})
         .then(()=> res.status(200).json({succes: "modification reussie avec succès"}))
         .catch(error=> res.status(400).json({error}))
}

function inititChallenge(req, res) {
     
    const message= new Message({
        emitter: req.body.emitter,
        montant: req.body.montant,
        text: "null"
    })

        message.save()
              .then(() => res.status(200).json({
                  
                identifiant: message._id,
                montant: message.montant
            }))
              .catch(error=> res.status(400).json(error))
 
}


 



 


// this is added to change the second image to switch from null to the value of the num of the downloaded file

 function uploadImage(req, res) {
    var messageId = req.params.id;
   
     if (req.files) {
    //  je viens d'ajouter des modifications  à cette partie
         var file = req.files.image;
         var extension= req.files.image.path;
         var ext_split = extension.split('.');
         var file_ext = ext_split[1];
         

     if (file_ext === 'png' || file_ext === 'jpg' || file_ext === 'jpeg' || file_ext === 'gif') {
        cloudinary.uploader.upload(file.path, function(err, result){
            if(err){
                res.status(500).json({error: "error"})
            }


         Message.findOne({'_id': messageId}).exec((err, message) => {
                 Message.findByIdAndUpdate(messageId, {text: result.url,  maxTime: moment().unix()+18000 }, {new : true}, (err, messageUpdated) => {
                     if (!messageUpdated)
                         return res.status(404).send({message: "Message Not Found."});
                     if (err)
                         return res.status(500).send({message: "Request Error."});

                     return res.status(200).send({message: messageUpdated});
                 });
             
           
                
            
           
         });
         })
     } 
     else {
         return removeFilesOfUploads(res, extension, "Ups, please upload a valid image file.");
     }
     } else {
         return res.status(200).send({message: "Ups, please upload any file."});
     }
} 


function getImageFile(req, res) {
    var image_file = req.params.imageFile;
    var path_file = './uploads/publications/' + image_file;
    fs.exists(path_file, (exists) => {
        if (exists) {
            res.sendFile(path.resolve(path_file));
        } else {
            return res.status(200).send({message: "Ups, the file not exists."});
        }
    });
}


function removeFilesOfUploads(res, file_path, message) {
    fs.unlink(file_path, (err) => {
        return res.status(200).send({message: message});
    });
}

/* Fin de ce que j'ai pris depuis le controller Message  */



function countMessage(req, res) {

    // Count the total documents
    Message.countDocuments().then((count_documents) => {
        return res.status(200).send({
            total: count_documents 
        });
    }).catch((err) => {
      console.log(err.Message);
    })
}
/* Cette fonction permet de compter le nombre de messages pendant c'est à dire qui attendent d'etre mis à jour. */
 function CountMessagePerUser(req, res){
     const id= req.params.id
       // Count the total documents
       Message.countDocuments({"receiver": id, "text2":"null"}).then((count_documents) => {
        return res.status(200).send({
            total: count_documents 
        });
    }).catch((err) => {
      console.log(err.Message);
    })
}



function getAllMessages(req, res){
    Message.find({}, function(err, result) {
        if (err) {
          console.log(err);
        } else {
          res.json(result);
        }
      }).populate('emitter').populate('receiver'); 
}

function getAllMessagesForSorting(req, res){
    Message.find({}, function(err, result) {
        if (err) {
          console.log(err);
        } else {
          res.json(result);
        }
      }).populate('emitter').populate('receiver').sort({compt1:-1}); 
}

function getOneChallenge(req, res){
    var challengeId= req.params.id

    Message.findOne({'_id': challengeId},function(err, result) {
        if (err) {
          console.log(err);
        } else {
          res.json(result);
        }
      }).populate('emitter').populate('receiver'); 

    }

function addCompt1(req,res){
    var messageId = req.params.id;
 Message.findOne({'_id': messageId}).exec((err, message) => {
  //recuperer la valeur actuelle du champ du compteur du champ1
     var currentMessageCompt1= message.compt1;

     Message.findByIdAndUpdate(messageId, {compt1: currentMessageCompt1+1}, {new : true}, (err, messageUpdated) => {
          if (!messageUpdated)
              return res.status(404).send({message: "Message Not Found."});
          if (err){
              return res.status(500).send({message: "Request Error."});

          }
                
        return res.status(200).send({message: messageUpdated});
        });   
 });
 
}


function addCompt2(req,res){
    var messageId = req.params.id;
    
 Message.findOne({'_id': messageId}).exec((err, message) => {
  //recuperer la valeur actuelle du champ du compteur du champ1
     var currentMessageCompt2= message.compt2;
      Message.findByIdAndUpdate(messageId, {compt2: currentMessageCompt2+1}, {new : true}, (err, messageUpdated) => {
          if (!messageUpdated)
              return res.status(404).send({message: "Message Not Found."});
          if (err){
              return res.status(500).send({message: "Request Error."});

          }
                
        return res.status(200).send({message: messageUpdated});
        });   
 });

}
 
function getEmitterName(req, res, next){
    Message.findOne({_id: req.params.id}).populate('emitter').populate('receiver')
            .then(user=> res.status(200).json({user}))
            .catch(error=> res.status(400).json(error))
}

function countActualMessages(req, res, next){
    
    Message.count({maxTime: { $gt: Date.now()*0.001 }, text: {$ne: 'null'}})
        .then(nmbreMessage => res.status(200).json({ nmbreMessage: nmbreMessage}))
        .catch(error=> res.status(400).json(error))
}

function countExpiredMessages(req, res, next){

    Message.count({maxTime: { $lt: Date.now()*0.001 }, text: {$ne: 'null'},emitter:{$eq: req.params.id}})
    .then(nmbreMessage => res.status(200).json({nmbreMessage: nmbreMessage}))
        .catch(error=> res.status(400).json(error))
}




module.exports = {
    countExpiredMessages,
    countActualMessages,
    getEmitterName,
    CountMessagePerUser,
    addCompt1,
    addCompt2,
    countMessage,
    uploadImage,
    getImageFile,
    saveMessage,
    getAllMessages,
    getOneChallenge,
    inititChallenge,
    edition,
    getAllMessagesForSorting
};
























