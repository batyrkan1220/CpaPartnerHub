import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import session from "express-session";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import MemoryStore from "memorystore";
import { UserRole, insertUserSchema, insertOfferSchema, insertLeadSchema, insertPaymentSchema, insertMotivationProgramSchema } from "@shared/schema";
import { z } from "zod";
import { fromZodError } from "zod-validation-error";

// Настройка сессий и аутентификации
const configureAuth = (app: Express) => {
  const MemoryStoreSession = MemoryStore(session);
  
  app.use(session({
    secret: process.env.SESSION_SECRET || "cpa-platform-secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000, // 24 часа
    },
    store: new MemoryStoreSession({
      checkPeriod: 86400000 // 24 часа
    }),
  }));
  
  app.use(passport.initialize());
  app.use(passport.session());
  
  // Стратегия локальной аутентификации
  passport.use(new LocalStrategy(async (username, password, done) => {
    try {
      const user = await storage.getUserByUsername(username);
      
      if (!user) {
        return done(null, false, { message: "Неверное имя пользователя" });
      }
      
      if (user.password !== password) { // В реальном приложении здесь должна быть проверка хеша пароля
        return done(null, false, { message: "Неверный пароль" });
      }
      
      return done(null, user);
    } catch (error) {
      return done(error);
    }
  }));
  
  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });
  
  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });
};

// Middleware для проверки аутентификации
const isAuthenticated = (req: Request, res: Response, next: any) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: "Необходима аутентификация" });
};

// Middleware для проверки роли пользователя
const hasRole = (role: string | string[]) => {
  return (req: Request, res: Response, next: any) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Необходима аутентификация" });
    }
    
    const user = req.user as any;
    
    if (Array.isArray(role)) {
      if (!role.includes(user.role)) {
        return res.status(403).json({ message: "Доступ запрещен" });
      }
    } else {
      if (user.role !== role) {
        return res.status(403).json({ message: "Доступ запрещен" });
      }
    }
    
    next();
  };
};

