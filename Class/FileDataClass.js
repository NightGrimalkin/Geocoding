class FileData {
  constructor(name, inventory) {
    this.name = name;
    this.inventory = {
      location_lat: inventory.location_lat,
      location_lon: inventory.location_lon,
    };
  }
}

module.exports = FileData;
