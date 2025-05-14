describe('Prueba de configuración básica', () => {
  it('debería pasar una suma simple', () => {
    expect(1 + 1).toBe(2);
  });
  
  it('debería cargar variables de entorno correctamente', () => {
    expect(process.env.NODE_ENV).toBe('test');
    expect(process.env.MONGODB_URI).toBeDefined();
  });
});
