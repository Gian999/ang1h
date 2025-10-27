export interface Card {
  id: string;
  userId: string;
  numero: string; // Últimos 4 dígitos
  tipo: 'virtual' | 'fisica';
  qrCode: string;
  balance: number;
  activa: boolean;
  createdAt: Date;
}

export interface CardRechargeDto {
  amount: number;
  method: 'tarjeta' | 'billetera' | 'sede';
}
