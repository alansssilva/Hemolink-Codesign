import React, { useState } from 'react';
import { ChevronDown, ChevronUp, HelpCircle, Heart, Shield, Clock } from 'lucide-react';

export const FAQ: React.FC = () => {
  const [openItem, setOpenItem] = useState<number | null>(null);

  const faqCategories = [
    {
      title: 'Requisitos e Elegibilidade',
      icon: Shield,
      color: 'text-blue-600 bg-blue-100',
      questions: [
        {
          question: 'Quem pode doar sangue?',
          answer: 'Pode doar sangue qualquer pessoa que: tenha entre 16 e 69 anos (menores precisam de autorização dos pais), pese no mínimo 50kg, esteja em boas condições de saúde, tenha dormido pelo menos 6 horas na noite anterior, esteja alimentado e apresente documento oficial com foto.'
        },
        {
          question: 'Posso doar se estiver tomando medicamentos?',
          answer: 'Depende do medicamento. Alguns medicamentos impedem a doação temporariamente, enquanto outros não interferem. É importante informar todos os medicamentos que está tomando durante a triagem médica.'
        },
        {
          question: 'Posso doar se tiver tatuagem ou piercing?',
          answer: 'Sim, desde que tenha sido feita há mais de 12 meses em local licenciado e com material esterilizado. Se foi feita recentemente, é necessário aguardar esse período.'
        },
        {
          question: 'Quem não pode doar sangue?',
          answer: 'Não podem doar: pessoas com menos de 50kg, que tenham tido hepatite B ou C, HIV, que usem drogas ilícitas, que tenham comportamento de risco para DSTs, gestantes, lactantes (até 12 meses após o parto) e pessoas com histórico de câncer.'
        }
      ]
    },
    {
      title: 'Processo de Doação',
      icon: Heart,
      color: 'text-red-600 bg-red-100',
      questions: [
        {
          question: 'Como funciona o processo de doação?',
          answer: 'O processo inclui: cadastro e questionário de saúde (10 min), exame médico e verificação de sinais vitais (10 min), doação propriamente dita (8-15 min), e lanche pós-doação (15 min). Todo o processo leva cerca de 45 minutos.'
        },
        {
          question: 'A doação dói?',
          answer: 'A doação causa apenas um pequeno desconforto no momento da inserção da agulha, similar a um exame de sangue comum. Durante a coleta, você não sentirá dor.'
        },
        {
          question: 'Quanto sangue é coletado?',
          answer: 'São coletados aproximadamente 450ml de sangue, o que representa menos de 10% do volume total do organismo. Essa quantidade é reposta naturalmente em 24-48 horas.'
        },
        {
          question: 'Posso doar sangue em jejum?',
          answer: 'Não é recomendado doar em jejum. É importante estar alimentado, preferencialmente evitando alimentos muito gordurosos 4 horas antes da doação.'
        }
      ]
    },
    {
      title: 'Frequência e Intervalo',
      icon: Clock,
      color: 'text-green-600 bg-green-100',
      questions: [
        {
          question: 'Com que frequência posso doar sangue?',
          answer: 'Homens podem doar a cada 60 dias (máximo 4 vezes por ano) e mulheres a cada 90 dias (máximo 3 vezes por ano). Esse intervalo é necessário para a completa reposição dos componentes sanguíneos.'
        },
        {
          question: 'Por que o intervalo é diferente para homens e mulheres?',
          answer: 'As mulheres têm intervalo maior devido à menstruação, que já representa uma perda natural de ferro. O intervalo maior permite a reposição adequada dos níveis de ferro.'
        },
        {
          question: 'O que acontece se eu não respeitar o intervalo?',
          answer: 'Não respeitar o intervalo pode levar à anemia e outros problemas de saúde. Nosso sistema controla automaticamente os intervalos e não permite doações fora do prazo.'
        }
      ]
    }
  ];

  const toggleItem = (index: number) => {
    setOpenItem(openItem === index ? null : index);
  };

  let questionIndex = 0;

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="bg-blue-100 rounded-full p-4 w-16 h-16 mx-auto mb-4">
            <HelpCircle className="h-8 w-8 text-blue-600 mx-auto" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Perguntas Frequentes
          </h1>
          <p className="text-xl text-gray-600">
            Tire suas dúvidas sobre doação de sangue
          </p>
        </div>

        {/* FAQ Categories */}
        <div className="space-y-8">
          {faqCategories.map((category, categoryIndex) => (
            <div key={categoryIndex} className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                <div className="flex items-center space-x-3">
                  <div className={`${category.color} rounded-full p-2`}>
                    <category.icon className="h-5 w-5" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">{category.title}</h2>
                </div>
              </div>

              <div className="divide-y divide-gray-200">
                {category.questions.map((item, itemIndex) => {
                  const currentQuestionIndex = questionIndex++;
                  return (
                    <div key={itemIndex} className="p-6">
                      <button
                        className="flex justify-between items-center w-full text-left"
                        onClick={() => toggleItem(currentQuestionIndex)}
                      >
                        <span className="text-lg font-medium text-gray-900 pr-4">
                          {item.question}
                        </span>
                        {openItem === currentQuestionIndex ? (
                          <ChevronUp className="h-5 w-5 text-gray-500 flex-shrink-0" />
                        ) : (
                          <ChevronDown className="h-5 w-5 text-gray-500 flex-shrink-0" />
                        )}
                      </button>
                      {openItem === currentQuestionIndex && (
                        <div className="mt-4 text-gray-600 leading-relaxed">
                          {item.answer}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Contact Section */}
        <div className="mt-12 bg-gradient-to-r from-red-600 to-red-800 rounded-xl shadow-lg p-8 text-white text-center">
          <h2 className="text-2xl font-bold mb-4">
            Não encontrou sua resposta?
          </h2>
          <p className="text-red-100 mb-6">
            Nossa equipe está pronta para esclarecer todas as suas dúvidas sobre doação de sangue.
          </p>
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <a
              href="tel:(22)2726-1234"
              className="bg-white text-red-600 px-6 py-3 rounded-lg font-semibold hover:bg-red-50 transition-colors"
            >
              Ligar: (22) 2726-1234
            </a>
            <a
              href="mailto:contato@hemolink.com"
              className="bg-red-700 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-800 transition-colors"
            >
              Email: contato@hemolink.com
            </a>
          </div>
        </div>

        {/* Quick Tips */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="bg-green-100 rounded-full p-3 w-12 h-12 mx-auto mb-4">
              <Heart className="h-6 w-6 text-green-600 mx-auto" />
            </div>
            <h3 className="font-bold text-gray-900 mb-2">Antes da Doação</h3>
            <p className="text-sm text-gray-600">
              Durma bem, alimente-se adequadamente e hidrate-se
            </p>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="bg-blue-100 rounded-full p-3 w-12 h-12 mx-auto mb-4">
              <Shield className="h-6 w-6 text-blue-600 mx-auto" />
            </div>
            <h3 className="font-bold text-gray-900 mb-2">Durante a Doação</h3>
            <p className="text-sm text-gray-600">
              Relaxe, converse com nossa equipe e mantenha-se calmo
            </p>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="bg-orange-100 rounded-full p-3 w-12 h-12 mx-auto mb-4">
              <Clock className="h-6 w-6 text-orange-600 mx-auto" />
            </div>
            <h3 className="font-bold text-gray-900 mb-2">Após a Doação</h3>
            <p className="text-sm text-gray-600">
              Faça o lanche oferecido e hidrate-se bem
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};