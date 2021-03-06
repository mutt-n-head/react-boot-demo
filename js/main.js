import React from "react";
import {render} from 'react-dom';
import styles from '../html/myStyle.css';
import ReactDOM from 'react-dom';
import $ from 'jquery';


class Main extends React.Component {
    constructor() {
        super();
        this.state = {
            clickCount: 0,
        };
    }
    render() {
        return <div className={styles.base}>
            <div className={styles.login} id="loginPage">
                <br/>
                <img src="/html/instagramIcon.jpg" alt="Profile Pic" height="300" width="300"/>
                <br/>
                <input type = "text" name = "User Name " id = "username" value = "User Name"/>
                <br/>
                <input type="button" className={styles.btn} value="Login" onClick={this.logon.bind(this) }></input>
            </div>
            <div className={styles.userprofile} id="userProfile">
                <input type="button" className ={styles.btn} value="Logout" onClick={this.logout.bind(this) }></input>
            </div>
            <div className={styles.usertimeline} id="timeline">

            </div>
        </div>

    }
    logon(event) {
        event.preventDefault();
        document.getElementById("loginPage").style.display = "none";
        document.getElementById("userProfile").style.display = "";
        document.getElementById("timeline").style.display = "";
    }
    logout(event) {
        event.preventDefault();
        document.getElementById("loginPage").style.display = "";
        document.getElementById("userProfile").style.display = "none";
        document.getElementById("timeline").style.display = "none";
    }
    displayTimeline(data) {
        for (var c in data) {
            var newElement = document.createElement('div');
            newElement.id = data[c]; newElement.className = "followingPics";
            newElement.innerHTML = data[c].bearjpg;
            document.getElementById("timeline").appendChild(newElement);
        }
    }
}

// test
var CommentBox = React.createClass({
    loadCommentsFromServer: function () {
        $.ajax({
            url: "/comments",
            dataType: 'json',
            type: 'GET',
            cache: false,
            success: function (data) {
                this.setState({ data: data });
            }.bind(this),
            error: function (xhr, status, err) {
                console.error(this.props.url, status, err.toString());
            }.bind(this)
        });

    },
    handleCommentSubmit: function (comment) {
        var comments = this.state.data;
        // Optimistically set an id on the new comment. It will be replaced by an
        // id generated by the server. In a production application you would likely
        // not use Date.now() for this and would have a more robust system in place.
        comment.COMMENTID = Date.now();
        var newComments = comments.concat([comment]);
        this.setState({ data: newComments });

        $.ajax({
            url: "/comment",
            dataType: 'json',
            type: 'POST',
            data: comment,
            success: function (data) {
                this.setState({ data: data });
            }.bind(this),
            error: function (xhr, status, err) {
                this.setState({ data: comments });
                console.error(this.props.url, status, err.toString());
            }.bind(this)
        });
    },
    getInitialState: function () {
        return { data: [] };
    },
    componentDidMount: function () {
        this.loadCommentsFromServer();
        setInterval(this.loadCommentsFromServer.bind(this), this.props.pollInterval);
    },

    render: function () {
        return (
            <div className="commentBox">
                <h1>Welcome to Instagram Clone</h1>
                <CommentList data={this.state.data}/>
                <CommentForm onCommentSubmit={this.handleCommentSubmit} />
            </div>
        );
    }
});

var CommentList = React.createClass({
    render: function () {
        var commentNodes = this.props.data.map(function (comment) {
            return (
                <Comment USERID={comment.USERID} key={comment.COMMENTID}>
                    {comment.MESSAGE}
                </Comment>
            );
        });
        return (
            <div className="commentList">
                {commentNodes}
            </div>
        );
    }
});

var CommentForm = React.createClass({
  getInitialState: function() {
    return {USERID: '', MESSAGE: ''};
  },
  handleAuthorChange: function(e) {
    this.setState({USERID: e.target.value});
  },
  handleTextChange: function(e) {
    this.setState({MESSAGE: e.target.value});
  },
  handleSubmit: function(e) {
    e.preventDefault();
    var USERID = this.state.USERID.trim();
    var MESSAGE = this.state.MESSAGE.trim();
    if (!MESSAGE || !USERID) {
      return;
    }
    this.props.onCommentSubmit({USERID: USERID, MESSAGE: MESSAGE});
    this.setState({USERID: '', MESSAGE: ''});
  },
  
  render: function () {
        return (
            <form className="commentForm" onSubmit={this.handleSubmit}>
                <input
                    type="text"
                    placeholder="Your name"
                    value={this.state.COMMENTID}
                    onChange={this.handleAuthorChange}
                    />
                <input
                    type="text"
                    placeholder="Say something..."
                    value={this.state.MESSAGE}
                    onChange={this.handleTextChange}
                    />
                <input type="submit" value="Post" />
            </form>
        );
    }
});

var Comment = React.createClass({
    render: function () {
        return (
            <div className="comment">
                <h3 className="commentAuthor">
                    {this.props.USERID}
                </h3>
                {this.props.children}
            </div>
        );
    }
});

render((
    <Main/>
), document.getElementById('main'));

ReactDOM.render(
    <CommentBox pollInterval={5000}/>,
    document.getElementById('main')
);
