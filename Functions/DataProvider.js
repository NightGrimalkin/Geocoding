const FileData = require("./../Class/FileDataClass");
const ZabbixData = require("./../Class/ZabbixDataClass");
const fs = require("fs");
const fetch = require("node-fetch");
const { parse } = require("csv-parse");

const readDataFromFile = async (file) => {
  const arrayOfHosts = [];
  const fd = fs
    .createReadStream("./DataFiles/" + file)
    .pipe(parse({ delimiter: "|", from_line: 2 }))
    .on("data", function (row) {
      if (file == process.env.FILE_NAME_1) {
        let inventoryData = { location_lat: row[17], location_lon: row[16] };
        let hostData = new FileData(row[2], inventoryData);
        arrayOfHosts.push(hostData);
      }
      if (file == process.env.FILE_NAME_2) {
        let inventoryData = { location_lat: row[16], location_lon: row[15] };
        let hostData = new FileData(row[0], inventoryData);
        arrayOfHosts.push(hostData);
      }
    });
  let readStreamPromise = new Promise(function (resolve, reject) {
    fd.on("end", () => resolve(arrayOfHosts));
    fd.on("error", reject);
  });
  return await readStreamPromise;
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
    .catch((error) => {
      console.log(error.status, error.statusText);
    });
  return zabbixData;
};

const getHostIdByName = async (hostName) => {
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
        filter: {
          name: hostName,
        },
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
    .catch((error) => {
      console.log(error.status, error.statusText);
    });
  return zabbixData;
};

const convertHostsToSaveFormat = async (hostsfromFile) => {
  const hostsToUpdate = [];
  const invalidHosts = [];
  let modifiedHost;
  for (const host in hostsfromFile) {
    const hostId = await getHostIdByName(hostsfromFile[host].name);
    if (hostId.result.length == 0) {
      invalidHosts.push(hostsfromFile[host]);
    } else {
      modifiedHost = new ZabbixData(
        hostId.result[0].hostid,
        hostsfromFile[host].inventory
      );
      hostsToUpdate.push(modifiedHost);
    }
  }
  return {hostsToUpdate, invalidHosts};
};

module.exports = {
  getInventoryData,
  readDataFromFile,
  convertHostsToSaveFormat,
};
