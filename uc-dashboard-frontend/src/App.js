import React from "react";
import './app.css';
import { Routes, Route } from "react-router-dom";
import Home from './components/Home/Home';
import SignIn from "./components/SignIn/SignIn";

class App extends React.Component {

  constructor(props) {
    super()
      this.state = {
        isLoggedIn: false
      }
  }

  render(){
    return (
      <div className="App">
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css?family=Roboto:300,400,500,700&display=swap"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/icon?family=Material+Icons"
        />
        <Routes>
          <Route path="/Home" element={<Home/>}/>
          <Route path="/" element={<SignIn/>}/>
        </Routes>
      </div>
    );
  }
}

export default App;
