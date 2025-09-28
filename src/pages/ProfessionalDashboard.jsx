import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart3, Users, Activity, Bell, Plus, Edit, Save, X, LogOut, User, Check, Trash2, Settings, Download,
  TrendingUp, TrendingDown, AlertTriangle, Droplets, UserPlus, ClipboardList, RefreshCw
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/LocalAuthContext';
import { useNotification } from '../context/NotificationContext';
import Modal from '../components/Modal';
import ProfileModal from '../components/ProfileModal';
import ReportsModal from '../components/ReportsModal';
import DonorRegistrationModal from '../components/DonorRegistrationModal';
import DonationRecordModal from '../components/DonationRecordModal';
import logoHemolink from '../assets/Assinatura Visual.png';
import gotasBg from '../assets/Padronagens-27.png'; // ajuste o caminho se necessário

const ProfessionalDashboard = () => {
  const {
    user,
    userProfile,
    signOut,
    updateProfile,
    donors,
    stockLevels,
    donations,
    registerDonor,
    updateStockLevel,
    recordDonation,
    getStockStatistics
  } = useAuth();
  const { addNotification } = useNotification();

  const [applications, setApplications] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [hemocenter, setHemocenter] = useState(null);
  const [editingStock, setEditingStock] = useState(null);
  const [loading, setLoading] = useState(true);

  const [isCampaignModalOpen, setIsCampaignModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isReportsModalOpen, setIsReportsModalOpen] = useState(false);
  const [isDonorRegistrationModalOpen, setIsDonorRegistrationModalOpen] = useState(false);
  const [isDonationRecordModalOpen, setIsDonationRecordModalOpen] = useState(false);
  const [newCampaign, setNewCampaign] = useState({
    title: '', description: '', target_blood_type: 'ALL', start_date: '', end_date: ''
  });

  useEffect(() => {
    if (userProfile) fetchData();
  }, [userProfile]);

  const fetchData = async () => {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      const mockHemocenter = {
        id: '1',
        name: 'Hemocentro Vida Plena',
        address: 'Rua da Esperança, 123 - Centro',
        contact_email: 'contato@vidaplena.org',
        contact_phone: '(11) 3333-4444'
      };

      const mockApplications = [
        {
          id: '1',
          donor_user_id: 'donor-1',
          hemocenter_id: '1',
          application_date: new Date().toISOString(),
          status: 'pending',
          user_profiles: {
            name: 'João Silva',
            phone: '(11) 99999-9999',
            donor_profiles: [{ blood_type: 'O+' }]
          }
        },
        {
          id: '2',
          donor_user_id: 'donor-2',
          hemocenter_id: '1',
          application_date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          status: 'accepted',
          user_profiles: {
            name: 'Maria Santos',
            phone: '(11) 88888-8888',
            donor_profiles: [{ blood_type: 'A-' }]
          }
        }
      ];

      const mockCampaigns = [
        {
          id: '1',
          title: 'Campanha de Emergência - Tipo O-',
          description: 'Necessitamos urgentemente de doadores do tipo O-',
          target_blood_type: 'O-',
          start_date: new Date().toISOString(),
          end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          is_active: true
        },
        {
          id: '2',
          title: 'Campanha de Verão',
          description: 'Doação de sangue durante o verão',
          target_blood_type: 'ALL',
          start_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          end_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
          is_active: true
        }
      ];

      setHemocenter(mockHemocenter);
      setApplications(mockApplications);
      setCampaigns(mockCampaigns);
    } catch (error) {
      addNotification('Erro ao buscar dados.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStockLevel = async (bloodType, units) => {
    try {
      await updateStockLevel(bloodType, units);
      addNotification(`Estoque de ${bloodType} atualizado para ${units} unidades.`, 'success');
      setEditingStock(null);
    } catch (error) {
      addNotification('Erro ao atualizar estoque.', 'error');
    }
  };

  const handleRegisterDonor = async (donorData) => {
    try {
      await registerDonor(donorData);
      addNotification('Doador registrado com sucesso!', 'success');
    } catch (error) {
      addNotification('Erro ao registrar doador.', 'error');
    }
  };

  const handleRecordDonation = async (donationData) => {
    try {
      await recordDonation(donationData);
      addNotification('Doação registrada com sucesso!', 'success');
    } catch (error) {
      addNotification('Erro ao registrar doação.', 'error');
    }
  };

  const updateApplicationStatus = async (id, status) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    setApplications(prev =>
      prev.map(app =>
        app.id === id
          ? { ...app, status, processed_by: user.id, processed_at: new Date().toISOString() }
          : app
      )
    );
    addNotification('Status da candidatura atualizado.', 'success');
  };

  const createCampaign = async () => {
    if (!newCampaign.title || !newCampaign.start_date || !newCampaign.end_date) {
      addNotification('Preencha os campos obrigatórios.', 'error');
      return;
    }
    await new Promise(resolve => setTimeout(resolve, 500));
    const newCampaignData = {
      id: Date.now().toString(),
      ...newCampaign,
      hemocenter_id: hemocenter.id,
      created_by: user.id,
      is_active: true
    };
    setCampaigns(prev => [newCampaignData, ...prev]);
    addNotification('Campanha criada com sucesso!', 'success');
    setIsCampaignModalOpen(false);
    setNewCampaign({ title: '', description: '', target_blood_type: 'ALL', start_date: '', end_date: '' });
  };

  const handleUpdateProfile = async (profileData) => {
    try {
      await updateProfile(profileData);
      addNotification('Perfil atualizado com sucesso!', 'success');
    } catch (error) {
      addNotification('Erro ao atualizar perfil.', 'error');
    }
  };

  const getStatusColor = (status) => {
    if (status === 'critical') return 'bg-red-500';
    if (status === 'low') return 'bg-yellow-500';
    if (status === 'stable') return 'bg-green-500';
    if (status === 'high') return 'bg-blue-500';
    return 'bg-gray-500';
  };

  const getAppStatusColor = (status) => {
    if (status === 'pending') return 'text-yellow-600 bg-yellow-100';
    if (status === 'accepted') return 'text-green-600 bg-green-100';
    if (status === 'rejected') return 'text-red-600 bg-red-100';
    if (status === 'completed') return 'text-blue-600 bg-blue-100';
    return 'text-gray-600 bg-gray-100';
  };

  const statistics = getStockStatistics();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col relative">
      <div className="fixed inset-0 -z-10" style={{ opacity: 0.04 }}>
        <img
          src={gotasBg}
          alt="Fundo de gotas"
          className="w-full h-full object-cover"
          draggable={false}
        />
      </div>
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <BarChart3 className="h-8 w-8 text-primary-600" />
            <img
              src={logoHemolink}
              alt="Hemolink"
              className="h-8 w-auto"
              style={{ maxWidth: 120 }}
            />
            <span className="text-gray-400">|</span>
            <span className="text-gray-600">Dashboard Profissional</span>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setIsDonorRegistrationModalOpen(true)}
              className="flex items-center space-x-2 text-gray-600 hover:text-primary-600 transition-colors"
              title="Registrar Doador"
            >
              <UserPlus className="h-5 w-5" />
              <span className="text-sm hidden md:inline">Registrar Doador</span>
            </button>
            <button
              onClick={() => setIsDonationRecordModalOpen(true)}
              className="flex items-center space-x-2 text-gray-600 hover:text-primary-600 transition-colors"
              title="Registrar Doação"
            >
              <ClipboardList className="h-5 w-5" />
              <span className="text-sm hidden md:inline">Registrar Doação</span>
            </button>
            <button
              onClick={() => setIsReportsModalOpen(true)}
              className="flex items-center space-x-2 text-gray-600 hover:text-primary-600 transition-colors"
              title="Relatórios"
            >
              <Download className="h-5 w-5" />
              <span className="text-sm hidden md:inline">Relatórios</span>
            </button>
            <button
              onClick={() => setIsProfileModalOpen(true)}
              className="flex items-center space-x-2 text-gray-600 hover:text-primary-600 transition-colors"
              title="Meu Perfil"
            >
              <User className="h-5 w-5" />
              <span className="text-sm hidden md:inline">{userProfile?.name}</span>
            </button>
            <button
              onClick={signOut}
              className="flex items-center space-x-2 text-gray-600 hover:text-red-600 transition-colors"
              title="Sair"
            >
              <LogOut className="h-5 w-5" />
              <span className="text-sm hidden md:inline">Sair</span>
            </button>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        <div className="bg-white bg-opacity-80 rounded-lg shadow-sm p-6 mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{hemocenter?.name}</h1>
          <p className="text-gray-600">Gerencie o estoque de sangue e as candidaturas de doadores</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          {[
            {
              icon: Activity,
              color: 'red',
              label: 'Estoque Crítico',
              value: statistics.critical
            },
            {
              icon: TrendingDown,
              color: 'yellow',
              label: 'Estoque Baixo',
              value: statistics.low
            },
            {
              icon: TrendingUp,
              color: 'green',
              label: 'Estoque Estável',
              value: statistics.stable
            },
            {
              icon: BarChart3,
              color: 'blue',
              label: 'Total Unidades',
              value: statistics.total
            },
            {
              icon: Users,
              color: 'purple',
              label: 'Doadores',
              value: donors.length
            }
          ].map(card => (
            <div key={card.label} className="bg-white bg-opacity-80 rounded-lg shadow-sm p-6 flex items-center">
              <div className={`p-2 rounded-lg ${card.color === 'red' ? 'bg-red-100' : card.color === 'yellow' ? 'bg-yellow-100' : card.color === 'green' ? 'bg-green-100' : card.color === 'blue' ? 'bg-blue-100' : 'bg-purple-100'}`}>
                <card.icon className={`h-6 w-6 ${card.color === 'red' ? 'text-red-600' : card.color === 'yellow' ? 'text-yellow-600' : card.color === 'green' ? 'text-green-600' : card.color === 'blue' ? 'text-blue-600' : 'text-purple-600'}`} />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{card.label}</p>
                <p className="text-2xl font-bold text-gray-900">{card.value}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-lg shadow-lg border-2 border-red-200 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-red-100 rounded-full -mr-16 -mt-16 opacity-20"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-orange-100 rounded-full -ml-12 -mb-12 opacity-20"></div>
            <div className="relative p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <Droplets className="h-6 w-6 text-red-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">Gestão de Estoque</h2>
                    <p className="text-sm text-gray-600">Controle completo do estoque</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                  <span className="text-sm font-medium text-red-600">Prioridade</span>
                </div>
              </div>
              <div className="mb-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white rounded-lg p-3 border border-red-200">
                    <div className="text-xs text-gray-500 mb-1">Crítico</div>
                    <div className="text-lg font-bold text-red-600">
                      {statistics.critical}
                    </div>
                  </div>
                  <div className="bg-white rounded-lg p-3 border border-yellow-200">
                    <div className="text-xs text-gray-500 mb-1">Baixo</div>
                    <div className="text-lg font-bold text-yellow-600">
                      {statistics.low}
                    </div>
                  </div>
                </div>
              </div>
              <Link
                to="/professional/stock"
                className="w-full bg-red-600 text-white py-3 px-4 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center font-semibold"
              >
                <Droplets className="h-5 w-5 mr-2" />
                Gerenciar Estoque
              </Link>
            </div>
          </div>
          <div className="bg-white bg-opacity-80 rounded-lg shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Candidaturas de Doadores</h2>
            </div>
            <div className="p-6 space-y-4 max-h-96 overflow-y-auto">
              {applications.map(app => (
                <div key={app.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-semibold text-gray-900">{app.user_profiles?.name}</h3>
                      <p className="text-sm text-gray-600">Tipo: {app.user_profiles?.donor_profiles[0]?.blood_type || 'N/A'}</p>
                      <p className="text-xs text-gray-500">{new Date(app.application_date).toLocaleDateString('pt-BR')}</p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getAppStatusColor(app.status)}`}>{app.status}</span>
                  </div>
                  {app.status === 'pending' && (
                    <div className="flex space-x-2">
                      <button onClick={() => updateApplicationStatus(app.id, 'accepted')} className="flex-1 bg-green-600 text-white py-1 px-2 rounded text-xs flex items-center justify-center">
                        <Check className="h-3 w-3 mr-1" />Aceitar
                      </button>
                      <button onClick={() => updateApplicationStatus(app.id, 'rejected')} className="flex-1 bg-red-600 text-white py-1 px-2 rounded text-xs flex items-center justify-center">
                        <X className="h-3 w-3 mr-1" />Rejeitar
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="mt-8 bg-white bg-opacity-80 rounded-lg shadow-sm">
          <div className="p-6 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900">Campanhas de Doação</h2>
            <button onClick={() => setIsCampaignModalOpen(true)} className="bg-primary-600 text-white px-4 py-2 rounded-lg flex items-center">
              <Plus className="h-4 w-4 mr-2" />Nova Campanha
            </button>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {campaigns.map(campaign => (
              <div key={campaign.id} className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">{campaign.title}</h3>
                <p className="text-sm text-gray-600 mb-3">{campaign.description}</p>
                <div className="flex justify-between items-center text-xs text-gray-500">
                  <span>Tipo: {campaign.target_blood_type}</span>
                  <span className={`px-2 py-1 rounded-full ${campaign.is_active ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'}`}>
                    {campaign.is_active ? 'Ativa' : 'Inativa'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
      <Modal isOpen={isCampaignModalOpen} onClose={() => setIsCampaignModalOpen(false)} title="Criar Nova Campanha">
        <div className="space-y-4">
          <input type="text" placeholder="Título da campanha" value={newCampaign.title} onChange={(e) => setNewCampaign({ ...newCampaign, title: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
          <textarea placeholder="Descrição da campanha" value={newCampaign.description} onChange={(e) => setNewCampaign({ ...newCampaign, description: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg" rows="3"></textarea>
          <div className="grid grid-cols-2 gap-4">
            <input type="date" value={newCampaign.start_date} onChange={(e) => setNewCampaign({ ...newCampaign, start_date: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
            <input type="date" value={newCampaign.end_date} onChange={(e) => setNewCampaign({ ...newCampaign, end_date: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
          </div>
          <select value={newCampaign.target_blood_type} onChange={(e) => setNewCampaign({ ...newCampaign, target_blood_type: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg">
            <option value="ALL">Todos os tipos</option>
            {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bloodType => <option key={bloodType} value={bloodType}>{bloodType}</option>)}
          </select>
          <div className="flex justify-end space-x-4">
            <button onClick={() => setIsCampaignModalOpen(false)} className="px-4 py-2 border rounded-lg">Cancelar</button>
            <button onClick={createCampaign} className="px-4 py-2 bg-primary-600 text-white rounded-lg">Criar</button>
          </div>
        </div>
      </Modal>
      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        userProfile={userProfile}
        onUpdate={handleUpdateProfile}
      />
      <ReportsModal
        isOpen={isReportsModalOpen}
        onClose={() => setIsReportsModalOpen(false)}
        reportsData={{
          stockLevels,
          applications,
          campaigns,
          hemocenter
        }}
      />
      <DonorRegistrationModal
        isOpen={isDonorRegistrationModalOpen}
        onClose={() => setIsDonorRegistrationModalOpen(false)}
        onRegister={handleRegisterDonor}
      />
      <DonationRecordModal
        isOpen={isDonationRecordModalOpen}
        onClose={() => setIsDonationRecordModalOpen(false)}
        onRecord={handleRecordDonation}
        donors={donors}
      />
    </div>
  );
};

export default ProfessionalDashboard;