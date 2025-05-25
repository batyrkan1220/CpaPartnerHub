import {
  users, type User, type InsertUser,
  offers, type Offer, type InsertOffer,
  leads, type Lead, type InsertLead,
  payments, type Payment, type InsertPayment,
  motivationPrograms, type MotivationProgram, type InsertMotivationProgram,
  UserRole, LeadStatus, OfferCategory
} from "@shared/schema";

// Интерфейс хранилища с методами CRUD
export interface IStorage {
  // Пользователи
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  listUsers(role?: string): Promise<User[]>;
  updateUser(id: number, userData: Partial<User>): Promise<User | undefined>;
  
  // Офферы
  getOffer(id: number): Promise<Offer | undefined>;
  createOffer(offer: InsertOffer): Promise<Offer>;
  listOffers(filters?: {category?: string, advertiserId?: number, isActive?: boolean}): Promise<Offer[]>;
  updateOffer(id: number, offerData: Partial<Offer>): Promise<Offer | undefined>;
  
  // Лиды
  getLead(id: number): Promise<Lead | undefined>;
  createLead(lead: InsertLead): Promise<Lead>;
  listLeads(filters?: {offerId?: number, partnerId?: number, status?: string}): Promise<Lead[]>;
  updateLeadStatus(id: number, status: string, reason?: string): Promise<Lead | undefined>;
  
  // Платежи
  getPayment(id: number): Promise<Payment | undefined>;
  createPayment(payment: InsertPayment): Promise<Payment>;
  listPayments(partnerId?: number): Promise<Payment[]>;
  updatePaymentStatus(id: number, status: string): Promise<Payment | undefined>;
  
  // Мотивационные программы
  getMotivationProgram(id: number): Promise<MotivationProgram | undefined>;
  createMotivationProgram(program: InsertMotivationProgram): Promise<MotivationProgram>;
  listMotivationPrograms(isActive?: boolean): Promise<MotivationProgram[]>;
  updateMotivationProgram(id: number, programData: Partial<MotivationProgram>): Promise<MotivationProgram | undefined>;
  
  // Аналитика
  getLeadStats(filters?: {startDate?: Date, endDate?: Date, partnerId?: number, offerId?: number}): Promise<{
    total: number,
    approved: number,
    rejected: number,
    pending: number,
    conversionRate: number
  }>;
  
  getPartnerStats(partnerId: number): Promise<{
    totalLeads: number,
    approvedLeads: number,
    conversionRate: number,
    earnings: number
  }>;
  
  getTopOffers(limit?: number): Promise<Array<Offer & {conversions: number, revenue: number, conversionRate: number}>>;
  getTopPartners(limit?: number): Promise<Array<User & {leads: number, approvalRate: number, earnings: number}>>;
  
  getFraudMetrics(): Promise<{
    overallFraudRate: number,
    suspiciousPartners: number,
    flaggedLeads: number
  }>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private offers: Map<number, Offer>;
  private leads: Map<number, Lead>;
  private payments: Map<number, Payment>;
  private motivationPrograms: Map<number, MotivationProgram>;
  
  private currentUserId: number;
  private currentOfferId: number;
  private currentLeadId: number;
  private currentPaymentId: number;
  private currentProgramId: number;

  constructor() {
    this.users = new Map();
    this.offers = new Map();
    this.leads = new Map();
    this.payments = new Map();
    this.motivationPrograms = new Map();
    
    this.currentUserId = 1;
    this.currentOfferId = 1;
    this.currentLeadId = 1;
    this.currentPaymentId = 1;
    this.currentProgramId = 1;
    
    // Добавляем демо-пользователей
    this.seedUsers();
    this.seedOffers();
    this.seedLeads();
  }

