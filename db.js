var sqlite3 = require('sqlite3').verbose();

var db = new sqlite3.Database('twitty.db');

/*
exports.insertUser = insertUser;                // inserts uid, name, pwd, profile (all strings) row id generated
exports.updateUser = updateUser;                // uid, name, pwd, profile (all strings) updates name, pwd & profile
exports.updateUserName = updateUserName;        // uid, name (all strings)
exports.updateUserPwd = updateUserPwd;          // uid, pwd (all strings)
exports.updateUserProfile = updateUserProfile;  // uid, profile (all strings)
exports.deleteUser = deleteUser;                // uid
exports.selectAllUsers = selectAllUsers;        // return all users
exports.selectUser = selectUser;                // uid return one user/uid
exports.insertTweet = insertTweet;
exports.updateTweet = updateTweet;
exports.deleteTweet = insertTweet;
exports.updateTweet = updateTweet;
exports.insertFollowing = insertFollowing;
exports.selectFollowing = selectFollowing;
exports.selectFollowed = selectFollowed;
exports.deleteFollowing = deleteFollowing;
exports.insertLike = insertLike;
exports.deleteLike = deleteLike;
exports.selectILike = selectILike;
exports.selectLikedBy = selectLikedBy;
exports.selectWhoLikesTweet = selectWhoLikesTweet;
exports.selectTweetsLikedBy = selectTweetsLikedBy;
exports.insertReply = insertReply;
exports.updateReply = updateReply;
exports.deleteReply = deleteReply;
exports.selectRepliesForTweet = selectRepliesForTweet;
exports.selectRepliesForUser = selectRepliesForUser;
exports.selectTweetsFor = selectTweetsFor;
exports.selectUserFeed = selectUserFeed;
*/
exports.insertImage = insertImage
exports.initDB = initDB
exports.insertUser = insertUser
exports.insertImage = insertImage
exports.insertComment = insertComment

var image = {
    iid: '',
    filename: '',
    userid: '',
    ts: ''
};
var user = {
    userid: '',
    name: '',
    password: '',
    profile: ''
};
var comment = {
    commentid: '',
    iid: '',
    userid: '',
    message: '',
    ts: ''
};
var likerel = {
    iid: '',
    userid: '',
    ts: ''
};
var followrel = {
    leader: '',
    follower: '',
};

function initDB() {
    return new Promise(
            (resolve, reject) => {
        db.serialize(function () {

            db.run("DROP TABLE users", function (err) { if (err) { } });
            console.log("create users table");
            db.run("CREATE TABLE users \
            (USERID TEXT PRIMARY KEY NOT NULL, \
            NAME TEXT NOT NULL, \
            PASSWORD TEXT NOT NULL, \
            PROFILE TEXT)", function (err) { if (err) {} });
        });
        db.serialize(function () {
            db.run("DROP TABLE images", function (err) { if (err) { } });
            console.log("create images table");
            db.run("CREATE TABLE images \
            (IID INTEGER PRIMARY KEY NOT NULL, \
            FILENAME TEXT NOT NULL,\
            USERID TEXT NOT NULL, \
            TS TEXT NOT NULL)", function (err) { if (err) { } });
        });
        db.serialize(function () {
            db.run("DROP TABLE comments", function (err) { if (err) { } }); //x
            console.log("create comments table");
            db.run("CREATE TABLE comments \
            (COMMENTID INTEGER PRIMARY KEY NOT NULL, \
            IID INT NOT NULL, \
            USERID TEXT NOT NULL,\
            MESSAGE TEXT NOT NULL,\
            TS TEXT NOT NULL)", function (err) { if (err) {} });
        });
        db.serialize(function () {
            db.run("DROP TABLE followRel", function (err) { if (err) { } }); //x
            console.log("create followRel table");
            db.run(
                "CREATE TABLE followRel \
                (LEADERID TEXT NOT NULL, \
                FOLLOWERID TEXT NOT NULL)", function (err) { if (err) {  } });
        });
        db.serialize(function () {
            db.run("DROP TABLE likeRel", function (err) { if (err) { } }); //x
            console.log("create likeRel table");
            db.run("CREATE TABLE likeRel \
            (IID TEXT NOT NULL, \
            USERID TEXT NOT NULL, \
            TS TEXT NOT NULL)", function (err) { if (err) {} });
        });
        resolve();
    });
}

function asMyQuote(input) {
    return '\'' + input + '\'';
}

