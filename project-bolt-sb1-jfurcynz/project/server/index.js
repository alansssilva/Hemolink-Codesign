/**
 * HEMOLINK BACKEND - Estrutura similar ao Spring Boot
 * 
 * Esta implementação Node.js/Express simula a estrutura que seria
 * utilizada em uma aplicação Spring Boot, incluindo:
 * - Controllers (similar aos @RestController)
 * - Services (similar aos @Service) 
 * - Repositories (similar aos @Repository)
 * - Models/Entities (similar aos @Entity)
 * 
 * Para migrar para Spring Boot:
 * 1. Criar projeto Spring Boot com dependências: web, data-jpa, h2/postgresql
 * 2. Converter models para entidades JPA com anotações @Entity, @Table, etc.
 * 3. Criar repositórios extends JpaRepository
 * 4. Converter services para classes com @Service
 * 5. Converter controllers para @RestController com @RequestMapping
 * 6. Configurar application.properties para banco de dados
 */

const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Simulação de banco de dados em memória (equivale ao H2 Database)
const database = {
  bloodInventory: [
    { id: 1, type: 'A+', quantity: 45, minQuantity: 30, lastUpdated: new Date().toISOString() },
    { id: 2, type: 'A-', quantity: 12, minQuantity: 20, lastUpdated: new Date().toISOString() },
    { id: 3, type: 'B+', quantity: 38, minQuantity: 25, lastUpdated: new Date().toISOString() },
    { id: 4, type: 'B-', quantity: 18, minQuantity: 15, lastUpdated: new Date().toISOString() },
    { id: 5, type: 'AB+', quantity: 22, minQuantity: 15, lastUpdated: new Date().toISOString() },
    { id: 6, type: 'AB-', quantity: 8, minQuantity: 10, lastUpdated: new Date().toISOString() },
    { id: 7, type: 'O+', quantity: 55, minQuantity: 40, lastUpdated: new Date().toISOString() },
    { id: 8, type: 'O-', quantity: 14, minQuantity: 25, lastUpdated: new Date().toISOString() }
  ],
  donors: [
    {
      id: '2',
      name: 'João Silva',
      email: 'doador@example.com',
      phone: '(22) 99999-9999',
      bloodType: 'O+',
      birthDate: '1990-05-15',
      address: 'Rua das Flores, 123',
      city: 'Campos dos Goytacazes',
      registrationDate: '2024-01-15',
      lastDonation: '2024-11-15',
      totalDonations: 5,
      points: 500,
      isActive: true
    }
  ],
  appointments: [
    {
      id: '1',
      donorId: '2',
      donorName: 'João Silva',
      donorPhone: '(22) 99999-9999',
      bloodType: 'O+',
      date: '2024-12-20',
      time: '09:00',
      status: 'scheduled',
      notes: 'Primeira doação pelo sistema'
    }
  ],
  donations: [
    {
      id: '1',
      donorId: '2',
      donorName: 'João Silva',
      bloodType: 'O+',
      date: '2024-11-15',
      quantity: 450,
      status: 'completed',
      notes: 'Doação realizada com sucesso'
    }
  ],
  campaigns: [
    {
      id: '1',
      title: 'Campanha de Natal - Doe Vida',
      description: 'Campanha especial de final de ano para aumentar o estoque de sangue para as festividades.',
      targetBloodTypes: ['O-', 'A-', 'B-'],
      startDate: '2024-12-01',
      endDate: '2024-12-31',
      isActive: true,
      priority: 'high'
    }
  ]
};

// ===== REPOSITORIES (equivalente aos @Repository do Spring Boot) =====

class BloodInventoryRepository {
  findAll() {
    return database.bloodInventory;
  }

  findByType(type) {
    return database.bloodInventory.find(item => item.type === type);
  }

  update(type, data) {
    const index = database.bloodInventory.findIndex(item => item.type === type);
    if (index !== -1) {
      database.bloodInventory[index] = { ...database.bloodInventory[index], ...data };
      return database.bloodInventory[index];
    }
    return null;
  }

  getCriticalStock() {
    return database.bloodInventory.filter(item => item.quantity <= item.minQuantity * 0.5);
  }

