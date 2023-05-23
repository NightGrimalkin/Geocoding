class ZabbixData {
  constructor(hostid, inventory) {
    this.hostid = hostid;
    this.inventory = {
      location_lat: inventory.location_lat,
      location_lon: inventory.location_lon,
    };
  }
}

module.exports = ZabbixData;
