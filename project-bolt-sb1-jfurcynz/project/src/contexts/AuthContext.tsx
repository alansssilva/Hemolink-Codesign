import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  register: (userData: any) => Promise<boolean>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Verificar se há usuário logado no localStorage
    const storedUser = localStorage.getItem('hemolink_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      // Simular autenticação
      if (email === 'admin@hemolink.com' && password === 'admin123') {
        const adminUser: User = {
          id: '1',
          name: 'Administrador',
          email: 'admin@hemolink.com',
          role: 'admin'
        };
        setUser(adminUser);
        localStorage.setItem('hemolink_user', JSON.stringify(adminUser));
        return true;
      } else if (email === 'doador@example.com' && password === 'doador123') {
        const donorUser: User = {
          id: '2',
          name: 'João Silva',
          email: 'doador@example.com',
          role: 'donor',
          donorProfile: {
            id: '2',
            name: 'João Silva',
            email: 'doador@example.com',
            phone: '(22) 99999-9999',
            bloodType: 'O+',
            birthDate: '1990-05-15',
            address: 'Rua das Flores, 123',
            city: 'Campos dos Goytacazes',
            registrationDate: '2024-01-15',
            lastDonation: '2024-11-15',
            totalDonations: 5,
            points: 500,
            isActive: true
          }
        };
        setUser(donorUser);
        localStorage.setItem('hemolink_user', JSON.stringify(donorUser));
        return true;
      }
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: any): Promise<boolean> => {
    setIsLoading(true);
    try {
      // Simular registro
      const newUser: User = {
        id: Date.now().toString(),
        name: userData.name,
        email: userData.email,
        role: 'donor',
        donorProfile: {
          id: Date.now().toString(),
          name: userData.name,
          email: userData.email,
          phone: userData.phone,
          bloodType: userData.bloodType,
          birthDate: userData.birthDate,
          address: userData.address,
          city: userData.city,
          registrationDate: new Date().toISOString(),
          totalDonations: 0,
          points: 0,
          isActive: true
        }
      };
      setUser(newUser);
      localStorage.setItem('hemolink_user', JSON.stringify(newUser));
      return true;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('hemolink_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, register, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};