  getLowStock() {
    return database.bloodInventory.filter(item => item.quantity <= item.minQuantity && item.quantity > item.minQuantity * 0.5);
  }
}

class DonorRepository {
  findAll() {
    return database.donors;
  }

  findById(id) {
    return database.donors.find(donor => donor.id === id);
  }

  save(donor) {
    const newDonor = { ...donor, id: Date.now().toString() };
    database.donors.push(newDonor);
    return newDonor;
  }

  update(id, data) {
    const index = database.donors.findIndex(donor => donor.id === id);
    if (index !== -1) {
      database.donors[index] = { ...database.donors[index], ...data };
      return database.donors[index];
    }
    return null;
  }
}

class AppointmentRepository {
  findAll() {
    return database.appointments;
  }

  findByDonorId(donorId) {
    return database.appointments.filter(apt => apt.donorId === donorId);
  }

  save(appointment) {
    const newAppointment = { ...appointment, id: Date.now().toString() };
    database.appointments.push(newAppointment);
    return newAppointment;
  }

  updateStatus(id, status) {
    const index = database.appointments.findIndex(apt => apt.id === id);
    if (index !== -1) {
      database.appointments[index].status = status;
      return database.appointments[index];
    }
    return null;
  }
}

class DonationRepository {
  findAll() {
    return database.donations;
  }

  findByDonorId(donorId) {
    return database.donations.filter(donation => donation.donorId === donorId);
  }

  save(donation) {
    const newDonation = { ...donation, id: Date.now().toString() };
    database.donations.push(newDonation);
    return newDonation;
  }
}

class CampaignRepository {
  findAll() {
    return database.campaigns;
  }

  findActive() {
    return database.campaigns.filter(campaign => campaign.isActive);
  }

  findById(id) {
    return database.campaigns.find(campaign => campaign.id === id);
  }
}

// ===== SERVICES (equivalente aos @Service do Spring Boot) =====

class BloodInventoryService {
  constructor() {
    this.repository = new BloodInventoryRepository();
  }

  getAllBloodTypes() {
    return this.repository.findAll();
  }

  getBloodTypeByType(type) {
    return this.repository.findByType(type);
  }

  updateStock(type, quantity, operation) {
    const current = this.repository.findByType(type);
    if (!current) return null;

    const newQuantity = operation === 'add' 
      ? current.quantity + quantity 
      : current.quantity - quantity;

    return this.repository.update(type, {
      quantity: Math.max(0, newQuantity),
      lastUpdated: new Date().toISOString()
    });
  }

  getCriticalAlerts() {
    const critical = this.repository.getCriticalStock();
    const low = this.repository.getLowStock();
    
    return {
      critical: critical.map(item => ({
        type: item.type,
        currentLevel: item.quantity,
        minLevel: item.minQuantity,
        severity: 'critical'
      })),
      low: low.map(item => ({
        type: item.type,
        currentLevel: item.quantity,
        minLevel: item.minQuantity,
        severity: 'low'
      }))
    };
  }
}

class DonorService {
  constructor() {
    this.repository = new DonorRepository();
  }

  getAllDonors() {
    return this.repository.findAll();
  }

  getDonorById(id) {
    return this.repository.findById(id);
  }

  createDonor(donorData) {
    const donor = {
      ...donorData,
      registrationDate: new Date().toISOString(),
      totalDonations: 0,
      points: 0,
      isActive: true
    };
    return this.repository.save(donor);
  }

  updateDonor(id, data) {
    return this.repository.update(id, data);
  }
}

class AppointmentService {
  constructor() {
    this.repository = new AppointmentRepository();
    this.donorService = new DonorService();
  }

  getAllAppointments() {
    return this.repository.findAll();
  }

  getAppointmentsByDonor(donorId) {
    return this.repository.findByDonorId(donorId);
  }

  createAppointment(appointmentData) {
    // Verificar se doador existe
    const donor = this.donorService.getDonorById(appointmentData.donorId);
    if (!donor) {
      throw new Error('Doador não encontrado');
    }

    const appointment = {
      ...appointmentData,
      donorName: donor.name,
      donorPhone: donor.phone,
      bloodType: donor.bloodType,
      status: 'scheduled'
    };

    return this.repository.save(appointment);
  }