  // Создание демо-данных
  private seedUsers() {
    const adminUser: User = {
      id: this.currentUserId++,
      username: "admin",
      password: "admin123", // В реальном приложении должен быть хешированный пароль
      email: "admin@cpaplatform.ru",
      role: UserRole.ADMIN,
      fullName: "Админ Админов",
      avatarInitials: "АА",
      balance: 0,
      trafficSources: null,
      isActive: true,
      fraudScore: 0
    };
    
    const partnerUser: User = {
      id: this.currentUserId++,
      username: "partner",
      password: "partner123",
      email: "partner@example.com",
      role: UserRole.PARTNER,
      fullName: "Иванов Сергей",
      avatarInitials: "ИС",
      balance: 142560,
      trafficSources: "FB Таргет, VK Таргет",
      isActive: true,
      fraudScore: 0.5
    };
    
    const advertiserUser: User = {
      id: this.currentUserId++,
      username: "advertiser",
      password: "advertiser123",
      email: "advertiser@example.com",
      role: UserRole.ADVERTISER,
      fullName: "ВТБ Банк",
      avatarInitials: "ВБ",
      balance: 0,
      trafficSources: null,
      isActive: true,
      fraudScore: 0
    };
    
    this.users.set(adminUser.id, adminUser);
    this.users.set(partnerUser.id, partnerUser);
    this.users.set(advertiserUser.id, advertiserUser);
    
    // Добавляем еще партнеров для демо
    const partner2: User = {
      id: this.currentUserId++,
      username: "partner2",
      password: "partner123",
      email: "partner2@example.com",
      role: UserRole.PARTNER,
      fullName: "Петров Алексей",
      avatarInitials: "ПА",
      balance: 118240,
      trafficSources: "Контекст, SEO",
      isActive: true,
      fraudScore: 0.2
    };
    
    const partner3: User = {
      id: this.currentUserId++,
      username: "partner3",
      password: "partner123",
      email: "partner3@example.com",
      role: UserRole.PARTNER,
      fullName: "Сидорова Мария",
      avatarInitials: "СМ",
      balance: 87520,
      trafficSources: "Тизерные сети",
      isActive: true,
      fraudScore: 0.8
    };
    
    const partner4: User = {
      id: this.currentUserId++,
      username: "partner4",
      password: "partner123",
      email: "partner4@example.com",
      role: UserRole.PARTNER,
      fullName: "Козлов Дмитрий",
      avatarInitials: "КД",
      balance: 63480,
      trafficSources: "Push-уведомления",
      isActive: true,
      fraudScore: 0.3
    };
    
    this.users.set(partner2.id, partner2);
    this.users.set(partner3.id, partner3);
    this.users.set(partner4.id, partner4);
  }
  
  private seedOffers() {
    const advertiserId = Array.from(this.users.values())
      .find(user => user.role === UserRole.ADVERTISER)?.id || 3;
    
    const offer1: Offer = {
      id: this.currentOfferId++,
      title: "Кредитная карта ВТБ",
      description: "Оформление кредитной карты ВТБ с лимитом до 1 000 000 рублей",
      category: OfferCategory.FINANCE,
      advertiserId,
      paymentAmount: 1500,
      paymentType: "CPA",
      requirements: "Граждане РФ, возраст от 21 года, постоянный доход",
      conversionRate: 12.4,
      isActive: true
    };
    
    const offer2: Offer = {
      id: this.currentOfferId++,
      title: "Займ Быстроденьги",
      description: "Быстрые займы до 30 000 рублей",
      category: OfferCategory.LOANS,
      advertiserId,
      paymentAmount: 1200,
      paymentType: "CPA",
      requirements: "Граждане РФ, возраст от 18 лет",
      conversionRate: 9.7,
      isActive: true
    };
    
    const offer3: Offer = {
      id: this.currentOfferId++,
      title: "Страхование Ингосстрах",
      description: "Оформление полиса ОСАГО онлайн",
      category: OfferCategory.INSURANCE,
      advertiserId,
      paymentAmount: 800,
      paymentType: "CPA",
      requirements: "Наличие автомобиля, возраст от 18 лет",
      conversionRate: 8.2,
      isActive: true
    };
    
    const offer4: Offer = {
      id: this.currentOfferId++,
      title: "Ипотека Сбербанк",
      description: "Ипотечное кредитование от Сбербанка",
      category: OfferCategory.FINANCE,
      advertiserId,
      paymentAmount: 2000,
      paymentType: "CPA",
      requirements: "Граждане РФ, возраст от 21 года, стабильный доход",
      conversionRate: 7.5,
      isActive: true
    };
    
    this.offers.set(offer1.id, offer1);
    this.offers.set(offer2.id, offer2);
    this.offers.set(offer3.id, offer3);
    this.offers.set(offer4.id, offer4);
  }
  
