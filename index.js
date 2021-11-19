'use strict';

const mongoose = require('mongoose');
const app = require('./app');
const port = process.env.PORT || 3000;
const mongoDb = 'mongodb://localhost:27017/social';
//const mongoDb ="mongodb+srv://Thiernomamadou0:Thiernomamadou0@cluster0.govkw.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
global.__basedir = __dirname;


mongoose.connect(mongoDb, { useNewUrlParser: true })
.then(() => {
    console.log('DB: Connect OK!');
    app.listen(port, () => {
        console.log('Server running on => http://localhost:' + port);
    });
})
.catch(err => console.log(err));

console.log('Starting...');
