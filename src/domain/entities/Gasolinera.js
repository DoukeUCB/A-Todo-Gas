export class Gasolinera {
  constructor(userId, name, address, openTime, closeTime, id = null) {
    this.id = id;
    this.userId = userId;
    this.name = name;
    this.address = address;
    this.openTime = openTime;
    this.closeTime = closeTime;
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }

  validate() {
    if (!this.userId || !this.name || !this.address || !this.openTime || !this.closeTime) {
      throw new Error("Faltan datos obligatorios para registrar la gasolinera");
    }
        return true;
  }
}
