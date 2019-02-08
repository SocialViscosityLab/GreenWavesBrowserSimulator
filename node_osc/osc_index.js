/* Instructions from: https://medium.com/@adnanrahic/hello-world-app-with-node-js-and-express-c1eb7cfa8a30
HOW TO RUN A NODE SERVER
1. get to the directory where you want to have the server code installed
2. Initialize your project and link it to npm
  run: npm init.
  Set your entry point with the name of the entry point javascript file. In this case osc_index.js
3. Install express in osc_index.js directory
  npm install express --save
4. run the app
  node osc_index.js
*/
/*OSC example modified Processing examples */

// OSC Library:  https://www.npmjs.com/package/osc-js

const OSC = require('osc-js')

const port = 7171;

const configa = { udpClient: { port: port } }

const myOsc = new OSC({ plugin: new OSC.BridgePlugin(configa) })

myOsc.open() // start a WebSocket server on port

console.log('Listening on port ' + port);

// myOsc.on('*', message => {
//   console.log(message.args)
// })
