// var http = new XMLHttpRequest();
// var url = "url";
// var params = JSON.stringify({ appoverGUID: approverGUID });
// http.open("POST", url, true);

// http.setRequestHeader("Content-type", "application/json; charset=utf-8");
// http.setRequestHeader("Content-length", params.length);
// http.setRequestHeader("Connection", "close");

// http.onreadystatechange = function() {
//     if(http.readyState == 4 && http.status == 200) {
//         alert(http.responseText);
//     }
// }
// http.send(params);

var login = document.getElementById("loginButt");
var logout = document.getElementById("logout");
var user;

login.onclick = function(){
    var name = document.getElementById("username").value;
    user = name;    
    loginUser(name);
    document.getElementById("login").style.display = 'none';
};

logout.onclick = function(){
    user = "";    
    document.getElementById("login").style.display = 'inline';
    document.getElementById("logout").style.display = 'none';
};

var tweet = document.getElementById("subTweet");

tweet.onclick = function(){
    var msg = document.getElementById("tweetmsg").value;
    newTweet(user,msg);
};

function keepUser(name){
    var logUser = this.value;
    return logUser;
}

function displayTweets(data){
    var tweetCol = document.getElementById("tweetCol");
    console.log(data);
    // for (var key in data)
    // {
    //     tweetCol.innerHTML += data[key].tweet_text;
    // }
    for (var c in data) {
        var newElement = document.createElement('div');
        newElement.id = data[c]; newElement.className = "tweetClass";
        newElement.innerHTML = data[c].tweet_text;
        document.getElementById("tweetCol").appendChild(newElement);
    } 
}

function loginUser(name) { 
     var xhttp = new XMLHttpRequest(); 
     xhttp.onreadystatechange = function () { 
 
        if (this.readyState === 4 && this.status === 200) { 
            var data = JSON.parse(this.responseText); 
            console.log(data); 
            displayTweets(data);
        //  printUserId(data, name); 
        } 
    }; 
    xhttp.open("GET", "/timeline/" + name, true); 
    xhttp.send(); 
} 

function newUser(name, fullname) { 
     var xhttp = new XMLHttpRequest(); 
     xhttp.onreadystatechange = function () { 
 
        if (this.readyState === 4 && this.status === 200) { 
            var data = JSON.parse(this.responseText); 
            console.log(data); 
            displayUser(data);
        //  printUserId(data, name); 
        } 
    }; 
    xhttp.open("POST", "/newUser/" + name + '/' +fullname, true); 
    xhttp.send(); 
} 

function newTweet(name, text) { 
     var xhttp = new XMLHttpRequest(); 
     xhttp.onreadystatechange = function () { 
 
        if (this.readyState === 4 && this.status === 200) { 
            var data = JSON.parse(this.responseText); 
            console.log(data); 
        //    displayUser(data);
        //  printUserId(data, name); 
        } 
    }; 
    xhttp.open("POST", "/newTweet/" + name + '/' + text, true); 
    xhttp.send(); 
} 

