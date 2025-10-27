export interface User {
  id: string;
  dni: string;
  nombres: string;
  apellidos: string;
  fechaNacimiento: Date;
  email: string;
  celular: string;
  distrito: string;
  createdAt: Date;
}

export interface RegisterDto {
  dni: string;
  nombres: string;
  apellidos: string;
  fechaNacimiento: Date;
  email: string;
  celular: string;
  distrito: string;
  password: string;
}

export interface LoginDto {
  identifier: string; // DNI o Email
  password: string;
}
