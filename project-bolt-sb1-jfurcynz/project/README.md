# Hemolink - Plataforma de Gestão de Hemocentro

Uma plataforma digital completa para gestão de estoque de sangue e incentivo à doação, desenvolvida para o hemocentro de Campos dos Goytacazes.

## 🎯 Visão Geral

O Hemolink é uma solução com duplo propósito:
- **Para Hemocentros**: Otimização da gestão de estoque de sangue
- **Para Doadores**: Engajamento e facilitação do processo de doação

## ⚠️ Importante: Migração para Java Spring Boot

Este protótipo foi desenvolvido em **React + Node.js** devido às limitações do ambiente de desenvolvimento. Para implementação em produção com **Java Spring Boot**, siga o guia de migração na seção correspondente.

## 🚀 Funcionalidades

### Sistema de Gestão de Estoque
- ✅ Dashboard com visualização em tempo real dos níveis de estoque
- ✅ Alertas automáticos para estoque crítico e baixo
- ✅ Registro de doações e uso de sangue
- ✅ Histórico e relatórios de demanda

### Portal de Incentivo à Doação
- ✅ Página educativa sobre doação de sangue
- ✅ Sistema de agendamento com confirmação
- ✅ Campanhas de conscientização
- ✅ Sistema básico de gamificação (pontos)
- ✅ Depoimentos e histórias inspiradoras

### Funcionalidades de Apoio
- ✅ Cadastro e perfil de doadores
- ✅ Sistema de autenticação
- ✅ FAQ completo
- ✅ Design responsivo
- ✅ Interface administrativa

## 🛠️ Tecnologias Utilizadas

### Frontend
- **React 18** com TypeScript
- **Tailwind CSS** para estilização
- **React Router** para navegação
- **Lucide React** para ícones
- **Context API** para gerenciamento de estado

### Backend (Atual - Node.js)
- **Express.js** como framework web
- **CORS** para cross-origin requests
- **Estrutura inspirada no Spring Boot** (Controllers, Services, Repositories)

## 📦 Instalação e Execução

### Pré-requisitos
- Node.js (versão 16 ou superior)
- npm ou yarn

### 1. Instalar Dependências
```bash
npm install
```

### 2. Executar o Backend
```bash
npm run server
```
O backend estará disponível em: `http://localhost:3001`

### 3. Executar o Frontend
```bash
npm run dev
```
O frontend estará disponível em: `http://localhost:5173`

## 🔐 Contas de Teste

### Administrador
- **Email**: admin@hemolink.com
- **Senha**: admin123

### Doador
- **Email**: doador@example.com
- **Senha**: doador123

## 📊 API Endpoints

### Estoque de Sangue
- `GET /api/blood-inventory` - Listar todos os tipos sanguíneos
- `GET /api/blood-inventory/:type` - Obter tipo específico
- `POST /api/blood-inventory/:type/update` - Atualizar estoque
- `GET /api/blood-inventory/alerts` - Alertas de estoque crítico

### Doadores
- `GET /api/donors` - Listar doadores
- `GET /api/donors/:id` - Obter doador específico
- `POST /api/donors` - Criar novo doador
- `PUT /api/donors/:id` - Atualizar doador

### Agendamentos
- `GET /api/appointments` - Listar agendamentos
- `GET /api/appointments/donor/:donorId` - Agendamentos por doador
- `POST /api/appointments` - Criar agendamento
- `PUT /api/appointments/:id/status` - Atualizar status

### Doações
- `GET /api/donations` - Listar doações
- `GET /api/donations/donor/:donorId` - Doações por doador
- `POST /api/donations` - Registrar doação

### Campanhas
- `GET /api/campaigns` - Listar campanhas
- `GET /api/campaigns/active` - Campanhas ativas
- `GET /api/campaigns/:id` - Campanha específica

## 🔄 Guia de Migração para Java Spring Boot

### 1. Criar Projeto Spring Boot

```bash
# Usar Spring Initializr ou Spring Boot CLI
spring init --dependencies=web,data-jpa,h2,validation hemolink-backend
```

### 2. Dependências Necessárias (pom.xml)

```xml
<dependencies>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-data-jpa</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-validation</artifactId>
    </dependency>
    <dependency>
        <groupId>com.h2database</groupId>
        <artifactId>h2</artifactId>
        <scope>runtime</scope>
    </dependency>
    <!-- Para PostgreSQL em produção -->
    <dependency>
        <groupId>org.postgresql</groupId>
        <artifactId>postgresql</artifactId>
        <scope>runtime</scope>
    </dependency>
</dependencies>
```

### 3. Estrutura de Pacotes Recomendada

```
src/main/java/com/hemolink/
├── HemolinkApplication.java
├── config/
│   └── WebConfig.java
├── controller/
│   ├── BloodInventoryController.java
│   ├── DonorController.java
│   ├── AppointmentController.java
│   └── DonationController.java
├── service/
│   ├── BloodInventoryService.java
│   ├── DonorService.java
│   ├── AppointmentService.java
│   └── DonationService.java
├── repository/
│   ├── BloodInventoryRepository.java
│   ├── DonorRepository.java
│   ├── AppointmentRepository.java
│   └── DonationRepository.java
├── model/
│   ├── BloodInventory.java
│   ├── Donor.java
│   ├── Appointment.java
│   └── Donation.java
└── dto/
    ├── BloodInventoryDTO.java
    ├── DonorDTO.java
    └── AppointmentDTO.java
```

