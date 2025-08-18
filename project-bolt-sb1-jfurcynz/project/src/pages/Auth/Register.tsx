import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, User, Mail, Lock, Phone, MapPin, Calendar, Droplets } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export const Register: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    bloodType: '',
    birthDate: '',
    address: '',
    city: 'Campos dos Goytacazes'
  });
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};

    if (!formData.name.trim()) newErrors.name = 'Nome é obrigatório';
    if (!formData.email.trim()) newErrors.email = 'Email é obrigatório';
    if (!formData.password) newErrors.password = 'Senha é obrigatória';
    if (formData.password.length < 6) newErrors.password = 'Senha deve ter pelo menos 6 caracteres';
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Senhas não coincidem';
    if (!formData.phone.trim()) newErrors.phone = 'Telefone é obrigatório';
    if (!formData.bloodType) newErrors.bloodType = 'Tipo sanguíneo é obrigatório';
    if (!formData.birthDate) newErrors.birthDate = 'Data de nascimento é obrigatória';
    if (!formData.address.trim()) newErrors.address = 'Endereço é obrigatório';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const success = await register(formData);
      if (success) {
        navigate('/', { 
          state: { 
            message: 'Cadastro realizado com sucesso! Bem-vindo ao Hemolink!' 
          }
        });
      }
    } catch (err) {
      setErrors({ general: 'Erro ao criar conta. Tente novamente.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <div className="mx-auto h-16 w-16 bg-red-600 rounded-full flex items-center justify-center">
            <Heart className="h-8 w-8 text-white fill-current" />
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Junte-se aos Heróis
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Cadastre-se gratuitamente e faça parte da nossa comunidade de doadores
          </p>
        </div>

        <div className="bg-white py-8 px-6 shadow-xl rounded-lg">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {errors.general && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <span className="text-red-700 text-sm">{errors.general}</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Nome completo *
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    name="name"
                    id="name"
                    required
                    className={`block w-full pl-10 pr-3 py-3 border rounded-md ${
                      errors.name ? 'border-red-300' : 'border-gray-300'
                    } focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500`}
                    placeholder="Seu nome completo"
                    value={formData.name}
                    onChange={handleInputChange}
                  />
                </div>
                {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    type="email"
                    name="email"
                    id="email"
                    required
                    className={`block w-full pl-10 pr-3 py-3 border rounded-md ${
                      errors.email ? 'border-red-300' : 'border-gray-300'
                    } focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500`}
                    placeholder="seu@email.com"
                    value={formData.email}
                    onChange={handleInputChange}
                  />
                </div>
                {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Senha *
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    type="password"
                    name="password"
                    id="password"
                    required
                    className={`block w-full pl-10 pr-3 py-3 border rounded-md ${
                      errors.password ? 'border-red-300' : 'border-gray-300'
                    } focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500`}
                    placeholder="Mínimo 6 caracteres"
                    value={formData.password}
                    onChange={handleInputChange}
                  />
                </div>
                {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  Confirmar senha *
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    type="password"
                    name="confirmPassword"
                    id="confirmPassword"
                    required
                    className={`block w-full pl-10 pr-3 py-3 border rounded-md ${
                      errors.confirmPassword ? 'border-red-300' : 'border-gray-300'
                    } focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500`}
                    placeholder="Repita sua senha"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                  />
                </div>
                {errors.confirmPassword && <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>}
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                  Telefone *
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    type="tel"
                    name="phone"
                    id="phone"
                    required
                    className={`block w-full pl-10 pr-3 py-3 border rounded-md ${
                      errors.phone ? 'border-red-300' : 'border-gray-300'
                    } focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500`}
                    placeholder="(22) 99999-9999"
                    value={formData.phone}
                    onChange={handleInputChange}
                  />
                </div>
                {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
              </div>

              <div>
                <label htmlFor="bloodType" className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo Sanguíneo *
                </label>
                <div className="relative">
                  <Droplets className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <select
                    name="bloodType"
                    id="bloodType"
                    required
                    className={`block w-full pl-10 pr-3 py-3 border rounded-md ${
                      errors.bloodType ? 'border-red-300' : 'border-gray-300'
                    } focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500`}
                    value={formData.bloodType}
                    onChange={handleInputChange}
                  >
                    <option value="">Selecione seu tipo</option>
                    {bloodTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
                {errors.bloodType && <p className="mt-1 text-sm text-red-600">{errors.bloodType}</p>}
              </div>

              <div>
                <label htmlFor="birthDate" className="block text-sm font-medium text-gray-700 mb-1">
                  Data de nascimento *
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    type="date"
                    name="birthDate"
                    id="birthDate"
                    required
                    className={`block w-full pl-10 pr-3 py-3 border rounded-md ${
                      errors.birthDate ? 'border-red-300' : 'border-gray-300'
                    } focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500`}
                    value={formData.birthDate}
                    onChange={handleInputChange}
                  />
                </div>
                {errors.birthDate && <p className="mt-1 text-sm text-red-600">{errors.birthDate}</p>}
              </div>

              <div>
                <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                  Cidade
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    name="city"
                    id="city"
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500"
                    value={formData.city}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                Endereço completo *
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  name="address"
                  id="address"
                  required
                  className={`block w-full pl-10 pr-3 py-3 border rounded-md ${
                    errors.address ? 'border-red-300' : 'border-gray-300'
                  } focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500`}
                  placeholder="Rua, número, bairro"
                  value={formData.address}
                  onChange={handleInputChange}
                />
              </div>
              {errors.address && <p className="mt-1 text-sm text-red-600">{errors.address}</p>}
            </div>

            <div className="flex items-center">
              <input
                id="terms"
                name="terms"
                type="checkbox"
                required
                className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
              />
              <label htmlFor="terms" className="ml-2 block text-sm text-gray-900">
                Aceito os{' '}
                <a href="#" className="text-red-600 hover:text-red-500">
                  termos de uso
                </a>{' '}
                e a{' '}
                <a href="#" className="text-red-600 hover:text-red-500">
                  política de privacidade
                </a>
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? 'Criando conta...' : 'Criar minha conta'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Já tem uma conta?{' '}
              <Link to="/login" className="font-medium text-red-600 hover:text-red-500">
                Faça login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};