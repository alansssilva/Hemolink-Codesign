import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Calendar, Users, Award, ArrowRight, Droplets, Shield, Clock } from 'lucide-react';

export const Home: React.FC = () => {
  const stats = [
    { icon: Users, value: '1,247', label: 'Doadores Ativos' },
    { icon: Droplets, value: '3,890', label: 'Litros Doados' },
    { icon: Award, value: '2,156', label: 'Vidas Salvas' },
    { icon: Calendar, value: '42', label: 'Campanhas Realizadas' }
  ];

  const bloodTypes = [
    { type: 'O+', status: 'normal', level: 85 },
    { type: 'O-', status: 'baixo', level: 35 },
    { type: 'A+', status: 'normal', level: 72 },
    { type: 'A-', status: 'crítico', level: 15 },
    { type: 'B+', status: 'normal', level: 68 },
    { type: 'B-', status: 'baixo', level: 28 },
    { type: 'AB+', status: 'normal', level: 78 },
    { type: 'AB-', status: 'baixo', level: 32 }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'crítico': return 'bg-red-500';
      case 'baixo': return 'bg-orange-500';
      default: return 'bg-green-500';
    }
  };

  const testimonials = [
    {
      name: 'Maria Silva',
      text: 'Doei sangue pela primeira vez através do Hemolink. O processo foi muito fácil e me senti parte de algo maior.',
      image: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop'
    },
    {
      name: 'João Santos',
      text: 'Como doador regular, o Hemolink facilitou muito o agendamento das minhas doações. Recomendo a todos!',
      image: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-red-600 to-red-800 text-white">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-5xl font-bold mb-6 leading-tight">
                Conectando Vidas através da 
                <span className="text-red-200"> Doação</span>
              </h1>
              <p className="text-xl mb-8 text-red-100">
                Uma plataforma digital que une tecnologia e solidariedade para salvar vidas em nossa comunidade. 
                Cada gota conta, cada doação importa.
              </p>
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                <Link
                  to="/register"
                  className="bg-white text-red-600 px-8 py-4 rounded-lg font-semibold hover:bg-red-50 transition-all flex items-center justify-center space-x-2"
                >
                  <Heart className="h-5 w-5" />
                  <span>Quero Ser Doador</span>
                </Link>
                <Link
                  to="/schedule"
                  className="bg-red-700 text-white px-8 py-4 rounded-lg font-semibold hover:bg-red-800 transition-all flex items-center justify-center space-x-2"
                >
                  <Calendar className="h-5 w-5" />
                  <span>Agendar Doação</span>
                </Link>
              </div>
            </div>
            <div className="relative">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
                <h3 className="text-2xl font-bold mb-4">Estoque Atual de Sangue</h3>
                <div className="grid grid-cols-4 gap-3">
                  {bloodTypes.map((blood) => (
                    <div key={blood.type} className="bg-white/20 rounded-lg p-3 text-center">
                      <div className="font-bold text-lg">{blood.type}</div>
                      <div className="text-sm opacity-80">{blood.level}%</div>
                      <div className="w-full bg-white/20 rounded-full h-2 mt-2">
                        <div 
                          className={`h-2 rounded-full ${getStatusColor(blood.status)}`}
                          style={{ width: `${blood.level}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center group">
                <div className="bg-red-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 group-hover:bg-red-200 transition-colors">
                  <stat.icon className="h-8 w-8 text-red-600 mx-auto" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Por que escolher o Hemolink?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Nossa plataforma oferece uma experiência completa e humanizada para doadores e hemocentros
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow">
              <div className="bg-blue-100 rounded-full p-3 w-12 h-12 mb-6">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Agendamento Fácil</h3>
              <p className="text-gray-600 mb-4">
                Agende sua doação em poucos cliques e receba lembretes automáticos
              </p>
              <Link to="/schedule" className="text-blue-600 hover:text-blue-700 font-medium flex items-center space-x-1">
                <span>Agendar agora</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow">
              <div className="bg-green-100 rounded-full p-3 w-12 h-12 mb-6">
                <Shield className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Seguro e Confiável</h3>
              <p className="text-gray-600 mb-4">
                Processo seguro com profissionais qualificados e equipamentos modernos
              </p>
              <Link to="/why-donate" className="text-green-600 hover:text-green-700 font-medium flex items-center space-x-1">
                <span>Saiba mais</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow">
              <div className="bg-red-100 rounded-full p-3 w-12 h-12 mb-6">
                <Award className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Recompensas</h3>
              <p className="text-gray-600 mb-4">
                Ganhe pontos a cada doação e desbloqueie conquistas especiais
              </p>
              <Link to="/register" className="text-red-600 hover:text-red-700 font-medium flex items-center space-x-1">
                <span>Participar</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Urgency Alert */}
      <section className="py-12 bg-orange-50 border-l-4 border-orange-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-orange-100 rounded-full p-3">
                <Clock className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-orange-900">Necessidade Urgente!</h3>
                <p className="text-orange-700">
                  Estoque de sangue tipo A- e O- em nível crítico. Sua doação pode salvar vidas hoje.
                </p>
              </div>
            </div>
            <Link
              to="/schedule"
              className="bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-700 transition-colors"
            >
              Doar Agora
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Histórias que Inspiram
            </h2>
            <p className="text-xl text-gray-600">
              Conheça as experiências de quem já faz parte da nossa comunidade
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-gray-50 rounded-xl p-8">
                <div className="flex items-center mb-4">
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full mr-4"
                  />
                  <div>
                    <h4 className="font-bold text-gray-900">{testimonial.name}</h4>
                    <p className="text-gray-600 text-sm">Doador Hemolink</p>
                  </div>
                </div>
                <p className="text-gray-700 italic">"{testimonial.text}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-red-600 to-red-800">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-white mb-6">
            Pronto para Salvar Vidas?
          </h2>
          <p className="text-xl text-red-100 mb-8">
            Junte-se à nossa comunidade de heróis e faça a diferença na vida de outras pessoas.
            É rápido, seguro e pode salvar até 4 vidas com uma única doação.
          </p>
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Link
              to="/register"
              className="bg-white text-red-600 px-8 py-4 rounded-lg font-semibold hover:bg-red-50 transition-all inline-flex items-center justify-center space-x-2"
            >
              <Heart className="h-5 w-5" />
              <span>Cadastrar-se Agora</span>
            </Link>
            <Link
              to="/why-donate"
              className="bg-red-700 text-white px-8 py-4 rounded-lg font-semibold hover:bg-red-800 transition-all inline-flex items-center justify-center space-x-2"
            >
              <span>Saiba Mais</span>
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};