### 4. Exemplo de Entidade JPA

```java
@Entity
@Table(name = "blood_inventory")
public class BloodInventory {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "blood_type", nullable = false, unique = true)
    private String type;
    
    @Column(name = "quantity", nullable = false)
    private Integer quantity;
    
    @Column(name = "min_quantity", nullable = false)
    private Integer minQuantity;
    
    @Column(name = "last_updated")
    private LocalDateTime lastUpdated;
    
    // Getters, setters, constructors
}
```

### 5. Exemplo de Repository

```java
@Repository
public interface BloodInventoryRepository extends JpaRepository<BloodInventory, Long> {
    Optional<BloodInventory> findByType(String type);
    List<BloodInventory> findByQuantityLessThanEqual(Integer minQuantity);
}
```

### 6. Exemplo de Service

```java
@Service
@Transactional
public class BloodInventoryService {
    
    @Autowired
    private BloodInventoryRepository repository;
    
    public List<BloodInventory> getAllBloodTypes() {
        return repository.findAll();
    }
    
    public Optional<BloodInventory> getBloodTypeByType(String type) {
        return repository.findByType(type);
    }
    
    // Outros métodos...
}
```

### 7. Exemplo de Controller

```java
@RestController
@RequestMapping("/api/blood-inventory")
@CrossOrigin(origins = "http://localhost:5173")
public class BloodInventoryController {
    
    @Autowired
    private BloodInventoryService service;
    
    @GetMapping
    public ResponseEntity<List<BloodInventory>> getAll() {
        List<BloodInventory> inventory = service.getAllBloodTypes();
        return ResponseEntity.ok(inventory);
    }
    
    @GetMapping("/{type}")
    public ResponseEntity<BloodInventory> getByType(@PathVariable String type) {
        return service.getBloodTypeByType(type)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }
    
    // Outros endpoints...
}
```

### 8. Configuração do Banco (application.properties)

```properties
# H2 Database (desenvolvimento)
spring.datasource.url=jdbc:h2:mem:hemolink
spring.datasource.driverClassName=org.h2.Driver
spring.datasource.username=sa
spring.datasource.password=password
spring.jpa.database-platform=org.hibernate.dialect.H2Dialect
spring.h2.console.enabled=true

# PostgreSQL (produção)
# spring.datasource.url=jdbc:postgresql://localhost:5432/hemolink
# spring.datasource.username=hemolink
# spring.datasource.password=senha_segura
# spring.jpa.database-platform=org.hibernate.dialect.PostgreSQLDialect

spring.jpa.hibernate.ddl-auto=create-drop
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.format_sql=true
```

## 🎨 Design System

### Paleta de Cores
- **Vermelho Principal**: #DC2626 (Red-600)
- **Azul**: #3B82F6 (Blue-600)  
- **Verde**: #059669 (Green-600)
- **Laranja**: #EA580C (Orange-600)
- **Cinza**: #6B7280 (Gray-500)

### Tipografia
- **Font Primary**: Inter (system font stack)
- **Tamanhos**: 12px, 14px, 16px, 18px, 20px, 24px, 30px, 36px, 48px

### Componentes
- Cards com sombra sutil e bordas arredondadas
- Botões com estados hover e focus
- Formulários com validação visual
- Alertas contextuais por cores

## 📱 Responsividade

O design é otimizado para:
- **Mobile**: < 768px
- **Tablet**: 768px - 1024px  
- **Desktop**: > 1024px

## 🔒 Segurança

### Implementações Atuais
- Autenticação básica com Context API
- Validação de formulários
- Sanitização de dados

### Para Produção com Spring Boot
- Spring Security para autenticação/autorização
- JWT para sessões
- Validação com Bean Validation
- HTTPS obrigatório
- Rate limiting
- Auditoria de ações

## 📈 Próximos Passos

### Funcionalidades Futuras
- [ ] Sistema de notificações em tempo real
- [ ] Integração com WhatsApp para lembretes
- [ ] Dashboard analítico avançado
- [ ] Sistema de badges e conquistas
- [ ] Integração com sistemas hospitalares
- [ ] App mobile nativo
- [ ] Sistema de voluntários

### Melhorias Técnicas
- [ ] Migração completa para Spring Boot
- [ ] Implementação de cache (Redis)
- [ ] Monitoramento com Micrometer
- [ ] Testes automatizados (JUnit, MockMvc)
- [ ] CI/CD pipeline
- [ ] Containerização com Docker
- [ ] Deploy em cloud (AWS/GCP)

## 🤝 Contribuição

Este projeto foi desenvolvido como protótipo para demonstração das funcionalidades do Hemolink. Para contribuições:

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para detalhes.

## 📞 Contato

**Hemolink - Conectando Vidas**
- Email: contato@hemolink.com
- Telefone: (22) 2726-1234
- Endereço: Rua Dr. Nilo Peçanha, 123 - Centro, Campos dos Goytacazes - RJ

---

**Desenvolvido com ❤️ para salvar vidas através da tecnologia**