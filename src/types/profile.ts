export type AccountType = 'patient' | 'donor';

export type UserProfile = {
  uid: string;
  accountType: AccountType;
  age: number;
  bloodGroup: string;
  phoneNumber: string;
  emergencyContact?: string;
  treatingHospital?: string;
  isAvailable?: boolean;
  completedAt: string;
};

export type DonorDirectoryEntry = {
  uid: string;
  accountType: 'donor';
  bloodGroup: string;
  isAvailable: boolean;
};
