var fs = require('fs');
var path = require('path');
var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var moment = require('moment');

var instagdb = require('./db.js');

var COMMENTS_FILE = path.join(__dirname, 'comments.json');

app.set('port', (process.env.PORT || 3000));

app.use('/static', express.static(path.join(__dirname, 'build')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.get('/', function (req, res) {
	res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

// Additional middleware which will set headers that we need on each request.
app.use(function(req, res, next) {
    // Set permissive CORS header - this allows this server to be used only as
    // an API server in conjunction with something like webpack-dev-server.
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Disable caching so we'll always get the latest comments.
    res.setHeader('Cache-Control', 'no-cache');
    next();
});

app.get('/api/comments:imageid', function(req, res) {  
    var imageId = req.params.imageid;
    console.log("I'm getting comments from database for image: " + imageId);
    instagdb.selectCommentsForImage(imageId).then(
        data => {
            res.json(JSON.parse(data));

        }).catch(
        err => {
            //handle all errors
            console.log(err);
            response.status(500);
            response.send();
        });

  // fs.readFile(COMMENTS_FILE, function(err, data) {
  //   if (err) {
  //     console.error(err);
  //     process.exit(1);
  //   }
  //   res.json(JSON.parse(data));
  // });
});

app.get('/comments', function(req, res) {

  console.log("I'm getting all the comments from database");
  instagdb.selectAllComments().then(
        data => {
            res.send(data);
        }).catch(
        err => {
            console.log(err);
            response.status(500);
            response.send();
        });
});

app.post('/comment', function(request, response) {
  var userid = request.body.USERID;
  var MESSAGE = request.body.MESSAGE;
//   var timestamp = moment().format('YYYY-MM-DD H:mm:ss');
  instagdb.insertComment(2, userid, MESSAGE)
    .then(
      () => {
          response.send("success added");
      }).catch(err => {
              console.log(err);
              response.status(500);
              response.send(err);                
      });

  // fs.readFile(COMMENTS_FILE, function(err, data) {
  //   if (err) {
  //     console.error(err);
  //     process.exit(1);
  //   }
  //   var comments = JSON.parse(data);

  //   var newComment = {
  //     id: Date.now(),
  //     author: req.body.author,
  //     text: req.body.text,
  //   };
  //   comments.push(newComment);
  //   fs.writeFile(COMMENTS_FILE, JSON.stringify(comments, null, 4), function(err) {
  //     if (err) {
  //       console.error(err);
  //       process.exit(1);
  //     }
  //     res.json(comments);
  //   });
  // });
});


app.listen(app.get('port'), function() {
  console.log('Server started: http://localhost:' + app.get('port') + '/');
  var p = instagdb.initDB();
    p.then(
      val => {
        instagdb.insertUser("1", "Connie", "pwd", "occasional user");
        instagdb.insertImage('testimage1.jpg', '1');
        instagdb.insertComment(1, '1', "first test comment");
      }).catch(
      err => {
          //handle all errors
          console.log(err);
      });

});
