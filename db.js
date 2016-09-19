var sqlite3 = require('sqlite3').verbose();

var TransactionDatabase = require("sqlite3-transactions").TransactionDatabase;
var db = new TransactionDatabase(
   new sqlite3.Database("instagram.db", sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE)
);
// var db = new sqlite3.Database('twitty.db');

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

exports.getFollowers = getFollowers;
exports.getPostCount = getPostCount;
exports.follow = follow;
exports.unfollow = unfollow;
exports.getNumYouFollow = getNumYouFollow;
exports.getNumThatFollowUser = getNumThatFollowUser;

exports.insertUser = insertUser;
exports.selectUser = selectUser;

exports.deleteImage = deleteImage;
exports.insertImage = insertImage;
exports.insertCommentForImage = insertCommentForImage;
exports.selectCommentsForImage = selectCommentsForImage;
exports.selectImagesFor = selectImagesFor;
exports.selectUserFeed = selectUserFeed;



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
    leaderid: '',
    followerid: '',
};

function initDB(db) {
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
}

function asMyQuote(input) {
    return '\'' + input + '\'';
}

// User Table functions
function insertUser(userid, uname, pw, pro) {
    var p;

    db.beginTransaction(function(err, tdb) {
        p = selectUser(userid, tdb);
        p.then(
            // Should be good data
            (users) => {
                // console.log('Insert user gettinig ' + JSON.stringify(users));
                for (user in users) {
                    if (user === userid) {
                        console.log('User already exists');
                        return {};
                    }
                }

                // Call the SQL
                var values = asMyQuote(userid) + ', ' + asMyQuote(uname) + ', ' + asMyQuote(pw) + ', ' + asMyQuote(pro);
                var sqlStr = "INSERT INTO users (USERID, NAME, PASSWORD, PROFILE) VALUES (" + values + ")";

                // console.log('Insert user callinlg sql : ' + sqlStr);

                return genericRun(sqlStr, tdb);
            }
        ).then(
            (data) => {
                tdb.commit((err) => {
                    console.log('Transaction success');
                });

                return data;
            }
        ).then(
            null,
            (err) => {
                tdb.rollback((err) => {
                    console.log('Transaction rolled back');
                });
                console.log('Transaction failed');
            }
        );
    });

    return p;
}

