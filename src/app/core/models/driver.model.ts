export interface DriverData {
  id?: number;
  dni: string;
  nombres: string;
  apellidos: string;
  email: string;
  role?: string;
  saldo?: number;
  activo?: boolean;
  driver?: {
    id: number;
    licencia: string;
    placa: string;
    numeroRuta: string;
    nombreRuta?: string;
    isActive?: boolean;
    currentLatitude?: number;
    currentLongitude?: number;
  };
  // Campos legacy para compatibilidad
  licencia?: string;
  fechaNacimiento?: string;
  celular?: string;
  direccion?: string;
  placa?: string;
  modelo?: string;
  anio?: number;
  color?: string;
  capacidad?: number;
  numeroRuta?: string;
  empresaTransporte?: string;
  password?: string;
}

export interface DriverLoginData {
  identifier: string; // DNI o email
  password: string;
  verificationCode?: string;
}
