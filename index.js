const key = require('./AppConfig');
const fetch =require('node-fetch');



const geocodingData = fetch(
  "http://localhost:8080/api_jsonrpc.php",
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    data: {"jsonrpc":"2.0","method":"apiinfo.version","params":[],"id":1},
  }
)
  .then((data) => {
    return data.json();
  })
  .then((data)=>{
    console.log(data)
  })
  