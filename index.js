require("dotenv").config();
const fetch = require("node-fetch");

const getDataFromZabbix = async () => {
  let zabbixData;
  await fetch("http://localhost:8080/api_jsonrpc.php", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      jsonrpc: "2.0",
      method: "host.get",
      params: {
        output: "hostid",
        selectInventory: ["location"],
        hostids: "10615",
      },
      id: 1,
      auth: process.env.API_KEY,
    }),
  })
    .then((data) => {
      return data.json();
    })
    .then((data) => {
      zabbixData = data;
    });
  return zabbixData;
};

const convertAdressToLonLat = async (adress) => {
  let geoData;
  await fetch(`https://geocode.maps.co/search?q={${adress}}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((data) => {
      return data.json();
    })
    .then((data) => {
      geoData = data;
    });
  return geoData;
};

const callingAsyncAPIs = async () => {
  console.log("calling");
  const inventoryData = await getDataFromZabbix();
  console.log(inventoryData);
  // const geoloactionData = await convertAdressToLonLat(
  //   inventoryData.result[0].inventory.location
  // );
  // console.log(geoloactionData);
};

callingAsyncAPIs();
