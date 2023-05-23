const updateInventoryData = async (inventoryData) => {
    for (const inventory in inventoryData) {
      await updateHostInventory(inventoryData[inventory]);
    }
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
      .catch((error) => {
        console.log(error.status, error.statusText);
      });
  };

module.exports = updateInventoryData;