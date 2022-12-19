const express = require('express');
const bodyParser = require('body-parser');
// create express app
const app = express();
// Setup server port
// parse requests of content-type - application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }))
// parse requests of content-type - application/json
app.use(bodyParser.json())
// Configuring the database
const {  port, dburl } = require('./config.json');
const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
// Connecting to the database
mongoose.connect(dburl, {
useNewUrlParser: true
}).then(() => {
  console.log("Successfully connected to the database");
}).catch(err => {
  console.log('Could not connect to the database.', err);
  process.exit();
});
const userRoutes = require('./routes/user')
// using as middleware
app.use('/api/users', userRoutes)

// define a root/default route
app.get('/', (req, response) => {
	return response.sendFile('index.html', { root: '.' });
});
// listen for requests
app.listen(port, () => {
   console.log(`Node server is listening on port ${port}`);
});
