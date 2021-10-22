'use strict';

var bcrypt = require('bcrypt-nodejs');
var mongoosePaginate = require('mongoose-pagination');
var User = require('../models/user');
const bcrypt2= require("bcrypt")
var Follow = require('../models/follow');
var Publication = require('../models/publication');
var jwt = require('../services/jwt');
var fs = require('fs');
var path = require('path');
var nodemailer = require('nodemailer');
var secret = 'Secret_Key1-2-3.';
var jwt2 = require("jsonwebtoken");

var transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: 'steevennconardo@gmail.com',
        pass: 'uuvzlzolbllbiikm'
    }
});
  


function saveUser(req, res) {
    var params = req.body;
    
    var user = new User();
    if (params.name && params.surname && params.nick && params.email && params.password) {

        const token = jwt2.sign({email: req.body.email}, secret)
        user.name = params.name;
        user.surname = params.surname;
        user.nick = params.nick;
        user.email = params.email; 
        user.role = '001';
        user.image = null;
        user.confirmationCode= token

        var mailOptions = {
            from: 'steevennconardo@gmail.com', 
            to: user.email, 
            subject: 'We are trying sending message', 
            html: `<h1>Email Confirmation</h1>
            <h2>Hello ${user.name}</h2>
            <p>Thank you for subscribing. Please confirm your email by clicking on the following link</p>
            <a href=https://cashy-app.netlify.app/confirmationCompte/${user.confirmationCode}> Click here</a>
            </div>`, 
        };
 
        User.find({$or: [
                {email: user.email.toLowerCase()},
                {nick: user.nick.toLowerCase()}
            ]}).exec((err, users) => {
            if (err)
                return res.status(500).send({message: "Creating user error."});
            if (users && users.length >= 1) {
                return res.status(200).send({message: "User already exists."});
            } else {
                bcrypt.hash(params.password, null, null, (err, hash) => {
                    if (err)
                        return res.status(500).send({message: "Saving user error."});
                    user.password = hash;
                });
                user.save((err, userStored) => {
                    if (err)
                        return res.status(500).send({message: "Saving user error."});
                    if (userStored) {

                            // send mail with defined transport object
                            transporter.sendMail(mailOptions, function(error, info){
                                if(error){
                                    console.log(error);
                                }else{
                                    console.log('Message sent: ' + info.response);
                                }
                            });

                        return res.status(200).send({user: userStored});
                      
                    } else {
                        return res.status(404).send({message: "User Not Found."});
                    }
                });
            }
        });
    } else {


        return res.status(200).send({message: 'Invalid Data.'});
    }
}


function loginUser(req, res) {
    var params = req.body;
    var email = params.email;
    var password = params.password;
    User.findOne({email: email}, (err, user) => { 
        if (err)
            return res.status(500).send({message: "echec de la requette"});
        if (user) {
          // Je viens d'ajouter ce code
            if (user.status != "Active") {
                return res.status(401).send({
                  message: "Pending Account. Please Verify Your Email!",
                });
              }  //End of the code that I just added
              else{
                        bcrypt.compare(password, user.password, (err, check) => {
                            if (check) {
                                
                                if (params.gettoken) {
                                    return res.status(200).send({
                                        token: jwt.createtoken(user)
                                    });
                                } else {
                                    user.password = undefined;
                                    user.confirmationCode= undefined;
                                    user.status= undefined;
                                    
                                    return res.status(200).send({user});
                                }
                            } else {
                                return res.status(500).send({message: "mot de passe incorrect"});
                            }
                        });
                 }           
        } else {
            return res.status(500).json({message: "ce gmail est inconnu"});
        }
    });
}

function getUser(req, res) {
    var userId = req.params.id;
    User.findById(userId, (err, user) => {
        if (!user)
            return res.status(404).send({message: "User Not Found."});
        if (err)
            return res.status(500).send({message: "Request Error."});

        followThisUser(req.user.sub, userId).then((value) => {
            return res.status(200).send({
                user,
                following: value.following,
                followed: value.followed
            });
        });
    });
}

async function followThisUser(identity_user_id, user_id) {
    var following = await Follow.findOne({user: identity_user_id, followed: user_id}).exec()
            .then((following) => {
                return following;
            })
            .catch((err) => {
                return handleError(err);
            });

    var followed = await Follow.findOne({user: user_id, followed: identity_user_id}).exec()
            .then((followed) => {
                return followed;
            })
            .catch((err) => {
                return handleError(err);
            });

    return {
        following: following,
        followed: followed
    };
}

function getUsers(req, res) {
    var identity_user_id = req.user.sub;
    var itemsPerPage = 10;
    var page = 1;
    if (req.params.page) {
        page = req.params.page;
    }
    User.find().sort('_id').paginate(page, itemsPerPage, (err, users, total) => {
        if (!users)
            return res.status(404).send({message: "Users Not Found."});
        if (err)
            return res.status(500).send({message: "Request Error."});

        followUserIds(identity_user_id).then((value) => {
            return res.status(200).send({
                users,
                user_following: value.following,
                user_follow_me: value.followed,
                total,
               // pages: Math.ceil(total / itemsPerPage)
            });
        });
    });
}

function AllUsers(req, res, next){
    User.find()
        .then(users=> res.status(200).json(users))
        .catch(error=> res.status(400).json({error}))
}

async function followUserIds(user_id) {
    var following = await Follow.find({"user": user_id}).select({'_id': 0, '__v': 0, 'user': 0}).exec()
            .then((following) => {
                return following;
            })
            .catch((err) => {
                return handleError(err);
            });

    var followed = await Follow.find({"followed": user_id}).select({'_id': 0, '__v': 0, 'followed': 0}).exec()
            .then((followed) => {
                return followed;
            })
            .catch((err) => {
                return handleError(err);
            });

    var following_clean = [];
    following.forEach((follow) => {
        following_clean.push(follow.followed);
    });
    var followed_clean = [];
    followed.forEach((follow) => {
        followed_clean.push(follow.user);
    });

    return {
        following: following_clean,
        followed: followed_clean
    };
}