  private seedLeads() {
    // Будем создавать лиды для демонстрации статистики
    const partners = Array.from(this.users.values()).filter(user => user.role === UserRole.PARTNER);
    const offerIds = Array.from(this.offers.keys());
    
    // Для каждого партнера создаем лиды по разным офферам
    for (const partner of partners) {
      for (const offerId of offerIds) {
        // Разное количество лидов для разных партнеров
        const leadCount = Math.floor(Math.random() * 200) + 50;
        
        for (let i = 0; i < leadCount; i++) {
          // Случайный статус с уклоном в сторону approved
          const randomStatus = Math.random();
          let status: string;
          
          if (randomStatus < 0.7) {
            status = LeadStatus.APPROVED;
          } else if (randomStatus < 0.9) {
            status = LeadStatus.REJECTED;
          } else {
            status = LeadStatus.PENDING;
          }
          
          const lead: Lead = {
            id: this.currentLeadId++,
            offerId,
            partnerId: partner.id,
            status,
            createdAt: new Date(Date.now() - Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000)),
            approvedAt: status === LeadStatus.APPROVED ? new Date() : null,
            rejectedAt: status === LeadStatus.REJECTED ? new Date() : null,
            rejectionReason: status === LeadStatus.REJECTED ? "Не соответствует требованиям" : null,
            payoutAmount: status === LeadStatus.APPROVED ? this.offers.get(offerId)?.paymentAmount || 0 : null,
            data: {},
            fraudFlags: Math.random() > 0.95 ? { suspicious: true, reason: "Подозрительная активность" } : null
          };
          
          this.leads.set(lead.id, lead);
        }
      }
    }
  }

  // Методы для работы с пользователями
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const avatarInitials = this.generateAvatarInitials(insertUser.fullName);
    const user: User = { 
      ...insertUser, 
      id, 
      avatarInitials,
      balance: 0,
      isActive: true,
      fraudScore: 0,
      trafficSources: insertUser.trafficSources || null
    };
    this.users.set(id, user);
    return user;
  }
  
  private generateAvatarInitials(fullName: string): string {
    const parts = fullName.split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return parts[0].substring(0, 2).toUpperCase();
  }
  
  async listUsers(role?: string): Promise<User[]> {
    const allUsers = Array.from(this.users.values());
    if (role) {
      return allUsers.filter(user => user.role === role);
    }
    return allUsers;
  }
  
  async updateUser(id: number, userData: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) {
      return undefined;
    }
    
    const updatedUser = { ...user, ...userData };
    this.users.set(id, updatedUser);
    return updatedUser;
  }
  
  // Методы для работы с офферами
  async getOffer(id: number): Promise<Offer | undefined> {
    return this.offers.get(id);
  }
  
  async createOffer(offer: InsertOffer): Promise<Offer> {
    const id = this.currentOfferId++;
    const newOffer: Offer = { 
      ...offer, 
      id, 
      conversionRate: 0, 
      requirements: offer.requirements || null,
      isActive: offer.isActive ?? true 
    };
    this.offers.set(id, newOffer);
    return newOffer;
  }
  
  async listOffers(filters?: {category?: string, advertiserId?: number, isActive?: boolean}): Promise<Offer[]> {
    let result = Array.from(this.offers.values());
    
    if (filters) {
      if (filters.category) {
        result = result.filter(offer => offer.category === filters.category);
      }
      
      if (filters.advertiserId) {
        result = result.filter(offer => offer.advertiserId === filters.advertiserId);
      }
      
      if (filters.isActive !== undefined) {
        result = result.filter(offer => offer.isActive === filters.isActive);
      }
    }
    
    return result;
  }
  
  async updateOffer(id: number, offerData: Partial<Offer>): Promise<Offer | undefined> {
    const offer = this.offers.get(id);
    if (!offer) {
      return undefined;
    }
    
    const updatedOffer = { ...offer, ...offerData };
    this.offers.set(id, updatedOffer);
    return updatedOffer;
  }
  
  // Методы для работы с лидами
  async getLead(id: number): Promise<Lead | undefined> {
    return this.leads.get(id);
  }
  
  async createLead(lead: InsertLead): Promise<Lead> {
    const id = this.currentLeadId++;
    const now = new Date();
    const newLead: Lead = { 
      ...lead, 
      id, 
      createdAt: now,
      approvedAt: null,
      rejectedAt: null,
      rejectionReason: null,
      data: lead.data || {},
      payoutAmount: null,
      fraudFlags: null
    };
    this.leads.set(id, newLead);
    return newLead;
  }
  
  async listLeads(filters?: {offerId?: number, partnerId?: number, status?: string}): Promise<Lead[]> {
    let result = Array.from(this.leads.values());
    
    if (filters) {
      if (filters.offerId) {
        result = result.filter(lead => lead.offerId === filters.offerId);
      }
      
      if (filters.partnerId) {
        result = result.filter(lead => lead.partnerId === filters.partnerId);
      }
      
      if (filters.status) {
        result = result.filter(lead => lead.status === filters.status);
      }
    }
    
    return result;
  }
  
  async updateLeadStatus(id: number, status: string, reason?: string): Promise<Lead | undefined> {
    const lead = this.leads.get(id);
    if (!lead) {
      return undefined;
    }
    
    const now = new Date();
    const updatedLead: Lead = { 
      ...lead, 
      status,
      approvedAt: status === LeadStatus.APPROVED ? now : lead.approvedAt,
      rejectedAt: status === LeadStatus.REJECTED ? now : lead.rejectedAt,
      rejectionReason: status === LeadStatus.REJECTED ? (reason || lead.rejectionReason) : lead.rejectionReason,
      payoutAmount: status === LeadStatus.APPROVED ? (this.offers.get(lead.offerId)?.paymentAmount || 0) : lead.payoutAmount
    };
    
    this.leads.set(id, updatedLead);
    
    // Обновляем баланс партнера при подтверждении лида
    if (status === LeadStatus.APPROVED && updatedLead.payoutAmount) {
      const partner = this.users.get(lead.partnerId);
      if (partner) {
        partner.balance = (partner.balance || 0) + updatedLead.payoutAmount;
        this.users.set(partner.id, partner);
      }
    }
    
    return updatedLead;
  }
  
  // Методы для работы с платежами
  async getPayment(id: number): Promise<Payment | undefined> {
    return this.payments.get(id);
  }
  
  async createPayment(payment: InsertPayment): Promise<Payment> {
    const id = this.currentPaymentId++;
    const now = new Date();
    const newPayment: Payment = { 
      ...payment, 
      id, 
      createdAt: now,
      method: payment.method || null,
      details: payment.details || {},
      processedAt: null
    };
    this.payments.set(id, newPayment);
    
    // Обновляем баланс партнера при создании платежа
    const partner = this.users.get(payment.partnerId);
    if (partner) {
      partner.balance = Math.max(0, (partner.balance || 0) - payment.amount);
      this.users.set(partner.id, partner);
    }
    
    return newPayment;
  }
  
  async listPayments(partnerId?: number): Promise<Payment[]> {
    let result = Array.from(this.payments.values());
    
    if (partnerId) {
      result = result.filter(payment => payment.partnerId === partnerId);
    }
    
    return result;
  }
  
  async updatePaymentStatus(id: number, status: string): Promise<Payment | undefined> {
    const payment = this.payments.get(id);
    if (!payment) {
      return undefined;
    }
    
    const updatedPayment: Payment = { 
      ...payment, 
      status,
      processedAt: status === 'completed' ? new Date() : payment.processedAt
    };
    this.payments.set(id, updatedPayment);
    return updatedPayment;
  }
  
  // Методы для работы с мотивационными программами
  async getMotivationProgram(id: number): Promise<MotivationProgram | undefined> {
    return this.motivationPrograms.get(id);
  }
  
  async createMotivationProgram(program: InsertMotivationProgram): Promise<MotivationProgram> {
    const id = this.currentProgramId++;
    const newProgram: MotivationProgram = { 
      ...program, 
      id,
      isActive: program.isActive ?? true,
      targetLeads: program.targetLeads || null,
      bonusAmount: program.bonusAmount || null
    };
    this.motivationPrograms.set(id, newProgram);
    return newProgram;
  }
  
  async listMotivationPrograms(isActive?: boolean): Promise<MotivationProgram[]> {
    let result = Array.from(this.motivationPrograms.values());
    
    if (isActive !== undefined) {
      result = result.filter(program => program.isActive === isActive);
    }
    
    return result;
  }
  
  async updateMotivationProgram(id: number, programData: Partial<MotivationProgram>): Promise<MotivationProgram | undefined> {
    const program = this.motivationPrograms.get(id);
    if (!program) {
      return undefined;
    }
    
    const updatedProgram = { ...program, ...programData };
    this.motivationPrograms.set(id, updatedProgram);
    return updatedProgram;
  }
  
  // Методы для аналитики
  async getLeadStats(filters?: {startDate?: Date, endDate?: Date, partnerId?: number, offerId?: number}): Promise<{
    total: number,
    approved: number,
    rejected: number,
    pending: number,
    conversionRate: number
  }> {
    let filteredLeads = Array.from(this.leads.values());
    
    if (filters) {
      if (filters.startDate) {
        filteredLeads = filteredLeads.filter(lead => lead.createdAt >= filters.startDate!);
      }
      
      if (filters.endDate) {
        filteredLeads = filteredLeads.filter(lead => lead.createdAt <= filters.endDate!);
      }
      
      if (filters.partnerId) {
        filteredLeads = filteredLeads.filter(lead => lead.partnerId === filters.partnerId);
      }
      
      if (filters.offerId) {
        filteredLeads = filteredLeads.filter(lead => lead.offerId === filters.offerId);
      }
    }
    
    const total = filteredLeads.length;
    const approved = filteredLeads.filter(lead => lead.status === LeadStatus.APPROVED).length;
    const rejected = filteredLeads.filter(lead => lead.status === LeadStatus.REJECTED).length;
    const pending = filteredLeads.filter(lead => lead.status === LeadStatus.PENDING).length;
    const conversionRate = total > 0 ? (approved / total) * 100 : 0;
    
    return {
      total,
      approved,
      rejected,
      pending,
      conversionRate
    };
  }
  
  async getPartnerStats(partnerId: number): Promise<{
    totalLeads: number,
    approvedLeads: number,
    conversionRate: number,
    earnings: number
  }> {
    const partnerLeads = Array.from(this.leads.values()).filter(lead => lead.partnerId === partnerId);
    const totalLeads = partnerLeads.length;
    const approvedLeads = partnerLeads.filter(lead => lead.status === LeadStatus.APPROVED).length;
    const conversionRate = totalLeads > 0 ? (approvedLeads / totalLeads) * 100 : 0;
    const earnings = partnerLeads
      .filter(lead => lead.status === LeadStatus.APPROVED && lead.payoutAmount !== null)
      .reduce((sum, lead) => sum + (lead.payoutAmount || 0), 0);
    
    return {
      totalLeads,
      approvedLeads,
      conversionRate,
      earnings
    };
  }
  
  async getTopOffers(limit: number = 4): Promise<Array<Offer & {conversions: number, revenue: number, conversionRate: number}>> {
    const offersMap = new Map<number, {
      offer: Offer,
      conversions: number,
      totalLeads: number,
      revenue: number
    }>();
    
    // Собираем статистику по всем офферам
    for (const lead of this.leads.values()) {
      const offerId = lead.offerId;
      const offer = this.offers.get(offerId);
      
      if (!offer) continue;
      
      let offerStats = offersMap.get(offerId);
      if (!offerStats) {
        offerStats = {
          offer,
          conversions: 0,
          totalLeads: 0,
          revenue: 0
        };
        offersMap.set(offerId, offerStats);
      }
      
      offerStats.totalLeads++;
      
      if (lead.status === LeadStatus.APPROVED) {
        offerStats.conversions++;
        offerStats.revenue += lead.payoutAmount || 0;
      }
    }
    
    // Преобразуем в массив и сортируем по количеству конверсий
    const result = Array.from(offersMap.values())
      .map(stats => ({
        ...stats.offer,
        conversions: stats.conversions,
        revenue: stats.revenue,
        conversionRate: stats.totalLeads > 0 ? (stats.conversions / stats.totalLeads) * 100 : 0
      }))
      .sort((a, b) => b.conversions - a.conversions);
    
    return result.slice(0, limit);
  }
  
  async getTopPartners(limit: number = 4): Promise<Array<User & {leads: number, approvalRate: number, earnings: number}>> {
    const partnersMap = new Map<number, {
      partner: User,
      totalLeads: number,
      approvedLeads: number,
      earnings: number
    }>();
    
    // Собираем статистику по всем партнерам
    for (const lead of this.leads.values()) {
      const partnerId = lead.partnerId;
      const partner = this.users.get(partnerId);
      
      if (!partner || partner.role !== UserRole.PARTNER) continue;
      
      let partnerStats = partnersMap.get(partnerId);
      if (!partnerStats) {
        partnerStats = {
          partner,
          totalLeads: 0,
          approvedLeads: 0,
          earnings: 0
        };
        partnersMap.set(partnerId, partnerStats);
      }
      
      partnerStats.totalLeads++;
      
      if (lead.status === LeadStatus.APPROVED) {
        partnerStats.approvedLeads++;
        partnerStats.earnings += lead.payoutAmount || 0;
      }
    }
    
    // Преобразуем в массив и сортируем по заработку
    const result = Array.from(partnersMap.values())
      .map(stats => ({
        ...stats.partner,
        leads: stats.totalLeads,
        approvalRate: stats.totalLeads > 0 ? (stats.approvedLeads / stats.totalLeads) * 100 : 0,
        earnings: stats.earnings
      }))
      .sort((a, b) => b.earnings - a.earnings);
    
    return result.slice(0, limit);
  }
  
  async getFraudMetrics(): Promise<{
    overallFraudRate: number,
    suspiciousPartners: number,
    flaggedLeads: number
  }> {
    const allLeads = Array.from(this.leads.values());
    const flaggedLeads = allLeads.filter(lead => lead.fraudFlags !== null).length;
    
    const suspiciousPartners = Array.from(this.users.values())
      .filter(user => user.role === UserRole.PARTNER && user.fraudScore > 0.7)
      .length;
    
    return {
      overallFraudRate: allLeads.length > 0 ? (flaggedLeads / allLeads.length) * 100 : 0,
      suspiciousPartners,
      flaggedLeads
    };
  }
}

export const storage = new MemStorage();
