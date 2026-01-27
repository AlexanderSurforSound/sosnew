/**
 * BeaconOS Core
 *
 * The main orchestrator for all OS modules and services.
 * Named for the lighthouses of the Outer Banks that guide travelers safely to shore.
 */

import { BeaconConfig, BeaconConfigSchema, BeaconContext, BeaconEvent, BeaconEventType } from './types';
import { EventBus } from '../utils/events';
import { QueueManager } from '../utils/queue';
import { PricingEngine } from '../modules/pricing/engine';
import { MessagingHub } from '../modules/messaging/hub';
import { OperationsManager } from '../modules/operations/manager';
import { AnalyticsEngine } from '../modules/analytics/engine';
import { IntegrationHub } from '../modules/integrations/hub';

export class BeaconOS {
  private config: BeaconConfig;
  private eventBus: EventBus;
  private queueManager: QueueManager | null = null;

  // Core modules
  public pricing: PricingEngine;
  public messaging: MessagingHub;
  public operations: OperationsManager;
  public analytics: AnalyticsEngine;
  public integrations: IntegrationHub;

  private initialized = false;
  private startTime = Date.now();

  constructor(config: BeaconConfig) {
    // Validate config
    this.config = BeaconConfigSchema.parse(config);

    // Initialize event bus
    this.eventBus = new EventBus();

    // Initialize modules
    this.integrations = new IntegrationHub(this.config, this.eventBus);
    this.pricing = new PricingEngine(this.config, this.eventBus, this.integrations);
    this.messaging = new MessagingHub(this.config, this.eventBus, this.integrations);
    this.operations = new OperationsManager(this.config, this.eventBus, this.integrations);
    this.analytics = new AnalyticsEngine(this.config, this.eventBus, this.integrations);
  }

  /**
   * Initialize BeaconOS and all modules
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    console.log('[BeaconOS] Initializing BeaconOS...');
    console.log('[BeaconOS] 🏠 The lighthouse is lighting up...');

    // Initialize Redis queue if configured
    if (this.config.database.redis) {
      this.queueManager = new QueueManager(this.config.database.redis);
      await this.queueManager.initialize();
    }

    // Initialize all modules
    await this.integrations.initialize();
    await this.pricing.initialize();
    await this.messaging.initialize();
    await this.operations.initialize();
    await this.analytics.initialize();

    // Register core event handlers
    this.registerCoreEventHandlers();

    this.initialized = true;
    console.log('[BeaconOS] BeaconOS initialized successfully');
    console.log('[BeaconOS] 🗼 Beacon is now guiding your operations');
  }

  /**
   * Shutdown BeaconOS gracefully
   */
  async shutdown(): Promise<void> {
    console.log('[BeaconOS] Shutting down BeaconOS...');

    await this.pricing.shutdown();
    await this.messaging.shutdown();
    await this.operations.shutdown();
    await this.analytics.shutdown();
    await this.integrations.shutdown();

    if (this.queueManager) {
      await this.queueManager.shutdown();
    }

    this.initialized = false;
    console.log('[BeaconOS] BeaconOS shutdown complete');
  }

  /**
   * Create a context for a request
   */
  createContext(overrides?: Partial<BeaconContext>): BeaconContext {
    return {
      config: this.config,
      timestamp: new Date(),
      requestId: crypto.randomUUID(),
      ...overrides,
    };
  }

  /**
   * Emit an event to the event bus
   */
  emit<T>(type: BeaconEventType, payload: T, source = 'beacon-os'): void {
    const event: BeaconEvent<T> = {
      id: crypto.randomUUID(),
      type,
      payload,
      timestamp: new Date(),
      source,
    };

    this.eventBus.emit(type, event);
    this.analytics.trackEvent(event);
  }

  /**
   * Subscribe to events
   */
  on<T>(type: BeaconEventType, handler: (event: BeaconEvent<T>) => void | Promise<void>): () => void {
    return this.eventBus.on(type, handler);
  }

  /**
   * Queue a job for background processing
   */
  async queueJob(
    queue: string,
    job: { name: string; data: unknown },
    options?: { delay?: number; priority?: number }
  ): Promise<string | null> {
    if (!this.queueManager) {
      console.warn('[BeaconOS] Queue manager not initialized, running job synchronously');
      return null;
    }

    return this.queueManager.add(queue, job.name, job.data, options);
  }

  /**
   * Register core event handlers for cross-module orchestration
   */
  private registerCoreEventHandlers(): void {
    // When a reservation is created, trigger multiple actions
    this.on('reservation.created', async (event) => {
      const reservation = event.payload as { id: string; propertyId: string; guestId: string };

      // Send confirmation message
      await this.messaging.sendReservationConfirmation(reservation.id);

      // Schedule housekeeping
      await this.operations.schedulePreArrivalHousekeeping(reservation.id);

      // Update pricing for similar dates
      await this.pricing.recalculateSurroundingDates(reservation.propertyId);
    });

    // When check-in happens
    this.on('reservation.checkin', async (event) => {
      const reservation = event.payload as { id: string; guestId: string };

      // Send welcome message with house info
      await this.messaging.sendWelcomeMessage(reservation.id);

      // Award loyalty points
      await this.analytics.trackStayStart(reservation.id);
    });

    // When check-out happens
    this.on('reservation.checkout', async (event) => {
      const reservation = event.payload as { id: string; propertyId: string; guestId: string };

      // Schedule post-checkout housekeeping
      await this.operations.schedulePostCheckoutHousekeeping(reservation.id);

      // Request review
      await this.messaging.scheduleReviewRequest(reservation.id);

      // Calculate loyalty points
      await this.analytics.trackStayComplete(reservation.id);
    });

    // When housekeeping is completed
    this.on('housekeeping.completed', async (event) => {
      const task = event.payload as { propertyId: string; type: string };

      // Update property status
      await this.operations.updatePropertyStatus(task.propertyId, 'ready');

      // If pre-arrival cleaning, notify guest
      if (task.type === 'pre_arrival') {
        await this.messaging.sendPropertyReadyNotification(task.propertyId);
      }
    });

    // When maintenance is requested
    this.on('maintenance.requested', async (event) => {
      const request = event.payload as { propertyId: string; issue: string; priority: string };

      // Notify operations team
      await this.operations.notifyMaintenanceTeam(request);

      // If urgent and property is occupied, notify guest
      if (request.priority === 'urgent') {
        await this.messaging.sendMaintenanceNotification(request.propertyId, request.issue);
      }
    });
  }

  /**
   * Get system health status
   */
  async getHealth(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    modules: Record<string, boolean>;
    uptime: number;
    version: string;
  }> {
    const modules = {
      pricing: await this.pricing.healthCheck(),
      messaging: await this.messaging.healthCheck(),
      operations: await this.operations.healthCheck(),
      analytics: await this.analytics.healthCheck(),
      integrations: await this.integrations.healthCheck(),
    };

    const allHealthy = Object.values(modules).every((v) => v);
    const anyHealthy = Object.values(modules).some((v) => v);

    return {
      status: allHealthy ? 'healthy' : anyHealthy ? 'degraded' : 'unhealthy',
      modules,
      uptime: (Date.now() - this.startTime) / 1000,
      version: '1.0.0',
    };
  }
}

/**
 * Create and initialize a BeaconOS instance
 */
export async function createOS(config: BeaconConfig): Promise<BeaconOS> {
  const os = new BeaconOS(config);
  await os.initialize();
  return os;
}
