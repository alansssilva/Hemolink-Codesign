import React from 'react';
import { Heart, Users, Shield, Clock, Award, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export const WhyDonate: React.FC = () => {
  const benefits = [
    {
      icon: Heart,
      title: 'Salve Vidas',
      description: 'Uma única doação pode salvar até 4 vidas. Seja o herói de alguém hoje.',
      color: 'text-red-600 bg-red-100'
    },
    {
      icon: Shield,
      title: 'Check-up Gratuito',
      description: 'Receba exames gratuitos e monitore sua saúde a cada doação.',
      color: 'text-blue-600 bg-blue-100'
    },
    {
      icon: Users,
      title: 'Ajude sua Comunidade',
      description: 'Contribua diretamente para a saúde e bem-estar da sua cidade.',
      color: 'text-green-600 bg-green-100'
    },
    {
      icon: Award,
      title: 'Reconhecimento',
      description: 'Ganhe pontos e conquistas por sua generosidade e constância.',
      color: 'text-purple-600 bg-purple-100'
    }
  ];

  const requirements = [
    'Ter entre 16 e 69 anos (menores precisam de autorização)',
    'Pesar no mínimo 50kg',
    'Estar em boas condições de saúde',
    'Ter dormido pelo menos 6 horas na noite anterior',
    'Estar alimentado (evitar alimentos gordurosos)',
    'Apresentar documento oficial com foto',
    'Não ter consumido bebida alcoólica nas últimas 12 horas'
  ];

  const myths = [
    {
      myth: 'Doar sangue engorda',
      fact: 'FALSO - A doação não altera o peso corporal.'
    },
    {
      myth: 'Doar sangue vicia',
      fact: 'FALSO - Não existe dependência física ou química.'
    },
    {
      myth: 'Doar sangue enfraquece',
      fact: 'FALSO - O organismo repõe o sangue doado naturalmente.'
    },
    {
      myth: 'Posso pegar doenças doando',
      fact: 'FALSO - Todo material é descartável e esterilizado.'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-red-600 to-red-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl font-bold mb-6">
            Por que Doar Sangue?
          </h1>
          <p className="text-xl text-red-100 max-w-3xl mx-auto mb-8">
            Descubra como um simples gesto de 30 minutos pode transformar vidas 
            e trazer benefícios incríveis para você também.
          </p>
          <Link
            to="/schedule"
            className="bg-white text-red-600 px-8 py-4 rounded-lg font-semibold hover:bg-red-50 transition-all inline-flex items-center space-x-2"
          >
            <Heart className="h-5 w-5" />
            <span>Quero Doar Agora</span>
          </Link>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Benefícios da Doação
            </h2>
            <p className="text-xl text-gray-600">
              Doe sangue e ganhe muito mais do que imagina
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => (
              <div key={index} className="text-center group">
                <div className={`${benefit.color} rounded-full p-4 w-16 h-16 mx-auto mb-4 group-hover:scale-110 transition-transform`}>
                  <benefit.icon className="h-8 w-8 mx-auto" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{benefit.title}</h3>
                <p className="text-gray-600">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Como Funciona o Processo
            </h2>
            <p className="text-xl text-gray-600">
              Um processo simples, seguro e rápido
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { step: '1', title: 'Cadastro', description: 'Cadastre-se no Hemolink e agende sua doação', icon: Users },
              { step: '2', title: 'Triagem', description: 'Avaliação médica rápida e exames básicos', icon: Shield },
              { step: '3', title: 'Doação', description: 'Processo de doação de 8-15 minutos', icon: Heart },
              { step: '4', title: 'Lanche', description: 'Lanche reforçado e hidratação pós-doação', icon: Award }
            ].map((process, index) => (
              <div key={index} className="relative">
                <div className="bg-white rounded-xl shadow-lg p-6 text-center">
                  <div className="bg-red-600 text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                    {process.step}
                  </div>
                  <div className="bg-red-100 rounded-full p-3 w-16 h-16 mx-auto mb-4">
                    <process.icon className="h-8 w-8 text-red-600 mx-auto" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{process.title}</h3>
                  <p className="text-gray-600 text-sm">{process.description}</p>
                </div>
                {index < 3 && (
                  <div className="hidden lg:block absolute top-1/2 right-0 transform translate-x-1/2 -translate-y-1/2">
                    <div className="w-8 h-0.5 bg-red-300"></div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Requirements Section */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Requisitos Básicos
            </h2>
            <p className="text-xl text-gray-600">
              Verifique se você está apto para doar
            </p>
          </div>

          <div className="bg-green-50 rounded-xl p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {requirements.map((requirement, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">{requirement}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="text-center mt-8">
            <p className="text-sm text-gray-600 mb-4">
              Em caso de dúvidas, consulte sempre nossa equipe médica
            </p>
            <Link
              to="/faq"
              className="text-red-600 hover:text-red-700 font-medium"
            >
              Ver mais perguntas frequentes →
            </Link>
          </div>
        </div>
      </section>

      {/* Myths vs Facts */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Mitos e Verdades
            </h2>
            <p className="text-xl text-gray-600">
              Esclareça suas dúvidas sobre a doação de sangue
            </p>
          </div>

          <div className="space-y-6">
            {myths.map((item, index) => (
              <div key={index} className="bg-white rounded-xl shadow-md p-6">
                <div className="flex items-start space-x-4">
                  <div className="bg-red-100 rounded-full p-2 flex-shrink-0">
                    <Heart className="h-6 w-6 text-red-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900 mb-2">
                      "{item.myth}"
                    </h3>
                    <p className="text-gray-700">
                      <span className="font-semibold text-green-600">VERDADE:</span> {item.fact}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-red-600 to-red-800">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-white mb-6">
            Pronto para Ser um Herói?
          </h2>
          <p className="text-xl text-red-100 mb-8">
            Agende sua doação agora e junte-se aos milhares de pessoas que já salvaram vidas.
          </p>
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Link
              to="/schedule"
              className="bg-white text-red-600 px-8 py-4 rounded-lg font-semibold hover:bg-red-50 transition-all inline-flex items-center justify-center space-x-2"
            >
              <Clock className="h-5 w-5" />
              <span>Agendar Doação</span>
            </Link>
            <Link
              to="/register"
              className="bg-red-700 text-white px-8 py-4 rounded-lg font-semibold hover:bg-red-800 transition-all inline-flex items-center justify-center space-x-2"
            >
              <Users className="h-5 w-5" />
              <span>Cadastrar-se</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};