  updateAppointmentStatus(id, status) {
    return this.repository.updateStatus(id, status);
  }
}

class DonationService {
  constructor() {
    this.repository = new DonationRepository();
    this.bloodInventoryService = new BloodInventoryService();
    this.donorService = new DonorService();
  }

  getAllDonations() {
    return this.repository.findAll();
  }

  getDonationsByDonor(donorId) {
    return this.repository.findByDonorId(donorId);
  }

  recordDonation(donationData) {
    // Criar registro de doação
    const donation = {
      ...donationData,
      date: new Date().toISOString(),
      quantity: 450, // Quantidade padrão em ml
      status: 'completed'
    };

    const savedDonation = this.repository.save(donation);

    // Atualizar estoque de sangue
    this.bloodInventoryService.updateStock(donation.bloodType, 0.45, 'add'); // Converter ml para litros

    // Atualizar dados do doador
    const donor = this.donorService.getDonorById(donation.donorId);
    if (donor) {
      this.donorService.updateDonor(donation.donorId, {
        lastDonation: donation.date,
        totalDonations: donor.totalDonations + 1,
        points: donor.points + 100 // Sistema de pontuação
      });
    }

    return savedDonation;
  }
}

class CampaignService {
  constructor() {
    this.repository = new CampaignRepository();
  }

  getAllCampaigns() {
    return this.repository.findAll();
  }

  getActiveCampaigns() {
    return this.repository.findActive();
  }

  getCampaignById(id) {
    return this.repository.findById(id);
  }
}

// ===== CONTROLLERS (equivalente aos @RestController do Spring Boot) =====

class BloodInventoryController {
  constructor() {
    this.service = new BloodInventoryService();
  }

