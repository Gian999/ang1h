// EJEMPLO de configuración de producción
// Copiar este archivo a src/environments/environment.prod.ts
// y reemplazar las URLs con las de tu servidor

export const environment = {
  production: true,
  
  // OPCIÓN 1: Backend en mismo dominio (recomendado)
  apiUrl: 'https://tudominio.com/api',
  wsUrl: 'https://tudominio.com/ws',
  
  // OPCIÓN 2: Backend en subdominio
  // apiUrl: 'https://api.tudominio.com/api',
  // wsUrl: 'https://api.tudominio.com/ws',
  
  // OPCIÓN 3: Backend en servidor separado
  // apiUrl: 'https://backend-server.com/api',
  // wsUrl: 'https://backend-server.com/ws',
  
  // Mapbox token (dejar como está o usar tu propio token)
  mapboxToken: 'pk.eyJ1IjoibWFydGluem9ycmlsbGEiLCJhIjoiY20zNGswNjc5MDNhOTJxcHlmZnoxZTliaCJ9.QqfPJxe3UyWo6w5OYs8Uow'
};
