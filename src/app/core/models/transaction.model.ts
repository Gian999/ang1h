export interface Transaction {
  id: string;
  userId: string;
  cardId: string;
  tipo: 'recarga' | 'pasaje' | 'vinculacion';
  monto: number;
  descripcion: string;
  detalles?: TransactionDetails;
  fecha: Date;
  estado: 'exitoso' | 'pendiente' | 'fallido';
}

export interface TransactionDetails {
  method?: string; // Para recargas
  adultos?: number; // Para pasajes
  escolares?: number; // Para pasajes
  ruta?: string; // Para pasajes
  codigoRecarga?: string; // Para recargas en sede
}

export const TARIFAS = {
  ADULTO: 1.00,
  ESCOLAR: 0.50
};