  // GET /api/blood-inventory
  async getAll(req, res) {
    try {
      const inventory = this.service.getAllBloodTypes();
      res.json(inventory);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // GET /api/blood-inventory/:type
  async getByType(req, res) {
    try {
      const { type } = req.params;
      const bloodType = this.service.getBloodTypeByType(type);
      if (!bloodType) {
        return res.status(404).json({ error: 'Tipo sanguíneo não encontrado' });
      }
      res.json(bloodType);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // POST /api/blood-inventory/:type/update
  async updateStock(req, res) {
    try {
      const { type } = req.params;
      const { quantity, operation } = req.body;
      
      const updated = this.service.updateStock(type, quantity, operation);
      if (!updated) {
        return res.status(404).json({ error: 'Tipo sanguíneo não encontrado' });
      }
      
      res.json(updated);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // GET /api/blood-inventory/alerts
  async getAlerts(req, res) {
    try {
      const alerts = this.service.getCriticalAlerts();
      res.json(alerts);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

class DonorController {
  constructor() {
    this.service = new DonorService();
  }

  // GET /api/donors
  async getAll(req, res) {
    try {
      const donors = this.service.getAllDonors();
      res.json(donors);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // GET /api/donors/:id
  async getById(req, res) {
    try {
      const { id } = req.params;
      const donor = this.service.getDonorById(id);
      if (!donor) {
        return res.status(404).json({ error: 'Doador não encontrado' });
      }
      res.json(donor);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // POST /api/donors
  async create(req, res) {
    try {
      const donor = this.service.createDonor(req.body);
      res.status(201).json(donor);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  // PUT /api/donors/:id
  async update(req, res) {
    try {
      const { id } = req.params;
      const updated = this.service.updateDonor(id, req.body);
      if (!updated) {
        return res.status(404).json({ error: 'Doador não encontrado' });
      }
      res.json(updated);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
}

class AppointmentController {
  constructor() {
    this.service = new AppointmentService();
  }

  // GET /api/appointments
  async getAll(req, res) {
    try {
      const appointments = this.service.getAllAppointments();
      res.json(appointments);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // GET /api/appointments/donor/:donorId
  async getByDonor(req, res) {
    try {
      const { donorId } = req.params;
      const appointments = this.service.getAppointmentsByDonor(donorId);
      res.json(appointments);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // POST /api/appointments
  async create(req, res) {
    try {
      const appointment = this.service.createAppointment(req.body);
      res.status(201).json(appointment);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  // PUT /api/appointments/:id/status
  async updateStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const updated = this.service.updateAppointmentStatus(id, status);
      if (!updated) {
        return res.status(404).json({ error: 'Agendamento não encontrado' });
      }
      res.json(updated);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
}

class DonationController {
  constructor() {
    this.service = new DonationService();
  }

  // GET /api/donations
  async getAll(req, res) {
    try {
      const donations = this.service.getAllDonations();
      res.json(donations);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // GET /api/donations/donor/:donorId
  async getByDonor(req, res) {
    try {
      const { donorId } = req.params;
      const donations = this.service.getDonationsByDonor(donorId);
      res.json(donations);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // POST /api/donations
  async create(req, res) {
    try {
      const donation = this.service.recordDonation(req.body);
      res.status(201).json(donation);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
}

class CampaignController {
  constructor() {
    this.service = new CampaignService();
  }

  // GET /api/campaigns
  async getAll(req, res) {
    try {
      const campaigns = this.service.getAllCampaigns();
      res.json(campaigns);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // GET /api/campaigns/active
  async getActive(req, res) {
    try {
      const campaigns = this.service.getActiveCampaigns();
      res.json(campaigns);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // GET /api/campaigns/:id
  async getById(req, res) {
    try {
      const { id } = req.params;
      const campaign = this.service.getCampaignById(id);
      if (!campaign) {
        return res.status(404).json({ error: 'Campanha não encontrada' });
      }
      res.json(campaign);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

// ===== CONFIGURAÇÃO DE ROTAS (equivalente aos @RequestMapping) =====

const bloodInventoryController = new BloodInventoryController();
const donorController = new DonorController();
const appointmentController = new AppointmentController();
const donationController = new DonationController();
const campaignController = new CampaignController();

// Blood Inventory Routes
app.get('/api/blood-inventory', (req, res) => bloodInventoryController.getAll(req, res));
app.get('/api/blood-inventory/:type', (req, res) => bloodInventoryController.getByType(req, res));
app.post('/api/blood-inventory/:type/update', (req, res) => bloodInventoryController.updateStock(req, res));
app.get('/api/blood-inventory/alerts', (req, res) => bloodInventoryController.getAlerts(req, res));

// Donor Routes
app.get('/api/donors', (req, res) => donorController.getAll(req, res));
app.get('/api/donors/:id', (req, res) => donorController.getById(req, res));
app.post('/api/donors', (req, res) => donorController.create(req, res));
app.put('/api/donors/:id', (req, res) => donorController.update(req, res));

// Appointment Routes
app.get('/api/appointments', (req, res) => appointmentController.getAll(req, res));
app.get('/api/appointments/donor/:donorId', (req, res) => appointmentController.getByDonor(req, res));
app.post('/api/appointments', (req, res) => appointmentController.create(req, res));
app.put('/api/appointments/:id/status', (req, res) => appointmentController.updateStatus(req, res));

// Donation Routes
app.get('/api/donations', (req, res) => donationController.getAll(req, res));
app.get('/api/donations/donor/:donorId', (req, res) => donationController.getByDonor(req, res));
app.post('/api/donations', (req, res) => donationController.create(req, res));

// Campaign Routes
app.get('/api/campaigns', (req, res) => campaignController.getAll(req, res));
app.get('/api/campaigns/active', (req, res) => campaignController.getActive(req, res));
app.get('/api/campaigns/:id', (req, res) => campaignController.getById(req, res));

// Health Check Route
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'UP',
    message: 'Hemolink API está funcionando',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Erro na API:', error);
  res.status(500).json({
    error: 'Erro interno do servidor',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Erro interno'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Endpoint não encontrado' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Servidor Hemolink rodando na porta ${PORT}`);
  console.log(`📊 API disponível em: http://localhost:${PORT}/api`);
  console.log(`🏥 Health check: http://localhost:${PORT}/api/health`);
  console.log(`📖 Documentação da migração para Spring Boot disponível nos comentários do código`);
});

module.exports = app;