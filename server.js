//           Basic_Configuration             //
var http = require("http");
var path = require("path");
var express = require("express");
var bodyParser = require("body-parser");
var cookieParser = require("cookie-parser");
require('body-parser-xml')(bodyParser);
var app = express();
var config = require('./config');
var User = require("./models/userDB");
var colors = require("colors");
var Promise = require("es6-promise").Promise;
var port = process.env.PORT || 2722;
//      DataBase     //
var mongoose = require("mongoose");
var db = mongoose.connection;
var dbUrl = "mongodb://cadi_project:123123@ds155418.mlab.com:55418/cadi_project";
var httpReq = require('./promise-http').request;
var MongoClient = require("mongodb").MongoClient;
var asert = require("assert");
var indexRouter = require("./routes/index");


//         router        //


var dataRouter = require("./routes/data");
var search = require("./routes/search");
var mainRouter = require("./routes/main");
var searchName = require("./routes/searchName");
var searchSpot = require("./routes/searchSpot");
var fcmPush = require("./routes/push");
var test3 = require("./routes/test3");
var register = require("./routes/register");
var doctorRouter = require("./routes/doctor");
var adminRouter = require("./routes/admin");
var change_doctorRouter = require("./routes/admin_change_doctor");
var doctor_change = require("./routes/doctor_change");



//           session & passports           //


// var passport = require("passport");
// var LocalStrategy = require("passport-local");
// var session = require("express-session");
// var flash = require("connect-flash");
// var setUpPassport = require("./passports/setUpPassport");


//-----------------------------------------------------------------------------


//          app.set         //
app.set('port', port);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.xml());

mongoose.connect(dbUrl, function (err) {
    if (err) {
        return console.log("There is no database");
    }
    console.log("Database is connected well!");
});

// configuration for base workout

// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({extended: false}));
// app.use(cookieParser());
// app.use(session({
//     secret: "ubinet", // 각 세션이 Client단에서 암호화되도록 한다. (hash data)
//     resave: true,   // 미들웨어에 필요한 옵션. true : 세션이 수정되지 않은 경우일 때 조차 세션이 업데이트 된다.
//     saveUninitialized: true  // 초기화되지 않은 세션을 재 설정한다.
// }));
// app.use(flash());
// app.use(passport.initialize());
// app.use(passport.session());

//router

app.use("/", indexRouter);
app.use("/data", dataRouter);
app.use("/search", search);
app.use("/search/Name", searchName);
app.use("/search/spot", searchSpot);
app.use("/", mainRouter);
app.use("/push", fcmPush);
app.use("/register", register);
app.use("/",test3);
app.use("/",doctorRouter);
app.use("/",adminRouter);
app.use(express.static('public'));
app.use("/",change_doctorRouter);
app.use("/",doctor_change);

/*
 app.use('/',function (req, res, next) {
 var err = new Error('Not Found');
 err.status = 404;
 next(err);
 });

 */
// **************************************************************************** function **************************************************************** //
var server = http.createServer(app);
// setUpPassport();


//
var server = http.createServer(app);
/*app.listen(port,function(){
 console.log("server is running on" + port);
 });*/

server.listen(app.get('port'), function () {
    console.log('Express server listening on port:' + app.get('port') + " ");
});

module.exports = app;
