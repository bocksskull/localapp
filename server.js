// setup all tools we need =============
var express  = require('express');
var app      = express();
var port     = process.env.PORT || 8080;
var mongoose = require('mongoose');
var passport = require('passport');
var flash = require('connect-flash');
var path = require('path');

var restcalls = require('./config/restcalls');

var configDB = require('./config/database.js');

var morgan       = require('morgan');
var bodyParser   = require('body-parser');
var cookieParser = require('cookie-parser');
var session = require('express-session');

// configuration ===========
mongoose.connect(configDB.url); // connect to our database

require('./config/passport')(passport);

// Add headers
app.use(function (req, res, next) {

    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);

    // Pass to next layer of middleware
    next();
});


// set up our express application
app.use(morgan('dev'));
app.use(cookieParser());
app.use(bodyParser());

app.set('view engine', 'ejs'); // set up ejs for templating

app.set('views', path.join(__dirname, 'views'));
app.use(express.static(__dirname + '/public'));

// passport requirements ===========
// session secret
app.use(session({secret: 'soemsectremsghereover'}));

app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

// routes =========================
require('./app/routes')(app, passport, restcalls); 

// launch ==============
app.listen(port);
console.log('The magic happens on port ' + port);