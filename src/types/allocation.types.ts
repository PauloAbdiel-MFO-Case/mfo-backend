export type AllocationCreationData = {
  name: string;
  type: 'FINANCEIRA' | 'IMOBILIZADA';
  value: number;
  date: Date;
  initialPayment?: number;
  installments?: number;
  interestRate?: number;
};