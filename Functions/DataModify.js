const fetch = require("node-fetch");

const modifyInventoryData = async (inventoryData) => {
    const geoloactionDataToUpdate = [];
    const invalidHosts =[]
    let modifiedHost;
    let geoData;
    for (const inventory in inventoryData) {
      await sleep(600);
      modifiedHost = inventoryData[inventory];
      geoData = await convertAdressToGeolocation(modifiedHost.inventory.location);
      if(geoData.length > 0){
        modifiedHost.inventory.location_lon = geoData[0].lon.substring(0, 16);
        modifiedHost.inventory.location_lat = geoData[0].lat.substring(0, 16);
        geoloactionDataToUpdate.push(modifiedHost);
      }else{
        modifiedHost.inventory.location_lon = "";
        modifiedHost.inventory.location_lat = "";
        invalidHosts.push(modifiedHost);
      }
      modifiedHost.inventory.location_lon =
        geoData.length > 0 ? geoData[0].lon.substring(0, 16) : "";
      
      delete modifiedHost.inventory.location;
      
    }
    return {geoloactionDataToUpdate, invalidHosts};
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
      .catch((error) => {
        console.log(error.status, error.statusText);
      });
    return geoData;
  };

  async function sleep(ms) {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  }

  const filterInventoryData = (inventoryData) => {
    const numberLetterRegEx = /[^0-9](?=[0-9])/g;
    const slashRegEx = /[0-9]+\/[0-9]+/g;
    const keyWords = ["HUB", "THINX", "rack: E5"];
  
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
      keyWords.forEach((keyword) => {
        data.inventory.location = data.inventory.location.replace(keyword, "");
      });
      data.inventory.location = data.inventory.location.replace(slashRegEx, "");
      data.inventory.location = data.inventory.location.replace(
        numberLetterRegEx,
        "$& "
      );
      filtredData.push(data);
    });
    return filtredData;
  };
  
module.exports={
    filterInventoryData,
    modifyInventoryData
}
  