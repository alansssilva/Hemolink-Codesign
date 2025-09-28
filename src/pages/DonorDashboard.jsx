import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Droplets, Heart, MapPin, Bell, User, LogOut, Search, Send, Calendar, BarChart3, Settings, Clock, Award } from 'lucide-react';
import { useAuth } from '../context/LocalAuthContext';
import { useNotification } from '../context/NotificationContext';
import Modal from '../components/Modal';
import ProfileModal from '../components/ProfileModal';
import DonationHistoryModal from '../components/DonationHistoryModal';
import ScheduleModal from '../components/ScheduleModal';
import DonorCardModal from '../components/DonorCardModal';
import logoHemolink from '../assets/Assinatura Visual.png';
import gotasBg from '../assets/Padronagens-27.png'; // ajuste o caminho se necessário

const DonorDashboard = () => {
  const { user, userProfile, signOut, updateProfile, stockLevels } = useAuth();
  const { addNotification } = useNotification();

  const [hemocenters, setHemocenters] = useState([]);
  const [applications, setApplications] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [donations, setDonations] = useState([]);
  const [scheduledDonations, setScheduledDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBloodType, setSelectedBloodType] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [isDonorCardModalOpen, setIsDonorCardModalOpen] = useState(false);
  const [applicationData, setApplicationData] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      const mockHemocenters = [
        {
          id: '1',
          name: 'Hemocentro Vida Plena',
          address: 'Rua da Esperança, 123 - Centro',
          is_active: true
        },
        {
          id: '2',
          name: 'Centro de Hemoterapia São Paulo',
          address: 'Av. Paulista, 1000 - Bela Vista',
          is_active: true
        }
      ];
      const mockApplications = [
        {
          id: '1',
          donor_user_id: user?.id,
          hemocenter_id: '1',
          application_date: new Date().toISOString(),
          status: 'pending',
          hemocenters: { name: 'Hemocentro Vida Plena' }
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
          hemocenters: { name: 'Hemocentro Vida Plena', address: 'Rua da Esperança, 123' }
        }
      ];
      const mockDonations = [
        {
          id: '1',
          date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          hemocenter_name: 'Hemocentro Vida Plena',
          address: 'Rua da Esperança, 123 - Centro',
          blood_type: 'O+',
          volume: '450ml',
          duration: '15 min',
          status: 'completed',
          notes: 'Doação realizada com sucesso'
        },
        {
          id: '2',
          date: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
          hemocenter_name: 'Centro de Hemoterapia São Paulo',
          address: 'Av. Paulista, 1000 - Bela Vista',
          blood_type: 'O+',
          volume: '450ml',
          duration: '12 min',
          status: 'completed',
          notes: 'Primeira doação'
        }
      ];
      const mockScheduledDonations = [
        {
          id: '1',
          date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          time: '14:00',
          hemocenter_name: 'Hemocentro Vida Plena',
          address: 'Rua da Esperança, 123 - Centro',
          status: 'scheduled',
          notes: 'Agendamento confirmado'
        }
      ];
      setHemocenters(mockHemocenters);
      setApplications(mockApplications);
      setCampaigns(mockCampaigns);
      setDonations(mockDonations);
      setScheduledDonations(mockScheduledDonations);
    } catch (error) {
      addNotification('Erro ao buscar dados.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const openApplicationModal = (hemocenter, campaign = null) => {
    setApplicationData({ hemocenter, campaign });
    setIsModalOpen(true);
  };

  const handleScheduleDonation = async (scheduleData) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      const newScheduledDonation = {
        id: Date.now().toString(),
        ...scheduleData,
        status: 'scheduled'
      };
      setScheduledDonations(prev => [newScheduledDonation, ...prev]);
      addNotification('Doação agendada com sucesso!', 'success');
    } catch (error) {
      addNotification('Erro ao agendar doação.', 'error');
    }
  };

  const handleUpdateProfile = async (profileData) => {
    try {
      await updateProfile(profileData);
      addNotification('Perfil atualizado com sucesso!', 'success');
    } catch (error) {
      addNotification('Erro ao atualizar perfil.', 'error');
    }
  };

  const handleDonationApplication = async () => {
    if (!applicationData) return;
    setIsSubmitting(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      const newApplication = {
        id: Date.now().toString(),
        donor_user_id: user.id,
        hemocenter_id: applicationData.hemocenter.id,
        application_date: new Date().toISOString(),
        status: 'pending',
        hemocenters: { name: applicationData.hemocenter.name }
      };
      setApplications(prev => [newApplication, ...prev]);
      addNotification('Candidatura enviada com sucesso!', 'success');
      setIsModalOpen(false);
    } catch (error) {
      addNotification('Erro ao enviar candidatura. Tente novamente.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'critical': return 'bg-red-500';
      case 'low': return 'bg-yellow-500';
      case 'stable': return 'bg-green-500';
      case 'high': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const getApplicationStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'accepted': return 'text-green-600 bg-green-100';
      case 'rejected': return 'text-red-600 bg-red-100';
      case 'completed': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const filteredHemocenters = hemocenters.filter(hemocenter =>
    hemocenter.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <Droplets className="h-8 w-8 text-primary-600" />
                  <Heart className="h-4 w-4 text-primary-500 absolute -bottom-1 -right-1" />
                </div>
                <img
                  src={logoHemolink}
                  alt="Hemolink"
                  className="h-8 w-auto"
                  style={{ maxWidth: 120 }}
                />
              </div>
              <span className="text-gray-400">|</span>
              <span className="text-gray-600">Dashboard do Doador</span>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setIsDonorCardModalOpen(true)}
                className="flex items-center space-x-2 text-gray-600 hover:text-primary-600 transition-colors"
                title="Minha Carteirinha"
              >
                <Award className="h-5 w-5" />
                <span className="text-sm hidden md:inline">Carteirinha</span>
              </button>
              <button
                onClick={() => setIsHistoryModalOpen(true)}
                className="flex items-center space-x-2 text-gray-600 hover:text-primary-600 transition-colors"
                title="Histórico de Doações"
              >
                <BarChart3 className="h-5 w-5" />
                <span className="text-sm hidden md:inline">Histórico</span>
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
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        <div className="bg-white bg-opacity-80 rounded-lg shadow-sm p-6 mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Bem-vindo, {userProfile?.name}!
          </h1>
          <p className="text-gray-600">
            Seu tipo sanguíneo: <span className="font-semibold text-primary-600">{userProfile?.donor_profiles?.[0]?.blood_type || 'Não informado'}</span>
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white bg-opacity-80 rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-primary-100 rounded-lg">
                <Droplets className="h-6 w-6 text-primary-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total de Doações</p>
                <p className="text-2xl font-bold text-gray-900">{donations.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white bg-opacity-80 rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Calendar className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Agendamentos</p>
                <p className="text-2xl font-bold text-gray-900">{scheduledDonations.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white bg-opacity-80 rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Candidaturas</p>
                <p className="text-2xl font-bold text-gray-900">{applications.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white bg-opacity-80 rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Award className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Última Doação</p>
                <p className="text-sm font-bold text-gray-900">
                  {donations.length > 0 ?
                    new Date(donations[0].date).toLocaleDateString('pt-BR') :
                    'Nunca'
                  }
                </p>
              </div>
            </div>
          </div>
        </div>
        {donations.length > 0 && (
          <div className="bg-gradient-to-r from-primary-50 to-red-50 rounded-lg shadow-sm p-6 mb-8 border border-primary-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-2 flex items-center">
                  <Award className="h-6 w-6 text-primary-600 mr-2" />
                  Sua Carteirinha Digital
                </h2>
                <p className="text-gray-600 mb-4">
                  Parabéns! Você já realizou {donations.length} doação(ões).
                  Acesse sua carteirinha digital e compartilhe sua conquista!
                </p>
                <button
                  onClick={() => setIsDonorCardModalOpen(true)}
                  className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors flex items-center"
                >
                  <Award className="h-4 w-4 mr-2" />
                  Ver Minha Carteirinha
                </button>
              </div>
              <div className="hidden md:block">
                <div className="w-24 h-24 bg-primary-100 rounded-full flex items-center justify-center">
                  <Award className="h-12 w-12 text-primary-600" />
                </div>
              </div>
            </div>
          </div>
        )}
        <div className="bg-white bg-opacity-80 rounded-lg shadow-sm p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar hemocentros..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div className="md:w-48">
              <select
                value={selectedBloodType}
                onChange={(e) => setSelectedBloodType(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              >
                <option value="">Todos os tipos</option>
                {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bloodType => <option key={bloodType} value={bloodType}>{bloodType}</option>)}
              </select>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white bg-opacity-80 rounded-lg shadow-sm">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Estoque de Sangue</h2>
              </div>
              <div className="p-6 space-y-6">
                {filteredHemocenters.map(hemocenter => (
                  <motion.div
                    key={hemocenter.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="border border-gray-200 rounded-lg p-4"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-semibold text-gray-900">{hemocenter.name}</h3>
                        <div className="flex items-center text-sm text-gray-600 mt-1">
                          <MapPin className="h-4 w-4 mr-1" />
                          {hemocenter.address}
                        </div>
                      </div>
                      <button
                        onClick={() => openApplicationModal(hemocenter)}
                        className="bg-primary-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-primary-700 transition-colors"
                      >
                        Candidatar-se
                      </button>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bloodType => {
                        const stock = stockLevels.find(s => s.hemocenter_id === hemocenter.id && s.blood_type === bloodType);
                        if (selectedBloodType && bloodType !== selectedBloodType) return null;
                        const level = stock?.units || 0;
                        const status = stock?.status || 'unknown';
                        return (
                          <div key={bloodType} className="text-center">
                            <Droplets className={`h-6 w-6 mx-auto mb-2 ${level < 30 ? 'text-red-500' : level < 60 ? 'text-yellow-500' : 'text-green-500'}`} />
                            <div className="text-sm font-semibold text-gray-900">{bloodType}</div>
                            <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                              <div className={`h-2 rounded-full ${getStatusColor(status)}`} style={{ width: `${Math.min(100, (level / 100) * 100)}%` }}></div>
                            </div>
                            <div className="text-xs text-gray-600 mt-1">{level} unidades</div>
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
          <div className="space-y-6">
            <div className="bg-white bg-opacity-80 rounded-lg shadow-sm">
              <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-900">Agendamentos Próximos</h2>
                <button
                  onClick={() => setIsScheduleModalOpen(true)}
                  className="bg-primary-600 text-white px-3 py-1 rounded text-sm hover:bg-primary-700 flex items-center"
                >
                  <Calendar className="h-4 w-4 mr-1" />
                  Agendar
                </button>
              </div>
              <div className="p-6 space-y-4">
                {scheduledDonations.length === 0 ? (
                  <div className="text-center py-8">
                    <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600">Nenhum agendamento encontrado</p>
                    <button
                      onClick={() => setIsScheduleModalOpen(true)}
                      className="mt-2 text-primary-600 hover:text-primary-700 font-medium"
                    >
                      Agendar sua primeira doação
                    </button>
                  </div>
                ) : (
                  scheduledDonations.map(appointment => (
                    <div key={appointment.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-gray-900">{appointment.hemocenter_name}</h3>
                          <p className="text-sm text-gray-600">{appointment.address}</p>
                          <p className="text-sm text-gray-500">
                            {new Date(appointment.date).toLocaleDateString('pt-BR')} às {appointment.time}
                          </p>
                        </div>
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-600">
                          Agendado
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
            <div className="bg-white bg-opacity-80 rounded-lg shadow-sm">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Campanhas Ativas</h2>
              </div>
              <div className="p-6 space-y-4">
                {campaigns.slice(0, 3).map(campaign => (
                  <motion.div key={campaign.id} className="border border-gray-200 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-2">{campaign.title}</h3>
                    <p className="text-sm text-gray-600 mb-3">{campaign.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">{campaign.hemocenters?.name}</span>
                      <button
                        onClick={() => openApplicationModal(campaign.hemocenters, campaign)}
                        className="bg-primary-600 text-white px-3 py-1 rounded text-xs hover:bg-primary-700"
                      >
                        Participar
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
            <div className="bg-white bg-opacity-80 rounded-lg shadow-sm">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Minhas Candidaturas</h2>
              </div>
              <div className="p-6 space-y-4">
                {applications.slice(0, 5).map(app => (
                  <div key={app.id} className="border border-gray-200 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-900">{app.hemocenters?.name}</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getApplicationStatusColor(app.status)}`}>
                        {app.status}
                      </span>
                    </div>
                    <div className="text-xs text-gray-600">{new Date(app.application_date).toLocaleDateString('pt-BR')}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Confirmar Candidatura">
        {applicationData && (
          <div>
            <p className="text-gray-600 mb-4">
              Você está se candidatando para doar no hemocentro <span className="font-semibold">{applicationData.hemocenter.name}</span>.
            </p>
            {applicationData.campaign && (
              <p className="text-gray-600 mb-4">
                Esta candidatura está associada à campanha: <span className="font-semibold">{applicationData.campaign.title}</span>.
              </p>
            )}
            <p className="text-gray-600 mb-6">
              O hemocentro receberá sua solicitação e poderá entrar em contato. Deseja continuar?
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleDonationApplication}
                disabled={isSubmitting}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 flex items-center"
              >
                {isSubmitting && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>}
                Confirmar
              </button>
            </div>
          </div>
        )}
      </Modal>
      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        userProfile={userProfile}
        onUpdate={handleUpdateProfile}
      />
      <DonationHistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        donations={donations}
      />
      <ScheduleModal
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
        hemocenter={hemocenters[0]}
        onSchedule={handleScheduleDonation}
      />
      <DonorCardModal
        isOpen={isDonorCardModalOpen}
        onClose={() => setIsDonorCardModalOpen(false)}
        userProfile={userProfile}
        donations={donations}
      />
    </div>
  );
};

export default DonorDashboard;