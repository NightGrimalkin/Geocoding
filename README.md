# Used Services


This project uses information from, [© Copyright Maps.co](https://geocode.maps.co/)'s free Geocoding API which is made available by <br /> [© OpenStreetMap contributors](https://www.openstreetmap.org/copyright) under  [Open Database License (ODbL)](https://opendatacommons.org/licenses/odbl/1-0/).

# Documentation
Functions:
 1. `getInventoryData` returns an object containing array of all zabbix host's ids and inventories containing: location, lon, lat
 2. `filterInventoryData` returns new array of objects which have location set and don't have lon and lat set
 3. `modifyInventoryData` returns an object with geocoded lon and lat based on locataion parameter in the passed object
 4. `updateInventoryData` executes `updateHostInventory` updating hosts with new lon and lat values
 5. `sleep` stops thread for given amount of ms (used to prevent geocoding API overload)
 6. `callingAsyncAPIs` controls flow of script   
7. `updateHostInventory` makes call to zabbix API updating one host with data passed in param 
8. `convertAdresstoGeolocation` takes in adress andd returns object containing geolocation data


