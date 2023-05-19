

# Used Services

This project uses information from, [© Copyright Maps.co](https://geocode.maps.co/)'s free Geocoding API which is made available by <br /> [© OpenStreetMap contributors](https://www.openstreetmap.org/copyright) under  [Open Database License (ODbL)](https://opendatacommons.org/licenses/odbl/1-0/).

# Documentation
Functions:
 1. `getInventoryData` returns an object containing array of all zabbix host's `hostid` and `inventory` containing: `location`, `location_lon`, `location_lat`
 2. `filterInventoryData`, parameter `inventoryData` is an array of objects.
Object structure:
	```
	{
		hostid: '',
		inventory:{
			location:'',
			location_lat:'',
			location_lon:'',
		}
	}
	``` 
	Function returns an array of object's which location doesn't equal `''` and which `location_lan`, `location_lon` equals `''`
3. `convertAdresstoGeolocation` takes in adress makes call to geocodin API and returns object containing geolocation data
 4. `modifyInventoryData`, parameter `inventoryData` is an array of objects with the same structure as before. It returns an array of objects with geocoded `location_lon` and `location_lat` parameters based on `location parameter`. Function calls `convertAdresstoGeolocation` for each array element and waits 600ms to prevent API from overloading
 5.  `updateHostInventory` makes call to zabbix API updating one host with object passed in the `modifiedInventoryData` parameter 
 6. `updateInventoryData` executes `updateHostInventory` for each element of `inventoryData` parameter containing an array of  modified objects ready to save.
 7. `sleep` stops thread for given amount of ms (used to prevent geocoding API overload)
 8. `callingAsyncAPIs` controls flow of script   


# Configuration
To run script on your computer you'll need:
1. Running zabbix server
2. Node.js installed, version 14+
3. Create `.env` file containing variable `API_KEY` containing key to Zabbix API and variable `ZABBIX_API` containing link to Zabbix API 
4. Run `npm install` in project's root folder  
5. Run `node index.js` in project's root folder  
