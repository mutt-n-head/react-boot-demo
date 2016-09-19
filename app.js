var express = require('express');
var app = express();
var db = require('./db.js');
var bodyParser = require('body-parser')

// parse application/x-www-form-urlencoded
// app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
// app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(express.static('build'));
app.use(express.static('public'));

app.post('/login', function(req, res) {
    var user = req.body.userid;
    var pass = req.body.pass;

    legit = db.selectUser(user);

    legit.then(
        (data) => {
            console.log(data);
            if (data.password === pass) {
                res.status(200).send('success');
            } else {
                res.status(404).send('failure');
            }
        }
    );
});

app.get('/', function(req, res) {
    res.sendFile(__dirname + '/build/index.html');
});

app.get('/user/:id', function(req, res) {
    var p = db.selectUser(req.params.id);

    p.then(
        (tweets) => {
            res.status(200).send(tweets);
        }
    );
});

app.get('/images/:id', function(req, res) {
    var p = db.selectImagesFor(req.params.id);

    p.then(
        (tweets) => {
            res.status(200).send(tweets);
        }
    );
});

app.get('/followers/:id', function(req, res) {
    var p = db.getFollowers(req.params.id);

    p.then(
        (followers) => {
            res.status(200).send(followers);
        }
    );
});

app.get('/numfollowing/:id', (req, res) => {
    var p = db.getNumThatFollowUser(req.params.id);

    p.then(
        (data) => {
            res.status(200).send(data.toString());
        },
        (err) => {
            res.status(404).send('failure');
        }
    );
});

app.get('/getpostcount/:id', (req, res) => {
    var p = db.getPostCount(req.params.id);
    p.then(
        (data) => {
            res.status(200).send(data.toString());
        },
        (err) => {
            res.status(404).send('error');
        }
    );
});

app.post('/putimage', function(req, res) {
    var p = db.insertImage(req.body.filename, req.body.userid);

    p.then(
        (tweets) => {
            res.status(200).send('success');
        },
        (err) => {
            res.status(404).send('fail');
        }
    );
});

app.post('/like', function(req, res) {

});

app.get('/feed/:id', function(req, res) {
    var p = db.selectUserFeed(req.params.id);

    p.then(
        (tweets) => {
            res.status(200).send(tweets);
        }
    );
});

app.get('/comments/:iid', (req, res) => {
    var p = db.selectCommentsForImage(req.params.iid);

    p.then(
        (data) => {
            res.status(200).send(data);
        },
        (err) => {
            res.status(404).send('failed to retrive comments');
        }
    )
});

app.post('/comment', function(req, res) {
    // Need image id, user id and comment string from post.
    var p = db.insertCommentForImage(req.body.iid, req.body.userid, req.body.message);

    p.then(
        (data) => {
            res.status(200).send("success");
        },
        (err) => {
            res.status(404).send("failure");
        }
    )
});

app.post('/newuser', function(req, res) {
    var p = db.insertUser(req.body.userid, req.body.username, req.body.password, req.body.profile);

    p.then(
        (data) => {
            res.status(200).send('success');
        },
        (err) => {
            res.status(404).send("failure");
        }
    )
});

app.listen(3000, function () {
    console.log('Example app listening on port 3000!');
});
