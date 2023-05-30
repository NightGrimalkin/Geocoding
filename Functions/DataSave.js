const fs = require("fs");
const fetch = require("node-fetch");
const https = require("https");

const httpsAgent = new https.Agent({
  rejectUnauthorized: false,
});

const updateInventoryData = async (inventoryData) => {
  for (const inventory in inventoryData) {
    await updateHostInventory(inventoryData[inventory]);
  }
};

const updateHostInventory = async (modifiedInventoryData) => {
  const request =  {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      jsonrpc: "2.0",
      method: "host.update",
      params: {
        hostid: modifiedInventoryData.hostid,
        inventory: {
          location: modifiedInventoryData.inventory.location,
          location_lat: modifiedInventoryData.inventory.location_lat,
          location_lon: modifiedInventoryData.inventory.location_lon,
        },
      },
      auth: process.env.API_KEY,
      id: 1,
    }),
  }
  if(process.env.PROTOCOL=="HTTP"){
    request.agent = httpsAgent;
  }
  await fetch(process.env.ZABBIX_API,request)
    .then((data) => {
      return data.json();
    })
    .then((data) => {
      zabbixData = data;
      console.log(`Updated host:`);
      console.log(data);
    })
    .catch((error) => {
      console.log(error.status, error.statusText);
    });
};

const createRaport = async (invalidHosts) => {
  return new Promise((resolve, reject) => {
    const date = new Date();
    const dateString = `${date.toLocaleDateString()} ${date.getHours()}:${date.getMinutes()}`;
    const fd = fs.createWriteStream("./Raports/raport.txt");
    fd.write(`Raport z ${dateString} \n`);
    fd.write(`Nie udał się update ${invalidHosts.length} hostów \n`);
    if (invalidHosts.length != 0) {
      invalidHosts.forEach((host) => {
        fd.write(`${JSON.stringify(host)} \n`);
      });
    }
    fd.end();
    fd.on("finish", ()=>{resolve()});
    fd.on("error", (error)=>{reject(error)})
  });
};

module.exports = { updateInventoryData, createRaport };