function getCounters(req, res) {
    var userId = req.user.sub;
    if (req.params.id) {
        userId = req.params.id;
    }
    getCountFollow(userId).then((value) => {
        return res.status(200).send(value);
    });
}

async function getCountFollow(user_id) {
    var following = await Follow.count({"user": user_id}).exec()
            .then((count) => {
                return count;
            })
            .catch((err) => {
                return handleError(err);
            });

    var followed = await Follow.count({"followed": user_id}).exec()
            .then((count) => {
                return count;
            })
            .catch((err) => {
                return handleError(err);
            });

    var publications = await Publication.count({"user": user_id}).exec()
            .then((count) => {
                return count;
            })
            .catch((err) => {
                return handleError(err);
            });

    return {
        following: following,
        followed: followed,
        publications: publications
    };
}

function updateUser(req, res) {
    var userId = req.params.id;
    var update = req.body;
    delete update.password;
    if (userId !== req.user.sub) {
        return res.status(500).send({message: "You do not have permissions to modify the user."});
    }

    User.find({$or: [
            {email: update.email.toLowerCase()},
            {nick: update.nick.toLowerCase()}
        ]}).exec((err, users) => {
        var user_isset = false;
        users.forEach((users) => {
            if (users._id != userId)
                user_isset = true;
        });
        if (user_isset)
            return res.status(400).send({message: "The email and/or the nick already exists..."});

        User.findByIdAndUpdate(userId, update, {new : true}, (err, userUpdated) => {
            if (!userUpdated)
                return res.status(404).send({message: "User Not Found."});
            if (err)
                return res.status(500).send({message: "Request Error."});

            return res.status(200).send({user: userUpdated});
        });
    });
}

function uploadImage(req, res) {
    var userId = req.params.id;
    if (req.files) {
        var file_path = req.files.image.path;
        var file_split = file_path.split('/');
        var file_name = file_split[2];
        var ext_split = file_name.split('\.');
        var file_ext = ext_split[1];
        if (userId !== req.user.sub) {
            return removeFilesOfUploads(res, file_path, "You do not have permissions to modify the user.");
        }
        if (file_ext === 'png' || file_ext === 'jpg' || file_ext === 'jpeg' || file_ext === 'gif') {
            User.findByIdAndUpdate(userId, {image: file_name}, {new : true}, (err, userUpdated) => {
                if (!userUpdated)
                    return res.status(404).send({message: "User Not Found."});
                if (err)
                    return res.status(500).send({message: "Request Error."});

                return res.status(200).send({user: userUpdated});
            });
        } else {
            return removeFilesOfUploads(res, file_path, "Ups, please upload a valid image file.");
        }
    } else {
        return res.status(200).send({message: "Ups, please upload any file."});
    }
}

function removeFilesOfUploads(res, file_path, message) {
    fs.unlink(file_path, (err) => {
        return res.status(200).send({message: message});
    });
}

function getImageFile(req, res) {
    var image_file = req.params.imageFile;
    var path_file = './uploads/users/' + image_file;
    fs.exists(path_file, (exists) => {
        if (exists) {
            res.sendFile(path.resolve(path_file));
        } else {
            return res.status(200).send({message: "Ups, the file not exists."});
        }
    });
}


function verifyUser( req, res , next){
    
    User.findOne({
        confirmationCode: req.params.confirmationCode,
      }) 
        .then((user) => {
          if (!user) {
            return res.status(404).send({ message: "User Not found." });
          }
         
          user.status = "Active";
          
          user.save((err) => {
            if (err) {
              res.status(500).send({ message: err });
              return;
            }
          });
        })
        .catch((e) => console.log("error", e));
}


function redirectToUser(req, res, next){
    // Saisir et récevoir un mot de pass
     User.findOne({email: req.body.email})
         .then(user => {
             
    
            var mailOptions = {
                from: 'steevennconardo@gmail.com', 
                to: user.email, 
                subject: 'Change your Password', 
                html: `<h1>Change are changing your password</h1>
                <h2>Hello ${user.name}</h2>
                <p>Thank you for subscribing. Please confirm your email by clicking on the following link</p>
                <a href=https://cashy-app.netlify.app/resetPassWord/${user._id}> Click here</a>
                </div>`, 
            };
    
             // send mail with defined transport object
             transporter.sendMail(mailOptions, function(error, info){
                if(error){
                    console.log(error);
                }else{
                    console.log('Message sent: ' + info.response);
                }
            });
    
            res.status(200).json({succes: "succes"})
    
         })
         .catch(() => res.status(400).json({error: "error"}))
    
    
         .catch(() => res.status(400).json({error: "error"}))
    }
    
    
    
    
    function modifyPassword(req, res, next){
        bcrypt.hash(req.body.password, null, null, (err, hash) => {
            if (err){
                return res.status(500).send({message: "Saving user error."});
            }
            else{
    
    
                User.updateOne({_id: req.params.id}, {password: hash, _id: req.params.id})
                                        .then(() => res.status(201).json({succes: "la modification a reussie"}))
                                        .catch(() => res.status(400).json({error: "erreur de modification du mode passe"}))
            
            }
            
        });
      
    }
    



module.exports = {
    redirectToUser,
    modifyPassword,
    saveUser,
    loginUser,
    getUser,
    getUsers,
    getCounters,
    updateUser,
    uploadImage,
    verifyUser,
    getImageFile,
    AllUsers
};