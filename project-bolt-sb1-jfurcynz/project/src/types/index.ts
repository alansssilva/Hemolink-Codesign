export interface BloodType {
  type: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
  quantity: number;
  minQuantity: number;
  lastUpdated: string;
}

export interface Donor {
  id: string;
  name: string;
  email: string;
  phone: string;
  bloodType: string;
  birthDate: string;
  address: string;
  city: string;
  registrationDate: string;
  lastDonation?: string;
  totalDonations: number;
  points: number;
  isActive: boolean;
}

export interface Donation {
  id: string;
  donorId: string;
  donorName: string;
  bloodType: string;
  date: string;
  quantity: number;
  status: 'scheduled' | 'completed' | 'cancelled';
  notes?: string;
}

export interface Appointment {
  id: string;
  donorId: string;
  donorName: string;
  donorPhone: string;
  bloodType: string;
  date: string;
  time: string;
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled';
  notes?: string;
}

export interface Campaign {
  id: string;
  title: string;
  description: string;
  targetBloodTypes: string[];
  startDate: string;
  endDate: string;
  isActive: boolean;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'donor' | 'admin' | 'staff';
  donorProfile?: Donor;
}