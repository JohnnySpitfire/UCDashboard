import Home from './components/Home/Home';
import React, { useState } from "react";
import { ProfileData } from "./components/ProfileData/ProfileData";
import { callMsGraph } from "./graph";
import { useMsal } from "@azure/msal-react";
import { loginRequest } from "./authConfig";
import EmailInbox from './components/EmailInbox/EmailInbox';

function ProfileContent() {
  const { instance, accounts } = useMsal();
  const [graphData, setGraphData] = useState(null);

  const name = accounts[0] && accounts[0].name;

  function RequestProfileData() {
      const request = {
          ...loginRequest,
          account: accounts[0]
      };

      // Silently acquires an access token which is then attached to a request for Microsoft Graph data
      instance.acquireTokenSilent(request).then((response) => {
          callMsGraph(response.accessToken).then(response => setGraphData(response));
      }).catch((e) => {
          instance.acquireTokenPopup(request).then((response) => {
              callMsGraph(response.accessToken).then(response => setGraphData(response));
          });
      });
  }

  return (
      <div>
          <h5 className="card-title">Welcome {name}</h5>
          {graphData ? 
              <ProfileData graphData={graphData} />
              :
              <button variant="secondary" onClick={RequestProfileData}>Request Profile Information</button>
          }
      </div>
  );
};

class App extends React.Component {

  constructor(props) {
    super()
      this.state = {
        accessToken: ""
      }
  }

  render(){
    console.log(this.state.accessToken);
    return (
      <div className="App">
        <Home/>
        <ProfileContent/>
        <EmailInbox/>
      </div>
    );
  }
}

export default App;
