require("dotenv").config();
const fetch = require("node-fetch");

const filterInventoryrData = (inventoryData) => {
  let filtredData = [];
  inventoryData.forEach((data) => {
    if (data.inventory.location == "") {
      return;
    }
    if (
      data.inventory.location_lat != "" &&
      data.inventory.location_lon != ""
    ) {
      return;
    }
    filtredData.push(data);
  });
  return filtredData;
};

const getInventoryData = async () => {
  let zabbixData;
  await fetch(process.env.ZABBIX_API, {
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
    })
    .catch((error)=>{
      console.log(error.status, error.statusText);
    });
  return zabbixData;
};

const updateHostInventory = async (modifiedInventoryData) => {
  await fetch(process.env.ZABBIX_API, {
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
  })
    .then((data) => {
      return data.json();
    })
    .then((data) => {
      zabbixData = data;
      console.log(`Updated host:`);
      console.log(data);
    })
    .catch((error)=>{
      console.log(error.status, error.statusText);
    });
};

const convertAdressToGeolocation = async (location) => {
  let geoData;
  await fetch(`https://geocode.maps.co/search?q={${location}}`, {
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
    })
    .catch((error)=>{
      console.log(error.status, error.statusText);
    });
  return geoData;
};
async function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

const modifyInventoryData = async (inventoryData) => {
  const geoloactionDataToUpdate = [];
  let modifiedHost;
  let geoData;
  for (const inventory in inventoryData) {
    await sleep(600);
    modifiedHost = inventoryData[inventory];
    geoData = await convertAdressToGeolocation(modifiedHost.inventory.location);
    modifiedHost.inventory.location_lon =
      geoData.length > 0 ? geoData[0].lon.substring(0,16) : "";
    modifiedHost.inventory.location_lat =
      geoData.length > 0 ? geoData[0].lat.substring(0,16) : "";
    geoloactionDataToUpdate.push(modifiedHost);
  }
  return geoloactionDataToUpdate;
};

const updateInventoryData = async (inventoryData) => {
  for (const inventory in inventoryData) {
    await updateHostInventory(inventoryData[inventory]);
  }
}

const callingAsyncAPIs = async () => {
  console.log("Getting data from ZABBIX");
  const inventoryData = await getInventoryData();
  const filteredInventoryData = filterInventoryrData(inventoryData.result);
  console.log(`Detected ${filteredInventoryData.length} hosts requireing update`);
  console.log(`Modyfying geodata`);
  const modifiedInventoryData = await modifyInventoryData(filteredInventoryData);
  console.log(`Updating ZABBIX data`);
  await updateInventoryData(modifiedInventoryData);
  console.log(`Update complete, finishing`);
};

callingAsyncAPIs();
