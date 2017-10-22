const mongoose = require('mongoose');

// import environmental variables from variables.env file
require('dotenv').config({ path: 'variables.env' });

// connect to Database, handle bad connections
mongoose.connect(process.env.DATABASE);
mongoose.Promise = global.Promise; // Tell Mongoose to use ES6 promises
mongoose.connection.on('error', (err) => {
  console.error(`Error - ${err.message}`);
});

// models
require('./models/Post');
require('./models/User');

// start app
const app = require('./app');
app.set('port', process.env.PORT || 13775 || 7777);
const server = app.listen(app.get('port'), () => {
  console.log(`Express running → PORT ${server.address().port}`);
});