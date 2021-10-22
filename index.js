'use strict';

const mongoose = require('mongoose');
const app = require('./app');
const port = process.env.PORT || 3000;
//const mongoDb = process.env.MONGODB_URL || 'mongodb://localhost:27017/OwnSocial';

 const mongoDb ="mongodb+srv://Thiernomamadou0:Thiernomamadou0@cluster0.govkw.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";


mongoose.connect(mongoDb, { useNewUrlParser: true })
.then(() => {
    console.log('DB: Connect OK!');
    app.listen(port, () => {
        console.log('Server running on => http://localhost:' + port);
    });
})
.catch(err => console.log(err));

console.log('Starting...');
