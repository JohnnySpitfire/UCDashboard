import React from "react";
import Home from './components/Home/Home';

class App extends React.Component {

  constructor(props) {
    super()
      this.state = {
      }
  }

  render(){
    return (
      <div className="App">
        <Home/>
      </div>
    );
  }
}

export default App;
