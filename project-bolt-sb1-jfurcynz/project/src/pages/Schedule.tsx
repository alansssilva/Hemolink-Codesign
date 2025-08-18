import React, { useState } from 'react';
import { Calendar, Clock, MapPin, Phone, Mail, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';

export const Schedule: React.FC = () => {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.donorProfile?.phone || '',
    bloodType: user?.donorProfile?.bloodType || '',
    notes: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const availableTimes = [
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
    '11:00', '11:30', '14:00', '14:30', '15:00', '15:30',
    '16:00', '16:30', '17:00'
  ];

  const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simular envio
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsSubmitting(false);
    setShowSuccess(true);

    // Reset form
    setTimeout(() => {
      setShowSuccess(false);
      setSelectedDate('');
      setSelectedTime('');
      setFormData(prev => ({ ...prev, notes: '' }));
    }, 3000);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split('T')[0];
  
  // Get date 3 months from now
  const maxDate = new Date();
  maxDate.setMonth(maxDate.getMonth() + 3);
  const maxDateStr = maxDate.toISOString().split('T')[0];

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full mx-4 text-center">
          <div className="bg-green-100 rounded-full p-4 w-16 h-16 mx-auto mb-4">
            <CheckCircle className="h-8 w-8 text-green-600 mx-auto" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Agendamento Confirmado!
          </h2>
          <p className="text-gray-600 mb-6">
            Seu agendamento foi realizado com sucesso. Você receberá um email de confirmação 
            e um lembrete próximo à data da doação.
          </p>
          <div className="bg-green-50 rounded-lg p-4 mb-6">
            <p className="text-green-800">
              <strong>Data:</strong> {new Date(selectedDate).toLocaleDateString('pt-BR')}<br />
              <strong>Horário:</strong> {selectedTime}
            </p>
          </div>
          <Link
            to="/"
            className="bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors"
          >
            Voltar ao Início
          </Link>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full mx-4 text-center">
          <div className="bg-blue-100 rounded-full p-4 w-16 h-16 mx-auto mb-4">
            <AlertCircle className="h-8 w-8 text-blue-600 mx-auto" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Login Necessário
          </h2>
          <p className="text-gray-600 mb-6">
            Para agendar sua doação, você precisa estar logado em sua conta.
          </p>
          <div className="flex space-x-3">
            <Link
              to="/login"
              className="flex-1 bg-red-600 text-white px-4 py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors"
            >
              Fazer Login
            </Link>
            <Link
              to="/register"
              className="flex-1 bg-gray-200 text-gray-800 px-4 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
            >
              Cadastrar-se
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Agendar Doação
          </h1>
          <p className="text-xl text-gray-600">
            Escolha o melhor dia e horário para sua doação de sangue
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Dados do Agendamento
              </h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                      Nome completo
                    </label>
                    <input
                      type="text"
                      name="name"
                      id="name"
                      required
                      className="block w-full px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500"
                      value={formData.name}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      id="email"
                      required
                      className="block w-full px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500"
                      value={formData.email}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                      Telefone
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      id="phone"
                      required
                      className="block w-full px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500"
                      placeholder="(22) 99999-9999"
                      value={formData.phone}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div>
                    <label htmlFor="bloodType" className="block text-sm font-medium text-gray-700 mb-1">
                      Tipo Sanguíneo
                    </label>
                    <select
                      name="bloodType"
                      id="bloodType"
                      required
                      className="block w-full px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500"
                      value={formData.bloodType}
                      onChange={handleInputChange}
                    >
                      <option value="">Selecione</option>
                      {bloodTypes.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="selectedDate" className="block text-sm font-medium text-gray-700 mb-1">
                      Data da doação
                    </label>
                    <input
                      type="date"
                      name="selectedDate"
                      id="selectedDate"
                      required
                      min={today}
                      max={maxDateStr}
                      className="block w-full px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                    />
                  </div>

                  <div>
                    <label htmlFor="selectedTime" className="block text-sm font-medium text-gray-700 mb-1">
                      Horário
                    </label>
                    <select
                      name="selectedTime"
                      id="selectedTime"
                      required
                      className="block w-full px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500"
                      value={selectedTime}
                      onChange={(e) => setSelectedTime(e.target.value)}
                    >
                      <option value="">Selecione um horário</option>
                      {availableTimes.map(time => (
                        <option key={time} value={time}>{time}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                    Observações (opcional)
                  </label>
                  <textarea
                    name="notes"
                    id="notes"
                    rows={3}
                    className="block w-full px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500"
                    placeholder="Alguma observação importante sobre sua doação..."
                    value={formData.notes}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-semibold text-blue-900 mb-2">Lembrete importante:</h3>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Tenha uma noite de sono adequada (mínimo 6 horas)</li>
                    <li>• Alimente-se bem, evitando alimentos gordurosos</li>
                    <li>• Traga um documento oficial com foto</li>
                    <li>• Não consuma bebidas alcoólicas 12h antes</li>
                  </ul>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || !selectedDate || !selectedTime}
                  className="w-full bg-red-600 text-white py-4 px-6 rounded-lg font-semibold hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isSubmitting ? 'Agendando...' : 'Confirmar Agendamento'}
                </button>
              </form>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Location Info */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                <MapPin className="h-5 w-5 text-red-600 mr-2" />
                Local da Doação
              </h3>
              <div className="space-y-3 text-sm text-gray-600">
                <p>
                  <strong className="text-gray-900">Hemocentro Campos</strong><br />
                  Rua Dr. Nilo Peçanha, 123<br />
                  Centro, Campos dos Goytacazes - RJ<br />
                  CEP: 28010-140
                </p>
                <div className="flex items-center space-x-2">
                  <Phone className="h-4 w-4 text-red-600" />
                  <span>(22) 2726-1234</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4 text-red-600" />
                  <span>contato@hemolink.com</span>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-200">
                <h4 className="font-semibold text-gray-900 mb-2">Horário de Funcionamento:</h4>
                <div className="space-y-1 text-sm text-gray-600">
                  <p>Segunda a Sexta: 8h às 17h</p>
                  <p>Sábado: 8h às 12h</p>
                  <p>Domingo: Fechado</p>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-gradient-to-r from-red-600 to-red-800 rounded-xl shadow-lg p-6 text-white">
              <h3 className="text-lg font-bold mb-4">Impacto da sua Doação</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span>Vidas que pode salvar:</span>
                  <span className="font-bold text-xl">4</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Tempo do processo:</span>
                  <span className="font-bold">~30 min</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Intervalo entre doações:</span>
                  <span className="font-bold">60 dias</span>
                </div>
              </div>
            </div>

            {/* Emergency Alert */}
            <div className="bg-orange-100 border border-orange-300 rounded-xl p-6">
              <h3 className="text-lg font-bold text-orange-900 mb-2 flex items-center">
                <AlertCircle className="h-5 w-5 mr-2" />
                Estoque Crítico
              </h3>
              <p className="text-orange-800 text-sm mb-4">
                Tipos A- e O- estão com estoque crítico. Sua doação é fundamental!
              </p>
              <div className="text-xs text-orange-700">
                Atualizado em: {new Date().toLocaleString('pt-BR')}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};