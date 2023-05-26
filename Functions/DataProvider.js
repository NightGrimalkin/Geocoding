const FileData = require("./../Class/FileDataClass");
const ZabbixData = require("./../Class/ZabbixDataClass");
const fs = require("fs");
const fetch = require("node-fetch");
const { parse } = require("csv-parse");
const https = require("https");

const httpsAgent = new https.Agent({
  rejectUnauthorized: false,
});

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

const getHostsId = async () => {
  let zabbixData;
  await fetch(process.env.ZABBIX_API, {
    agent: httpsAgent,
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      jsonrpc: "2.0",
      method: "host.get",
      params: {
        output: ["hostid", "name"],
      },
      id: 1,
      auth: process.env.API_KEY,
    }),
  })
    .then((data) => {
      return data.json();
    })
    .then((data) => {
      if (Object.hasOwn(data, "error")) {
        throw new Error("Błąd połączenia z api Zabbixa, sprawdź API_KEY");
      }
      zabbixData = data.result;
    })
    .catch((error) => {
      console.log(error.message);
      process.exit(1);
    });
  return zabbixData;
};

const convertHostsToSaveFormat = async (hostsfromFile) => {
  const hostsFromZabbix = await getHostsId();
  const hostsToUpdate = [];
  const invalidHosts = [];
  let modifiedHost;
  for (const zabbixHost in hostsFromZabbix) {
    for (const host in hostsfromFile) {
      if (hostsFromZabbix[zabbixHost].name.includes(hostsfromFile[host].name)) {
        modifiedHost = new ZabbixData(
          hostsFromZabbix[zabbixHost].hostid,
          hostsfromFile[host].inventory
        );
        hostsToUpdate.push(modifiedHost);
      } else {
        if (!invalidHosts.includes(hostsfromFile[host])) {
          invalidHosts.push(hostsfromFile[host]);
        }
      }
    }
  }
  return { hostsToUpdate, invalidHosts };
};

module.exports = {
  getInventoryData,
  readDataFromFile,
  convertHostsToSaveFormat,
};
