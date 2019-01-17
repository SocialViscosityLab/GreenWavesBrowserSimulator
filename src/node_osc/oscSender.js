/**
* This class is used in conjunction with the script osc_indesx.js
A unique global instance of this class class is created at the initial setup.
That instance is used to broadcast OSC messages through a local server running
on Node. The server details are in the osc_index.js script

This uses the library osc.js

Ideally this should be a singleton pattern...
*/
class OSCSender{
  constructor(){
    this.osc = new OSC();
    this.osc.open();
  }

  /**
  * Sends messages over this instance of OSC class
  * @param {String} pattern An osc address pattern starting with '/'
  * @param {String, Number} data A message in String or Number datatype
  *
  */
  send (pattern, data){
    let message;
    console.log(pattern,data);
    if(pattern){
      message = new OSC.Message(pattern, data);
    }else{
      message = new OSC.Message('/OSCSender', data);
    }
    this.osc.send(message);
  }
}
