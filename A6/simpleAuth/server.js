var url = require("url"),
	querystring = require("querystring");

var passport = require('passport');
var fs = require('fs');
var path = require('path'),
  express = require('express'),
  db = require('mongoskin').db('mongodb://127.0.0.1:27017/test');


var mongoose = require('mongoose');
var configDB = require('./passport/config/database.js');
mongoose.connect(configDB.url); // connect to our database

var app = express();
var secret = 'test' + new Date().getTime().toString()

var session = require('express-session');
app.use(require("cookie-parser")(secret));
var MongoStore = require('connect-mongo')(session);
app.use(session( {store: new MongoStore({
   url: 'mongodb://127.0.0.1:27017/test',
   secret: secret
})}));
app.use(passport.initialize());
app.use(passport.session());
var flash = require('express-flash');
app.use( flash() );

var bodyParser = require("body-parser");
var methodOverride = require("method-override");

app.use(methodOverride());
app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended:false
}));
require('./passport/config/passport')(passport); // pass passport for configuration
require('./passport/routes.js')(app, passport); // load our routes and pass in our app and fully configured passport

//---------------------------------------------------------
app.get("/addfeed", function (req, res) {
    var url = req.query.a;
    var x = {
      id:new Date().getTime(),
      url: url,
    }

  db.collection("data").insert(x, function(err, result){
    if(!err){
      res.end("1");
    }
  });
});

app.get("/getallfeeds", function (req, res) {
  db.collection("data").find().toArray(function(err, result){
      res.send(JSON.stringify(result)); // send response body
  });
});

app.get("/getrss", function (req, res) {
    var url = req.query.a;
      console.log(url);
    var client = new Client();
    client.get(url, function (data, response) {
      // parsed response body as js object
      console.log(data);
      res.send(data); // send response body
    });
});
//-------------------------------------------------


app.use(express.static(path.join(__dirname, 'public')));

app.get("/getsomeDBinfo", isLoggedIn, function(req, res){ //Make sure user is logged in before callback is executed
    var userID = req.user.local.email; // Know exactly which user you are dealing with
    res.send("sbvksjd")
})

app.listen(8080);
console.log("App running at http://127.0.0.1:8080");





// route middleware to ensure user is logged in
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated())
        return next();

    res.send('noauth');
}