// User Table functions
function insertUser(userid, uname, pw, pro) {
    var values = asMyQuote(userid) + ', ' + asMyQuote(uname) + ', ' + asMyQuote(pw) + ', ' + asMyQuote(pro);
    var sqlStr = "INSERT INTO users (USERID, NAME, PASSWORD, PROFILE) VALUES (" + values + ")";

    return genericRun(sqlStr);
}

exports.selectUser = (uid) => {
    var quid = asMyQuote(uid);
    var command = "SELECT * FROM users WHERE USERID = " + quid;
    return genericFetch(command, user, 'userid');
};

// replies table functions
// insert
function insertImage(filename, uid) {
    var quid = asMyQuote(uid);
    var qfilename = asMyQuote(filename);
    var ts = asMyQuote(new Date());
    var values = qfilename + ', ' + quid + ',' + ts;
    var sql = "INSERT INTO images (FILENAME, USERID, TS) VALUES (" + values + ")";

    return genericRun(sql);
}

function deleteImage(iid) {
    return genericFetch("DELETE FROM images WHERE IID = " + iid);
}

function insertComment(iid, uid, msg) {
    var quid = asMyQuote(uid);
    var qmsg = asMyQuote(msg);
    var ts = asMyQuote(new Date());
    var values = iid + ', ' + quid + ',' + qmsg + ', ' + ts;
    var sqlStr = "INSERT INTO comments (IID, USERID, MESSAGE, TS) VALUES (" + values + ")";

    return genericRun(sqlStr);
}

// Generic  run of sql
function genericRun(sqlStr) {
    var p = new Promise((resolve, reject) => {
        db.serialize(() => {
            db.run(sqlStr, (err) => {
                console.log('Running:  ' + sqlStr)
                if (err) {
                    reject(err);
                }
                resolve();
            });
        });
    });

    return p;
}

// Generic fetch with data.
function genericFetch(sqlStr, target, index) {
    console.log('Running with:  ' + sqlStr);

    var p = new Promise((resolve, reject) => {
        db.serialize(() => {
            db.all(sqlStr, (err, rows) => {
                if (err) {
                    reject(err);
                }
                resolve(rows);
            });
        });
    }).then(
        (rows) => {
            var outputData = {};
            for (row of rows) {
                console.log('Row returned:  ' + JSON.stringify(row));

                var targetObj = Object.create(target);

                for (akey in targetObj) {
                    targetObj[akey] = row[akey.toUpperCase()];
                }

                outputData[targetObj[index]] = targetObj;
            }

            console.log('Returning:  ' + JSON.stringify(outputData));

            return outputData;
        }
    );

    return p;
}

exports.selectImagesFor = (uid) => {
    var quid = asMyQuote(uid);
    var command = "SELECT * FROM images WHERE USERID = " + quid;

    var p = genericFetch(command, image, 'iid');

    return p;
}

exports.selectCommentsForImage = (iid) => {
    var command = "SELECT * FROM comments WHERE IID=" + iid;
    var p = genericFetch(command, comment, 'commentid');

    return p;
}

exports.selectAllComments = () => {
    return new Promise(
        (resolve, reject) => {
            db.serialize(function () {
                db.all("SELECT * FROM comments", 
                    function (err, rows) {
                        if (err) {
                            reject("comments table does not exist");                            
                        } else {
                            resolve(rows);
                        }

                });
            });
        });    
}

exports.selectUserFeed = (userid) => {
    var command = 'SELECT * FROM images, followrel where followrel.LEADERID = images.USERID and followrel.FOLLOWERID = ' + asMyQuote(userid) + ' ORDER BY images.TS DESC';
    var p = genericFetch(command, image, 'iid');
    return p;
}

// initDB(db);

function debugit() {
    var xuid = 1;
    console.log("Insert Test Users");
    insertUser('bbarker', 'Bob Barker', 'password', 'barker.jpg');
    insertUser('wmartindale', 'Wink Martindale', 'password', 'barker.jpg');
    insertUser('psajak', 'Pat Sajak', 'password', 'barker.jpg');
    insertUser('cwoolery', 'Chuck Woolery', 'password', 'barker.jpg');

    console.log("Add Images");
    insertImage('testimage1.jpg', 'bbarker');
    insertImage('testimage11.jpg', 'bbarker');
    insertImage('testimage2.jpg', 'wmartindale');
    insertImage('testimage3.jpg', 'psajak');
    insertImage('testimage4.jpg', 'cwoolery');
}
