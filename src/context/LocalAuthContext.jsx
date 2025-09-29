import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [donors, setDonors] = useState([]);
  const [stockLevels, setStockLevels] = useState([]);
  const [donations, setDonations] = useState([]);

  // Dados iniciais de doadores
  const initialDonors = [
    {
      id: 'donor-1',
      name: 'João Silva',
      email: 'joao@email.com',
      phone: '(11) 99999-9999',
      bloodType: 'O+',
      postalCode: '01234-567',
      birthDate: '1990-05-15',
      weight: '75',
      height: '175',
      lastDonationDate: '2024-12-01',
      medicalHistory: '',
      medications: '',
      allergies: 'Nenhuma',
      registeredAt: new Date().toISOString()
    },
    {
      id: 'donor-2',
      name: 'Maria Santos',
      email: 'maria@email.com',
      phone: '(11) 88888-8888',
      bloodType: 'A+',
      postalCode: '04567-890',
      birthDate: '1985-08-22',
      weight: '65',
      height: '165',
      lastDonationDate: '2024-11-15',
      medicalHistory: '',
      medications: '',
      allergies: 'Penicilina',
      registeredAt: new Date().toISOString()
    }
  ];

  // Dados iniciais de estoque (em unidades)
  const initialStockLevels = [
    { id: '1', blood_type: 'A+', units: 85, status: 'high', last_updated: new Date().toISOString() },
    { id: '2', blood_type: 'A-', units: 60, status: 'stable', last_updated: new Date().toISOString() },
    { id: '3', blood_type: 'B+', units: 45, status: 'low', last_updated: new Date().toISOString() },
    { id: '4', blood_type: 'B-', units: 20, status: 'critical', last_updated: new Date().toISOString() },
    { id: '5', blood_type: 'AB+', units: 75, status: 'stable', last_updated: new Date().toISOString() },
    { id: '6', blood_type: 'AB-', units: 55, status: 'stable', last_updated: new Date().toISOString() },
    { id: '7', blood_type: 'O+', units: 30, status: 'low', last_updated: new Date().toISOString() },
    { id: '8', blood_type: 'O-', units: 15, status: 'critical', last_updated: new Date().toISOString() },
  ];

  useEffect(() => {
    // Verificar se há usuário logado no localStorage
    const savedUser = localStorage.getItem('hemolink_user');
    const savedProfile = localStorage.getItem('hemolink_profile');
    const savedDonors = localStorage.getItem('hemolink_donors');
    const savedStock = localStorage.getItem('hemolink_stock');
    const savedDonations = localStorage.getItem('hemolink_donations');

    if (savedUser && savedProfile) {
      setUser(JSON.parse(savedUser));
      setUserProfile(JSON.parse(savedProfile));
    }

    // Carregar dados iniciais se não existirem
    if (savedDonors) {
      setDonors(JSON.parse(savedDonors));
    } else {
      setDonors(initialDonors);
      localStorage.setItem('hemolink_donors', JSON.stringify(initialDonors));
    }

    if (savedStock) {
      setStockLevels(JSON.parse(savedStock));
    } else {
      setStockLevels(initialStockLevels);
      localStorage.setItem('hemolink_stock', JSON.stringify(initialStockLevels));
    }

    if (savedDonations) {
      setDonations(JSON.parse(savedDonations));
    } else {
      setDonations([]);
      localStorage.setItem('hemolink_donations', JSON.stringify([]));
    }

    setLoading(false);
  }, []);

  // LOGIN
  const signIn = async (email, password) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      const users = JSON.parse(localStorage.getItem('hemolink_users')) || [];
      const foundUser = users.find(u => u.email === email && u.password === password);

      if (!foundUser) {
        throw new Error('Email ou senha incorretos');
      }

      const userData = {
        id: foundUser.id,
        email: foundUser.email,
        created_at: new Date().toISOString()
      };

      const profileData = {
        id: foundUser.id,
        user_id: foundUser.id,
        name: foundUser.name,
        role: foundUser.role,
        phone: foundUser.phone,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        donor_profiles: foundUser.role === 'donor' ? [{
          id: foundUser.id,
          profile_id: foundUser.id,
          blood_type: foundUser.blood_type,
          postal_code: foundUser.postal_code
        }] : null,
        professional_profiles: foundUser.role === 'professional' ? [{
          id: foundUser.id,
          profile_id: foundUser.id,
          position: foundUser.position
        }] : null
      };

      setUser(userData);
      setUserProfile(profileData);
      localStorage.setItem('hemolink_user', JSON.stringify(userData));
      localStorage.setItem('hemolink_profile', JSON.stringify(profileData));

      return { user: userData, profile: profileData };
    } catch (error) {
      throw error;
    }
  };

  // CADASTRO
  const signUp = async (userData) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      const users = JSON.parse(localStorage.getItem('hemolink_users')) || [];
      if (users.find(u => u.email === userData.email)) {
        throw new Error('Email já cadastrado');
      }
      const newUser = {
        id: Date.now().toString(),
        email: userData.email,
        password: userData.password,
        name: userData.name,
        role: userData.userType,
        blood_type: userData.bloodType,
        phone: userData.phone,
        postal_code: userData.location
      };
      users.push(newUser);
      localStorage.setItem('hemolink_users', JSON.stringify(users));
      return { user: newUser };
    } catch (error) {
      throw error;
    }
  };

  const signOut = async () => {
    setUser(null);
    setUserProfile(null);
    localStorage.removeItem('hemolink_user');
    localStorage.removeItem('hemolink_profile');
  };

  const updateProfile = async (profileData) => {
    try {
      const updatedProfile = {
        ...userProfile,
        name: profileData.name,
        phone: profileData.phone,
        updated_at: new Date().toISOString()
      };

      if (userProfile?.role === 'donor') {
        updatedProfile.donor_profiles = [{
          ...userProfile.donor_profiles[0],
          blood_type: profileData.blood_type,
          postal_code: profileData.postal_code,
          last_donation_date: profileData.last_donation_date
        }];
      }

      setUserProfile(updatedProfile);
      localStorage.setItem('hemolink_profile', JSON.stringify(updatedProfile));
    } catch (error) {
      throw error;
    }
  };

  // Funções de gerenciamento de doadores
  const registerDonor = async (donorData) => {
    try {
      const newDonor = {
        id: `donor-${Date.now()}`,
        ...donorData,
        registeredAt: new Date().toISOString()
      };

      const updatedDonors = [...donors, newDonor];
      setDonors(updatedDonors);
      localStorage.setItem('hemolink_donors', JSON.stringify(updatedDonors));
      return newDonor;
    } catch (error) {
      throw error;
    }
  };

  // Funções de gerenciamento de estoque
  const updateStockLevel = async (bloodType, units) => {
    try {
      const status = units < 25 ? 'critical' : units < 50 ? 'low' : units < 80 ? 'stable' : 'high';

      const updatedStock = stockLevels.map(stock =>
        stock.blood_type === bloodType
          ? { ...stock, units, status, last_updated: new Date().toISOString() }
          : stock
      );

      setStockLevels(updatedStock);
      localStorage.setItem('hemolink_stock', JSON.stringify(updatedStock));
      return updatedStock;
    } catch (error) {
      throw error;
    }
  };

  // Funções de gerenciamento de doações
  const recordDonation = async (donationData) => {
    try {
      const newDonation = {
        id: `donation-${Date.now()}`,
        ...donationData,
        recordedAt: new Date().toISOString(),
        recordedBy: user?.id
      };

      const updatedDonations = [...donations, newDonation];
      setDonations(updatedDonations);
      localStorage.setItem('hemolink_donations', JSON.stringify(updatedDonations));

      // Atualizar estoque automaticamente
      const currentStock = stockLevels.find(s => s.blood_type === donationData.bloodType);
      if (currentStock) {
        const newUnits = currentStock.units + 1;
        await updateStockLevel(donationData.bloodType, newUnits);
      }

      // Atualizar última doação do doador
      const updatedDonors = donors.map(donor =>
        donor.id === donationData.donorId
          ? { ...donor, lastDonationDate: donationData.date }
          : donor
      );
      setDonors(updatedDonors);
      localStorage.setItem('hemolink_donors', JSON.stringify(updatedDonors));

      return newDonation;
    } catch (error) {
      throw error;
    }
  };

  // Função para obter estatísticas
  const getStockStatistics = () => {
    const total = stockLevels.reduce((sum, stock) => sum + stock.units, 0);
    const critical = stockLevels.filter(s => s.status === 'critical').length;
    const low = stockLevels.filter(s => s.status === 'low').length;
    const stable = stockLevels.filter(s => s.status === 'stable').length;
    const high = stockLevels.filter(s => s.status === 'high').length;

    return { total, critical, low, stable, high };
  };

  const value = {
    user,
    userProfile,
    signUp,
    signIn,
    signOut,
    updateProfile,
    loading,
    isAuthenticated: !!user,
    isDonor: userProfile?.role === 'donor',
    isProfessional: userProfile?.role === 'professional',
    isAdmin: userProfile?.role === 'admin',
    donors,
    stockLevels,
    donations,
    registerDonor,
    updateStockLevel,
    recordDonation,
    getStockStatistics,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
