'use strict';

var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var default_routes = require('./routes/default');
var user_routes = require('./routes/user');
var follow_routes = require('./routes/follow');
var message_routes = require('./routes/message');
var vote_routes = require('./routes/vote')


app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Request-Method');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');


    next();
});

app.use('/', default_routes);
app.use('/api', user_routes);
app.use('/api', follow_routes);
app.use('/api', message_routes);
app.use('/api', vote_routes);

module.exports = app;
