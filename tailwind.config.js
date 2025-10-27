/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#2563EB',      // Azul principal
        secondary: '#059669',    // Verde (recargas, éxito)
        background: '#F8FAFC',   // Gris muy claro (fondo)
        emphasis: '#F59E0B',     // Ámbar (alertas, acciones secundarias)
        error: '#DC2626',        // Rojo para errores
        success: '#059669',      // Verde para éxitos
      },
      fontFamily: {
        sans: ['Inter', 'Roboto', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