function selectUser(uid, mydb = db) {
    var quid = asMyQuote(uid);
    var command = "SELECT * FROM users WHERE USERID = " + quid;
    return genericFetch(command, user, 'userid', mydb);
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

// Generic  run of sql
function genericRun(sqlStr, mydb = db) {
    var p = new Promise((resolve, reject) => {
        mydb.serialize(() => {
            mydb.run(sqlStr, (err) => {
                console.log('Running:  ' + sqlStr + '    @' + new Date());
                if (err) {
                    reject(err);
                }
                resolve();
            });
        });
    });

    return p;
}

function getPostCount(userid) {
    var sqlStr = "SELECT COUNT(*) FROM images WHERE USERID = " + asMyQuote(userid);
    return genericFetchString(sqlStr);
}

function getNumThatFollowUser(userid) {
    var sqlStr = "SELECT COUNT(*) FROM followRel WHERE LEADERID = " + asMyQuote(userid);
    return genericFetchString(sqlStr);
}

function getNumYouFollow(userid) {
    var sqlStr = "SELECT COUNT(*) FROM followRel WHERE FOLLOWERID = " + asMyQuote(userid);
    return genericFetchString(sqlStr);
}

function genericFetchString(sqlStr, mydb = db) {
    var p = new Promise((resolve, reject) => {
        mydb.serialize(() => {
            mydb.each(sqlStr, (err, row) => {
                // console.log(JSON.stringify(row));
                // console.log(row['COUNT(*)']);

                if (err) {
                    reject(err);
                }

                resolve(row['COUNT(*)']);
                // resolve(row);
            });
        });
    });

    return p;
}

// Generic fetch with data.
function genericFetch(sqlStr, target, index, mydb = db) {
    console.log('Running with:  ' + sqlStr + '@' + new Date());

    var p = new Promise((resolve, reject) => {
        mydb.serialize(() => {
            mydb.all(sqlStr, (err, rows) => {
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
                // console.log('Row returned:  ' + JSON.stringify(row));

                var targetObj = Object.create(target);

                for (akey in targetObj) {
                    targetObj[akey] = row[akey.toUpperCase()];
                }

                outputData[targetObj[index]] = targetObj;
            }

            // console.log('Returning:  ' + JSON.stringify(outputData));

            return outputData;
        },
        (err) => {
            return {};
        }
    );

    return p;
}

function selectImagesFor(uid) {
    var quid = asMyQuote(uid);
    var command = "SELECT * FROM images WHERE USERID = " + quid;

    var p = genericFetch(command, image, 'iid');

    return p;
}

function selectCommentsForImage(iid) {
    var command = "SELECT * FROM comments WHERE IID=" + iid;
    var p = genericFetch(command, comment, 'commentid');

    return p;
}

function insertCommentForImage(iid, userid, comment) {
    var values = iid + ', ' + asMyQuote(userid) + ', ' + asMyQuote(comment) + ', ' + asMyQuote(new Date());
    var sqlStr = "INSERT INTO comments (IID, USERID, MESSAGE, TS) VALUES (" + values + ")";

    p = genericRun(sqlStr);

    return p;
};

function selectUserFeed(userid) {
    var command = 'SELECT * FROM images, followrel where followrel.LEADERID = images.USERID and followrel.FOLLOWERID = ' + asMyQuote(userid) + ' ORDER BY images.TS DESC';
    var p = genericFetch(command, image, 'iid', db);
    return p;
}

// Follower operations for API
function follow(follower, leader) {
    // The DB won't allow you to put duplicate in here.
    // Just check first.
    var p


    db.beginTransaction(function(err, tdb) {
        p = getFollowers(leader, tdb);
        p.then(
            (data) => {
                // console.log('Got data from followers call: ' + JSON.stringify(data));
                // Check each to see if duplicates
                for (key in data) {
                    // console.log('Attempting to insert ' + follower + ' into ' + data[key]);

                    if (data[key].userid === follower) {
                        // Already following just return
                        console.log(follower + ' already following ' + leader);
                        return;
                    }
                }

                var qlead = asMyQuote(leader);
                var qfollow = asMyQuote(follower);
                var values = qlead + ', ' + qfollow;
                var command = 'INSERT INTO followRel (LEADERID, FOLLOWERID) VALUES (' + values + ')';

                return genericRun(command, tdb);
            }
        ).then(
            (data) => {
                tdb.commit((err) => {
                    console.log('Transaction success');
                });
            }
        ).catch(
            (err) => {
                tdb.rollback((err) => {
                    console.log('Transaction failed');
                });
            }
        );
    });

    return p;
}

function unfollow(follower, leader) {
    var qlead = asMyQuote(leader);
    var qfollow = asMyQuote(follower);
    var command = "DELETE FROM followRel WHERE LEADERID = " + qlead + " AND FOLLOWERID = " + qfollow;
    return genericRun(command);
}

function getFollowers(leader, mydb = db) {
    var qlead = asMyQuote(leader);
    var sqlStr = 'SELECT * FROM users, followRel WHERE followRel.LEADERID = ' + qlead + ' AND followRel.FOLLOWERID = users.USERID';

    return genericFetch(sqlStr, user, 'userid', mydb);
}

initDB(db);

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

    console.log("Add followers some duplicate");
    follow('wmartindale', 'bbarker');
    follow('psajak', 'bbarker');
    follow('cwoolery', 'bbarker');
    follow('wmartindale', 'bbarker');
    follow('cwoolery', 'bbarker');
    follow('bbarker', 'cwoolery');
    follow('cwoolery', 'psajak');
    follow('psajack', 'wmartindale');
    follow('cwoolery', 'wmartindale');

    console.log("Adding comments");

}


debugit();
