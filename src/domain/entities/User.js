class User {
  constructor({ id, fullName, ci, email, phone, password, role }) {
    this.id = id;
    this.fullName = fullName;
    this.ci = ci;
    this.email = email;
    this.phone = phone;
    this.password = password;
    this.role = role;
    
    this.validate();
  }

  validate() {
    if (!this.fullName || typeof this.fullName !== 'string') {
      throw new Error('El nombre completo es requerido y debe ser texto');
    }
    
    if (!this.ci || !/^[0-9]+$/.test(this.ci)) {
      throw new Error('El CI es requerido y debe contener solo números');
    }
    
    if (!this.email || !/^.+@.+\..+$/.test(this.email)) {
      throw new Error('El correo electrónico es requerido y debe tener un formato válido');
    }
    
    if (!this.phone || !/^[0-9+ -]+$/.test(this.phone)) {
      throw new Error('El teléfono es requerido y debe tener un formato válido');
    }
    
    if (!this.password) {
      throw new Error('La contraseña es requerida');
    }
    
    if (!['conductor', 'gasolinera'].includes(this.role)) {
      throw new Error('El rol debe ser "conductor" o "gasolinera"');
    }
  }
}

module.exports = User;
