require("dotenv").config();
const dataProvider = require("./Functions/DataProvider");
const dataModifier = require("./Functions/DataModify");
const dataSave = require("./Functions/DataSave");
const util =require('node:util');
const fs = require("fs");
const mkdir = util.promisify(fs.mkdir);

const callingAsyncAPIs = async () => {
  if (process.env.EXE_TYPE == "FILE") {
    console.log("Getting data from first file");
    const zabbixFileData1 = await dataProvider.readDataFromFile(
      process.env.FILE_NAME_1
    );
    console.log("Getting data from second file");
    const zabbixFileData2 = await dataProvider.readDataFromFile(
      process.env.FILE_NAME_2
    );
    console.log("Merging data");
    const zabbixFileData = zabbixFileData1.concat(zabbixFileData2);
    console.log("Converting names to hostid");
    const hosts = await dataProvider.convertHostsToSaveFormat(zabbixFileData);
    console.log("Updating ZABBIX data");
    await dataSave.updateInventoryData(hosts.hostsToUpdate);
    console.log("Update complete ");
    await dataSave.createRaport(hosts.invalidHosts);
    console.log("finishing");
  }
  if (process.env.EXE_TYPE == "API") {
    console.log("Getting data from ZABBIX");
    const inventoryData = await dataProvider.getInventoryData();
    const filteredInventoryData = dataModifier.filterInventoryData(
      inventoryData.result
    );
    console.log(
      `Detected ${filteredInventoryData.length} hosts requireing update`
    );
    console.log("Modyfying geodata");
    const modifiedInventoryData = await dataModifier.modifyInventoryData(
      filteredInventoryData
    );
    console.log("Updating ZABBIX data");
    await dataSave.updateInventoryData(
      modifiedInventoryData.geoloactionDataToUpdate
    );
    console.log("Update complete");
    mkdir("./Raports")
      .then(async () => {
        await dataSave.createRaport(modifiedInventoryData.invalidHosts);
      })
      .catch(async (err) => {
        if(err.code !='EEXIST') {
          throw err;
        }
        await dataSave.createRaport(modifiedInventoryData.invalidHosts);
      });
    console.log("finishing");
  }
};

callingAsyncAPIs();
