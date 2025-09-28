import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, Droplets, Heart, ArrowLeft, User, Stethoscope } from 'lucide-react';
import { useAuth } from '../context/LocalAuthContext';
import { useNotification } from '../context/NotificationContext';
import logoHemolink from '../assets/Logo vermelha.png';
import gotasBg from '../assets/Padronagens-27.png'; // ajuste o caminho se necessário

const LoginPage = () => {
  const { userType } = useParams();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const { signIn } = useAuth();
  const { addNotification } = useNotification();

  // Redirect to type selection if no userType is provided
  useEffect(() => {
    if (!userType || !['donor', 'professional'].includes(userType)) {
      navigate('/login/type', { replace: true });
    }
  }, [userType, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await signIn(formData.email, formData.password);
      addNotification('Login realizado com sucesso!', 'success');

      // Redirect based on user role from the result
      if (result.profile) {
        // Small delay to ensure state is updated
        setTimeout(() => {
          if (result.profile.role === 'donor') {
            navigate('/donor/dashboard', { replace: true });
          } else if (result.profile.role === 'professional') {
            navigate('/professional/dashboard', { replace: true });
          }
        }, 100);
      }
    } catch (error) {
      addNotification(error.message || 'Erro ao fazer login. Verifique suas credenciais.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative">
      <div className="fixed inset-0 -z-10" style={{ opacity: 0.04 }}>
        <img
          src={gotasBg}
          alt="Fundo de gotas"
          className="w-full h-full object-cover"
          draggable={false}
        />
      </div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/login/type" className="inline-flex items-center space-x-2 group mb-6">
            <ArrowLeft className="h-5 w-5 text-gray-600 group-hover:text-primary-600 transition-colors" />
            <span className="text-gray-600 group-hover:text-primary-600 transition-colors">Voltar à seleção</span>
          </Link>

          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="relative">
              <Droplets className="h-8 w-8 text-primary-600" />
              <Heart className="h-4 w-4 text-primary-500 absolute -bottom-1 -right-1" />
            </div>
            <img
              src={logoHemolink}
              alt="Hemolink"
              className="h-8 w-auto"
              style={{ maxWidth: 180 }}
            />
          </div>

          <div className="flex items-center justify-center space-x-2 mb-4">
            {userType === 'donor' ? (
              <User className="h-6 w-6 text-primary-600" />
            ) : (
              <Stethoscope className="h-6 w-6 text-medical-600" />
            )}
            <h1 className="text-2xl font-bold text-gray-900">
              Login {userType === 'donor' ? 'Doador' : 'Profissional'}
            </h1>
          </div>
          <p className="text-gray-600">Acesse sua conta para continuar</p>
        </div>

        {/* Login Form */}
        <div className="bg-white bg-opacity-80 rounded-2xl shadow-xl p-8 border border-gray-100">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                E-mail
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
                  placeholder="seu@email.com"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Senha
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Forgot Password */}
            <div className="text-right">
              <Link to="#" className="text-sm text-primary-600 hover:text-primary-700 transition-colors">
                Esqueceu a senha?
              </Link>
            </div>

            {/* Submit Button */}
            <motion.button
              type="submit"
              disabled={isLoading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-primary-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isLoading && <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>}
              {isLoading ? 'Entrando...' : 'Entrar'}
            </motion.button>
          </form>

          {/* Register Link */}
          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Não tem uma conta?{' '}
              <Link to="/register" className="text-primary-600 hover:text-primary-700 font-medium transition-colors">
                Cadastre-se aqui
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;