// Основная функция для регистрации маршрутов
export async function registerRoutes(app: Express): Promise<Server> {
  // Настройка аутентификации
  configureAuth(app);
  
  // Маршруты аутентификации
  app.post("/api/auth/login", passport.authenticate("local"), (req, res) => {
    res.json({ user: req.user });
  });
  
  app.post("/api/auth/logout", (req, res) => {
    req.logout(() => {
      res.json({ success: true });
    });
  });
  
  app.get("/api/auth/me", isAuthenticated, (req, res) => {
    res.json({ user: req.user });
  });
  
  // Маршруты для пользователей
  app.get("/api/users", isAuthenticated, hasRole(UserRole.ADMIN), async (req, res) => {
    const role = req.query.role as string | undefined;
    const users = await storage.listUsers(role);
    res.json(users);
  });
  
  app.post("/api/users", isAuthenticated, hasRole(UserRole.ADMIN), async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const newUser = await storage.createUser(userData);
      res.status(201).json(newUser);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: fromZodError(error).message });
      }
      res.status(500).json({ message: "Ошибка при создании пользователя" });
    }
  });
  
  app.get("/api/users/:id", isAuthenticated, async (req, res) => {
    const id = parseInt(req.params.id);
    const user = await storage.getUser(id);
    
    if (!user) {
      return res.status(404).json({ message: "Пользователь не найден" });
    }
    
    const currentUser = req.user as any;
    
    // Пользователи могут видеть только свой профиль, админы видят всех
    if (currentUser.role !== UserRole.ADMIN && currentUser.id !== id) {
      return res.status(403).json({ message: "Доступ запрещен" });
    }
    
    res.json(user);
  });
  
  app.patch("/api/users/:id", isAuthenticated, async (req, res) => {
    const id = parseInt(req.params.id);
    const currentUser = req.user as any;
    
    // Пользователи могут обновлять только свой профиль, админы могут обновлять всех
    if (currentUser.role !== UserRole.ADMIN && currentUser.id !== id) {
      return res.status(403).json({ message: "Доступ запрещен" });
    }
    
    try {
      const updatedUser = await storage.updateUser(id, req.body);
      
      if (!updatedUser) {
        return res.status(404).json({ message: "Пользователь не найден" });
      }
      
      res.json(updatedUser);
    } catch (error) {
      res.status(500).json({ message: "Ошибка при обновлении пользователя" });
    }
  });
  
  // Маршруты для офферов
  app.get("/api/offers", isAuthenticated, async (req, res) => {
    const filters: {
      category?: string,
      advertiserId?: number,
      isActive?: boolean
    } = {};
    
    if (req.query.category) {
      filters.category = req.query.category as string;
    }
    
    if (req.query.advertiserId) {
      filters.advertiserId = parseInt(req.query.advertiserId as string);
    }
    
    if (req.query.isActive !== undefined) {
      filters.isActive = req.query.isActive === "true";
    }
    
    const offers = await storage.listOffers(filters);
    res.json(offers);
  });
  
  app.post("/api/offers", isAuthenticated, hasRole([UserRole.ADMIN, UserRole.ADVERTISER]), async (req, res) => {
    try {
      const offerData = insertOfferSchema.parse(req.body);
      
      // Если оффер создает рекламодатель, устанавливаем его ID в поле advertiserId
      if ((req.user as any).role === UserRole.ADVERTISER) {
        offerData.advertiserId = (req.user as any).id;
      }
      
      const newOffer = await storage.createOffer(offerData);
      res.status(201).json(newOffer);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: fromZodError(error).message });
      }
      res.status(500).json({ message: "Ошибка при создании оффера" });
    }
  });
  
  app.get("/api/offers/:id", isAuthenticated, async (req, res) => {
    const id = parseInt(req.params.id);
    const offer = await storage.getOffer(id);
    
    if (!offer) {
      return res.status(404).json({ message: "Оффер не найден" });
    }
    
    res.json(offer);
  });
  
  app.patch("/api/offers/:id", isAuthenticated, async (req, res) => {
    const id = parseInt(req.params.id);
    const currentUser = req.user as any;
    const offer = await storage.getOffer(id);
    
    if (!offer) {
      return res.status(404).json({ message: "Оффер не найден" });
    }
    
    // Проверяем права доступа: админ может редактировать любой оффер,
    // рекламодатель - только свои
    if (currentUser.role === UserRole.ADVERTISER && offer.advertiserId !== currentUser.id) {
      return res.status(403).json({ message: "Доступ запрещен" });
    }
    
    if (currentUser.role === UserRole.PARTNER) {
      return res.status(403).json({ message: "Партнеры не могут редактировать офферы" });
    }
    
    try {
      const updatedOffer = await storage.updateOffer(id, req.body);
      res.json(updatedOffer);
    } catch (error) {
      res.status(500).json({ message: "Ошибка при обновлении оффера" });
    }
  });
  
  // Маршруты для лидов
  app.get("/api/leads", isAuthenticated, async (req, res) => {
    const currentUser = req.user as any;
    const filters: {
      offerId?: number,
      partnerId?: number,
      status?: string
    } = {};
    
    if (req.query.offerId) {
      filters.offerId = parseInt(req.query.offerId as string);
    }
    
    if (req.query.status) {
      filters.status = req.query.status as string;
    }
    
    // Для партнеров показываем только их лиды
    if (currentUser.role === UserRole.PARTNER) {
      filters.partnerId = currentUser.id;
    } 
    // Для рекламодателей показываем только лиды их офферов
    else if (currentUser.role === UserRole.ADVERTISER) {
      const advertiserOffers = await storage.listOffers({ advertiserId: currentUser.id });
      const offerIds = advertiserOffers.map(offer => offer.id);
      
      // Если у рекламодателя нет офферов, возвращаем пустой массив
      if (offerIds.length === 0) {
        return res.json([]);
      }
      
      // Получаем все лиды и фильтруем их по офферам рекламодателя
      const allLeads = await storage.listLeads(filters);
      const filteredLeads = allLeads.filter(lead => offerIds.includes(lead.offerId));
      return res.json(filteredLeads);
    } 
    // Для конкретного партнера (запрос от админа)
    else if (req.query.partnerId) {
      filters.partnerId = parseInt(req.query.partnerId as string);
    }
    
    const leads = await storage.listLeads(filters);
    res.json(leads);
  });
  
  app.post("/api/leads", isAuthenticated, hasRole(UserRole.PARTNER), async (req, res) => {
    try {
      const leadData = insertLeadSchema.parse(req.body);
      
      // Установка партнера, который создает лид
      leadData.partnerId = (req.user as any).id;
      
      // Проверяем, существует ли оффер
      const offer = await storage.getOffer(leadData.offerId);
      if (!offer) {
        return res.status(404).json({ message: "Оффер не найден" });
      }
      
      // Проверяем, активен ли оффер
      if (!offer.isActive) {
        return res.status(400).json({ message: "Оффер не активен" });
      }
      
      const newLead = await storage.createLead(leadData);
      res.status(201).json(newLead);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: fromZodError(error).message });
      }
      res.status(500).json({ message: "Ошибка при создании лида" });
    }
  });
  
  app.get("/api/leads/:id", isAuthenticated, async (req, res) => {
    const id = parseInt(req.params.id);
    const lead = await storage.getLead(id);
    
    if (!lead) {
      return res.status(404).json({ message: "Лид не найден" });
    }
    
    const currentUser = req.user as any;
    
    // Проверка прав доступа
    if (currentUser.role === UserRole.PARTNER && lead.partnerId !== currentUser.id) {
      return res.status(403).json({ message: "Доступ запрещен" });
    }
    
    if (currentUser.role === UserRole.ADVERTISER) {
      const offer = await storage.getOffer(lead.offerId);
      if (!offer || offer.advertiserId !== currentUser.id) {
        return res.status(403).json({ message: "Доступ запрещен" });
      }
    }
    
    res.json(lead);
  });
  
  app.patch("/api/leads/:id/status", isAuthenticated, hasRole([UserRole.ADMIN, UserRole.ADVERTISER]), async (req, res) => {
    const id = parseInt(req.params.id);
    const { status, reason } = req.body;
    
    if (!status) {
      return res.status(400).json({ message: "Необходимо указать статус" });
    }
    
    const lead = await storage.getLead(id);
    
    if (!lead) {
      return res.status(404).json({ message: "Лид не найден" });
    }
    
    // Если статус обновляет рекламодатель, проверяем, что лид принадлежит его офферу
    if ((req.user as any).role === UserRole.ADVERTISER) {
      const offer = await storage.getOffer(lead.offerId);
      if (!offer || offer.advertiserId !== (req.user as any).id) {
        return res.status(403).json({ message: "Доступ запрещен" });
      }
    }
    
    try {
      const updatedLead = await storage.updateLeadStatus(id, status, reason);
      res.json(updatedLead);
    } catch (error) {
      res.status(500).json({ message: "Ошибка при обновлении статуса лида" });
    }
  });
  
  // Маршруты для платежей
  app.get("/api/payments", isAuthenticated, async (req, res) => {
    const currentUser = req.user as any;
    let partnerId: number | undefined = undefined;
    
    // Партнеры видят только свои платежи
    if (currentUser.role === UserRole.PARTNER) {
      partnerId = currentUser.id;
    } 
    // Админы могут фильтровать по партнеру
    else if (currentUser.role === UserRole.ADMIN && req.query.partnerId) {
      partnerId = parseInt(req.query.partnerId as string);
    }
    
    const payments = await storage.listPayments(partnerId);
    res.json(payments);
  });
  
  app.post("/api/payments", isAuthenticated, hasRole(UserRole.PARTNER), async (req, res) => {
    try {
      const paymentData = insertPaymentSchema.parse(req.body);
      
      // Устанавливаем партнера, который запрашивает выплату
      paymentData.partnerId = (req.user as any).id;
      
      // Проверяем баланс партнера
      const partner = await storage.getUser(paymentData.partnerId);
      if (!partner) {
        return res.status(404).json({ message: "Партнер не найден" });
      }
      
      if ((partner.balance || 0) < paymentData.amount) {
        return res.status(400).json({ message: "Недостаточно средств на балансе" });
      }
      
      // Устанавливаем начальный статус "pending"
      paymentData.status = "pending";
      
      const newPayment = await storage.createPayment(paymentData);
      res.status(201).json(newPayment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: fromZodError(error).message });
      }
      res.status(500).json({ message: "Ошибка при создании запроса на выплату" });
    }
  });
  
  app.patch("/api/payments/:id/status", isAuthenticated, hasRole(UserRole.ADMIN), async (req, res) => {
    const id = parseInt(req.params.id);
    const { status } = req.body;
    
    if (!status) {
      return res.status(400).json({ message: "Необходимо указать статус" });
    }
    
    try {
      const updatedPayment = await storage.updatePaymentStatus(id, status);
      
      if (!updatedPayment) {
        return res.status(404).json({ message: "Платеж не найден" });
      }
      
      res.json(updatedPayment);
    } catch (error) {
      res.status(500).json({ message: "Ошибка при обновлении статуса платежа" });
    }
  });
  
  // Маршруты для мотивационных программ
  app.get("/api/motivation-programs", isAuthenticated, async (req, res) => {
    const isActive = req.query.isActive === "true" ? true : req.query.isActive === "false" ? false : undefined;
    const programs = await storage.listMotivationPrograms(isActive);
    res.json(programs);
  });
  
  app.post("/api/motivation-programs", isAuthenticated, hasRole(UserRole.ADMIN), async (req, res) => {
    try {
      const programData = insertMotivationProgramSchema.parse(req.body);
      const newProgram = await storage.createMotivationProgram(programData);
      res.status(201).json(newProgram);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: fromZodError(error).message });
      }
      res.status(500).json({ message: "Ошибка при создании мотивационной программы" });
    }
  });
  
  app.patch("/api/motivation-programs/:id", isAuthenticated, hasRole(UserRole.ADMIN), async (req, res) => {
    const id = parseInt(req.params.id);
    
    try {
      const updatedProgram = await storage.updateMotivationProgram(id, req.body);
      
      if (!updatedProgram) {
        return res.status(404).json({ message: "Мотивационная программа не найдена" });
      }
      
      res.json(updatedProgram);
    } catch (error) {
      res.status(500).json({ message: "Ошибка при обновлении мотивационной программы" });
    }
  });
  
  // Маршруты для аналитики
  app.get("/api/stats/leads", isAuthenticated, async (req, res) => {
    const filters: {
      startDate?: Date,
      endDate?: Date,
      partnerId?: number,
      offerId?: number
    } = {};
    
    if (req.query.startDate) {
      filters.startDate = new Date(req.query.startDate as string);
    }
    
    if (req.query.endDate) {
      filters.endDate = new Date(req.query.endDate as string);
    }
    
    if (req.query.partnerId) {
      filters.partnerId = parseInt(req.query.partnerId as string);
    }
    
    if (req.query.offerId) {
      filters.offerId = parseInt(req.query.offerId as string);
    }
    
    const stats = await storage.getLeadStats(filters);
    res.json(stats);
  });
  
  app.get("/api/stats/partners/:id", isAuthenticated, async (req, res) => {
    const id = parseInt(req.params.id);
    const currentUser = req.user as any;
    
    // Партнеры могут видеть только свою статистику
    if (currentUser.role === UserRole.PARTNER && currentUser.id !== id) {
      return res.status(403).json({ message: "Доступ запрещен" });
    }
    
    const stats = await storage.getPartnerStats(id);
    res.json(stats);
  });
  
  app.get("/api/stats/top-offers", isAuthenticated, async (req, res) => {
    const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
    const topOffers = await storage.getTopOffers(limit);
    res.json(topOffers);
  });
  
  app.get("/api/stats/top-partners", isAuthenticated, async (req, res) => {
    const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
    const topPartners = await storage.getTopPartners(limit);
    res.json(topPartners);
  });
  
  app.get("/api/stats/fraud", isAuthenticated, hasRole([UserRole.ADMIN]), async (req, res) => {
    const fraudMetrics = await storage.getFraudMetrics();
    res.json(fraudMetrics);
  });
  
  const httpServer = createServer(app);
  return httpServer;
}
