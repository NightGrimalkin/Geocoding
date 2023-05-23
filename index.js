require("dotenv").config();
const fetch = require("node-fetch");
const dataProvider =  require('./Functions/DataProvider');
const dataModifier = require('./Functions/DataModify');
const updateInventoryData = require('./Functions/DataSave');

// console.log(dataProvider);
// console.log(dataModifier);
// console.log(updateInventoryData);

const callingAsyncAPIs = async () => {
  // console.log("Getting data from ZABBIX");
  // const inventoryData = await dataProvider.getInventoryData();
  // const filteredInventoryData = dataModifier.filterInventoryData(inventoryData.result);
  // console.log(`Detected ${filteredInventoryData.length} hosts requireing update`);
  // console.log(`Modyfying geodata`);
  // const modifiedInventoryData = await dataModifier.modifyInventoryData(filteredInventoryData);
  // console.log(`Updating ZABBIX data`);
  // await updateInventoryData(modifiedInventoryData);
  // console.log(`Update complete, finishing`);
  const zabbixFileData1 = await dataProvider.readDataFromFile(process.env.FILE_NAME_1);
  const zabbixFileData2 = await dataProvider.readDataFromFile(process.env.FILE_NAME_2);
  const zabbixFileData = zabbixFileData1.concat(zabbixFileData2);
  console.log(zabbixFileData);
  const hosts =await dataProvider.convertHostsToSaveFormat(zabbixFileData);
  await updateInventoryData(hosts);
};

callingAsyncAPIs();
