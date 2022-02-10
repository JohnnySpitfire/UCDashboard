import React, {useState} from "react";
import { useNavigate } from "react-router-dom";
import { useMsal } from "@azure/msal-react";
import { loginRequest } from "../../authConfig";
import './signin.css'
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import DialogTitle from '@mui/material/DialogTitle';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';


async function handleLogin(instance){
    const loginResponse = await instance.loginPopup(loginRequest)
    const queryResponse = await fetch('http://localhost:3000/queryuserdata', {
    method: 'POST',
    headers: {'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'},
    body: JSON.stringify({id: loginResponse.tenantId})
    })

    if (queryResponse.status === 404){
        return true
    } else if (queryResponse.status === 200){
        return false;
    } else {
        console.error('an error has occoured');
    }
}

function TimetableDialog(props) {
    const { onClose, open } = props;
    const [timetableStr, setTimetableStr] = useState();
  
    const handleClose = () => {
        onClose(timetableStr);
    };

    const onTextChange = (event => {
        const timetableUrl = event.target.value;
        const timeTableID = timetableUrl.slice(timetableUrl.lastIndexOf('/') + 1, timetableUrl.length);
        setTimetableStr(timeTableID);
    })
  
    return (
      <Dialog id='color-dialog' onClose={handleClose} open={open}>
        <DialogTitle>Copy your timetable url from MyTimetable</DialogTitle>
        <DialogContent>
            <TextField fullWidth id="standard-basic" label="Timetable Link" variant="standard" onChange={onTextChange}/>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>OK</Button>
        </DialogActions>
      </Dialog>
    );
  }

function SignIn() {
    const [isNewUser, setIsNewUser] = useState(false);

    let navigate = useNavigate();
    const { instance } = useMsal();

    const handleClose = (timetableStr) => {
        console.log(timetableStr);
        setIsNewUser(false);
        navigate(`/Home:${timetableStr}`);
    };

    const onLoginButtonClick = async () => {
        const isNewUser = await handleLogin(instance);
        setIsNewUser(isNewUser);
        if(!isNewUser){navigate('/Home')}
    }

    console.log(isNewUser);

    return(
        <div className="sign-in-wrapper">
            <div className="sign-in-content">
                <h2>Welcome To the UC Dashboard</h2>
                {isNewUser? <Button disable variant="contained">Sign in With Microsoft</Button>:
                            <Button variant="contained" onClick={() => {onLoginButtonClick();}}>Sign in With Microsoft</Button>}
                 <TimetableDialog onClose={handleClose} open={isNewUser}/>
            </div>
        </div>

    )
}

export default SignIn;