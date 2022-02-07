import React, {useState} from "react";
import DialogTitle from '@mui/material/DialogTitle';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button'
import { HexColorPicker } from "react-colorful";


function ColorDialog(props) {
    const { onCloseOK, onCloseCancel, open } = props;
    const [selectedColor, setSelectedColor] = useState(props.classColor)
  
    const handleCloseOK = () => {
      onCloseOK(selectedColor);
    };

    const handleCloseCancel = () => {
      setSelectedColor(props.classColor);
      onCloseCancel()
    };
  
    return (
      <Dialog id='color-dialog' onClose={handleCloseOK} open={open}>
        <DialogTitle>Set a color for this subject</DialogTitle>
        <DialogContent>
         <HexColorPicker color={selectedColor} onChange={setSelectedColor}/>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseOK}>OK</Button>
          <Button onClick={handleCloseCancel}>Cancel</Button>
        </DialogActions>
      </Dialog>
    );
  }

export default ColorDialog;