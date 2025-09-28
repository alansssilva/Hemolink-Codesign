import React, { useState, useEffect, useRef } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import { ArrowRight, CheckCircle, Activity, Heart, Droplets, BarChart3, Bell, UserCheck, Send } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import gotasBg from '../assets/Padronagens-27.png';

const BLOOD_LEVELS = [
  { type: 'A+', level: 85 },
  { type: 'A-', level: 40 },
  { type: 'B+', level: 60 },
  { type: 'B-', level: 25 },
  { type: 'AB+', level: 90 },
  { type: 'AB-', level: 15 },
  { type: 'O+', level: 70 },
  { type: 'O-', level: 30 }
];

function getBarColor(level) {
  if (level < 35) return 'bg-red-500';
  if (level < 70) return 'bg-yellow-500';
  return 'bg-green-500';
}

function getBarLabelColor(level) {
  if (level < 35) return 'text-red-600';
  if (level < 70) return 'text-yellow-600';
  return 'text-green-600';
}

const fadeInUp = {
  initial: { opacity: 0, y: 60 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 }
};

const LandingPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    organization: '',
    message: ''
  });

  const location = useLocation();

  // Animation for blood bar chart
  const chartRef = useRef(null);
  const controls = useAnimation();
  const [chartInView, setChartInView] = useState(false);
  const [animatedLevels, setAnimatedLevels] = useState(BLOOD_LEVELS.map(() => 0));
  const observerRef = useRef(null);

  useEffect(() => {
    if (location.hash) {
      const el = document.querySelector(location.hash);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [location]);

  // Intersection Observer for chart animation (runs every time block enters view)
  useEffect(() => {
    if (!chartRef.current) return;
    if (observerRef.current) observerRef.current.disconnect();

    observerRef.current = new window.IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setChartInView(true);
        } else {
          setChartInView(false);
        }
      },
      { threshold: 0.3 }
    );
    observerRef.current.observe(chartRef.current);

    return () => observerRef.current && observerRef.current.disconnect();
  }, []);

  // Animate numbers and bars (slower, always animates on view)
  useEffect(() => {
    let timeouts = [];
    if (chartInView) {
      BLOOD_LEVELS.forEach((blood, idx) => {
        timeouts.push(setTimeout(() => {
          setAnimatedLevels(prev => {
            const newArr = [...prev];
            newArr[idx] = blood.level;
            return newArr;
          });
        }, idx * 400 + 400)); // slower animation
      });
      controls.start('animate');
    } else {
      // Reset for re-animation
      setAnimatedLevels(BLOOD_LEVELS.map(() => 0));
    }
    return () => timeouts.forEach(t => clearTimeout(t));
  }, [chartInView, controls]);

  const handleSubmit = (e) => {
    e.preventDefault();
    alert('Obrigado pelo interesse! Entraremos em contato em breve.');
    setFormData({ name: '', email: '', organization: '', message: '' });
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen">
      <div className="fixed inset-0 -z-10" style={{ opacity: 0.04 }}>
        <img
          src={gotasBg}
          alt="Fundo de gotas"
          className="w-full h-full object-cover"
          draggable={false}
        />
      </div>

      <Header />

      {/* Hero Section centralizado no meio, sem imagem */}
      <section className="py-16 md:py-24 bg-transparent relative">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div {...fadeInUp} className="text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
              Gestão Inteligente de
              <span className="text-primary-600 block">Doação de Sangue</span>
            </h1>
            <p className="text-xl text-gray-600 mt-6 leading-relaxed">
              Conexão através do sangue. A plataforma completa que conecta hemocentros e doadores
              para salvar mais vidas através da gestão eficiente de estoque.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 mt-8 items-center justify-center">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  to="/register"
                  className="bg-primary-600 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-primary-700 transition-colors flex items-center justify-center group"
                >
                  Começar Agora
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  to="/demonstracao"
                  className="border-2 border-primary-600 text-primary-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-primary-50 transition-colors flex items-center justify-center"
                >
                  Ver Demonstração
                </Link>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Blood Stock Bar Chart Section - NOVO TEMPLATE MODERNO, CENTRALIZADO, SEM SCROLL LATERAL */}
      <section
        ref={chartRef}
        className="py-16 md:py-24 bg-white bg-opacity-70"
        style={{ minHeight: 420 }}
      >
        <div className="max-w-5xl mx-auto px-2 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            animate={chartInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 60 }}
            transition={{ duration: 0.8 }}
            className="mb-12 text-center"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Estoque Atual de Sangue
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Acompanhe o nível de cada tipo sanguíneo em tempo real. Cores indicam o status: <span className="font-semibold text-red-600">baixo</span>, <span className="font-semibold text-yellow-600">médio</span> e <span className="font-semibold text-green-600">cheio</span>.
            </p>
          </motion.div>
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-y-10 gap-x-4 md:gap-x-8 justify-items-center">
            {BLOOD_LEVELS.map((blood, idx) => (
              <motion.div
                key={blood.type}
                initial={{ opacity: 0, y: 60 }}
                animate={chartInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 60 }}
                transition={{ duration: 0.7, delay: 0.1 + idx * 0.10 }}
                className="flex flex-col items-center"
              >
                {/* Card circular moderno */}
                <div className="flex flex-col items-center">
                  <div
                    className={`w-14 h-14 rounded-full flex items-center justify-center mb-2 shadow-lg bg-white`}
                    style={{
                      borderWidth: 4,
                      borderStyle: 'solid',
                      borderColor:
                        blood.level < 35
                          ? '#ef4444' // vermelho
                          : blood.level < 70
                            ? '#facc15' // amarelo
                            : '#22c55e' // verde
                    }}
                  >
                    <Droplets
                      className={`h-7 w-7 ${blood.level < 35
                        ? 'text-red-500'
                        : blood.level < 70
                          ? 'text-yellow-600'
                          : 'text-green-500'
                        }`}

                    />
                  </div>
                  <span
                    className="text-base mt-1 font-semibold font-sans tracking-wide"
                    style={{ fontFamily: "'Montserrat', 'Segoe UI', Arial, sans-serif" }}
                  >
                    {blood.type}
                  </span>
                </div>
                {/* Barra vertical moderna */}
                <div className="w-4 h-24 bg-gray-200 rounded-full mt-2 flex items-end overflow-hidden">
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: chartInView ? `${animatedLevels[idx]}%` : 0 }}
                    transition={{ duration: 1, delay: 0.2 + idx * 0.10 }}
                    className={`w-full rounded-full ${getBarColor(animatedLevels[idx])}`}
                    style={{
                      minHeight: 10,
                      backgroundColor:
                        blood.level < 35
                          ? '#ef4444'
                          : blood.level < 70
                            ? '#facc15'
                            : '#22c55e'
                    }}
                  />
                </div>
                {/* Porcentagem */}
                <span className={`mt-2 font-semibold text-lg ${getBarLabelColor(animatedLevels[idx])}`}>
                  {animatedLevels[idx]}%
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="beneficios" className="py-16 md:py-24 bg-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeInUp} className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Benefícios para Todos
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Uma plataforma que conecta hemocentros e doadores, criando um ecossistema
              eficiente para salvar vidas.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* Para Hemocentros */}
            <motion.div
              initial={{ opacity: 0, x: -60 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="bg-gradient-to-br from-primary-50 to-primary-100 rounded-2xl p-8"
            >
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-primary-600 rounded-lg flex items-center justify-center mr-4">
                  <Activity className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Para Hemocentros</h3>
              </div>

              <ul className="space-y-4">
                {[
                  'Controle eficiente de estoque em tempo real',
                  'Dashboard intuitivo para gestão',
                  'Relatórios automatizados',
                  'Comunicação direta com doadores',
                  'Gestão de campanhas de doação'
                ].map((benefit, index) => (
                  <li key={index} className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-primary-600 mt-0.5 mr-3 flex-shrink-0" />
                    <span className="text-gray-700">{benefit}</span>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Para Doadores */}
            <motion.div
              initial={{ opacity: 0, x: 60 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="bg-gradient-to-br from-medical-50 to-medical-100 rounded-2xl p-8"
            >
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-medical-600 rounded-lg flex items-center justify-center mr-4">
                  <Heart className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Para Doadores</h3>
              </div>

              <ul className="space-y-4">
                {[
                  'Consulta de estoque em tempo real',
                  'Candidatura simples para doação',
                  'Transparência total sobre necessidades',
                  'Notificações personalizadas',
                  'Acompanhamento do impacto das doações'
                ].map((benefit, index) => (
                  <li key={index} className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-medical-600 mt-0.5 mr-3 flex-shrink-0" />
                    <span className="text-gray-700">{benefit}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="como-funciona" className="py-16 md:py-24 bg-white bg-opacity-70 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeInUp} className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Como Funciona
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Um processo simples e eficiente que conecta hemocentros e doadores
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: BarChart3,
                title: 'Hemocentro Atualiza',
                description: 'Profissionais atualizam os níveis de estoque de sangue em tempo real através do dashboard.',
                color: 'primary'
              },
              {
                icon: Bell,
                title: 'Doador Consulta',
                description: 'Doadores acessam a plataforma para verificar necessidades e estoques atuais.',
                color: 'medical'
              },
              {
                icon: UserCheck,
                title: 'Candidatura',
                description: 'Doadores se candidatam para doação e hemocentros fazem o contato.',
                color: 'green'
              }
            ].map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 60 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className={`w-16 h-16 mx-auto mb-6 rounded-2xl flex items-center justify-center ${step.color === 'primary' ? 'bg-primary-100' :
                  step.color === 'medical' ? 'bg-medical-100' : 'bg-green-100'
                  }`}>
                  <step.icon className={`h-8 w-8 ${step.color === 'primary' ? 'text-primary-600' :
                    step.color === 'medical' ? 'text-medical-600' : 'text-green-600'
                    }`} />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">{step.title}</h3>
                <p className="text-gray-600 leading-relaxed">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contato" className="py-16 md:py-24 bg-transparent">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeInUp} className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Interessado em uma Demonstração?
            </h2>
            <p className="text-xl text-gray-600">
              Fale conosco e descubra como o Hemolink pode transformar a gestão do seu hemocentro.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="bg-gray-50 rounded-2xl p-8"
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    Nome Completo
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
                    placeholder="Seu nome"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    E-mail
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
                    placeholder="seu@email.com"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="organization" className="block text-sm font-medium text-gray-700 mb-2">
                  Hemocentro/Organização
                </label>
                <input
                  type="text"
                  id="organization"
                  name="organization"
                  value={formData.organization}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
                  placeholder="Nome da sua organização"
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                  Mensagem
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors resize-none"
                  placeholder="Conte-nos mais sobre suas necessidades..."
                ></textarea>
              </div>

              <motion.button
                type="submit"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full bg-primary-600 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-primary-700 transition-colors flex items-center justify-center group"
              >
                <Send className="mr-2 h-5 w-5" />
                Solicitar Demonstração
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </motion.button>
            </form>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default LandingPage;