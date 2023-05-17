require("dotenv").config();
const fetch = require("node-fetch");

const filterData = (hostData) => {
  let filtredData = [];
  hostData.forEach((data) => {
    if (data.inventory.location == "") {
      return;
    }
    if (
      data.inventory.location_lan != "" &&
      data.inventory.location_lon != ""
    ) {
      return;
    }
    filtredData.push(data);
  });
  return filtredData;
};

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
        selectInventory: ["location", "location_lat", "location_lon"],
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
async function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

const modifyHostData = async (hostData) => {
  const geoloactionDataToUpdate = [];
  let modifiedHost;
  let geoData;
  for (const host in hostData) {
    await sleep(600);
    modifiedHost = hostData[host];
    geoData = await convertAdressToLonLat(modifiedHost.inventory.location);
    modifiedHost.inventory.location_lon = geoData.length>0
      ? geoData[0].lon
      : "";
    modifiedHost.inventory.location_lat = geoData.length>0
      ? geoData[0].lat
      : "";
    geoloactionDataToUpdate.push(modifiedHost);
  }
  return geoloactionDataToUpdate;
};

const callingAsyncAPIs = async () => {
  const inventoryData = await getDataFromZabbix();
  const filteredData = filterData(inventoryData.result);
  console.log("FilteredData: \n ");
  console.log(filteredData);
  const hostDataToUpdate = await modifyHostData(filteredData);
  console.log("hostDataToUpdate: \n ");
  console.log(hostDataToUpdate);
};

callingAsyncAPIs();
