import React from "react";
import {render} from 'react-dom';
import styles from '../html/myStyle.css';


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
                <input type="button" className={styles.btn} value="Login" onClick={this.logon.bind(this)}></input>
            </div>
           <div className={styles.userprofile} id="userProfile">
                <input type="button" className ={styles.btn} value="Logout" onClick={this.logout.bind(this)}></input>
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
    displayTimeline(data){
        for (var c in data) {
            var newElement = document.createElement('div');
            newElement.id = data[c]; newElement.className = "followingPics";
            newElement.innerHTML = data[c].bearjpg;
            document.getElementById("timeline").appendChild(newElement);
        } 
    }
}


render((
    <Main/>
), document.getElementById('main'));
