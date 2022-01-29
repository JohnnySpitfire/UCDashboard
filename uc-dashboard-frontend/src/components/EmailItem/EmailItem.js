import React from "react";
import parse from 'html-react-parser'


const EmailItem = (props) => {

    var parser = new DOMParser();
    var htmlDoc = parser.parseFromString(props.body, 'text/html');

    const bodyHTML = htmlDoc.getElementsByTagName("body")[0].innerHTML;

    return( 
        <div className = "email-item-wrapper">
            <h2>{props.subject}</h2>
            {parse(bodyHTML)}
        </div>
    )
}

export default EmailItem;