/**
 * Event Bus for BeaconOS
 *
 * Handles event publishing and subscription across all modules
 */

import { BeaconEvent, BeaconEventType } from '../core/types';

type EventHandler<T = unknown> = (event: BeaconEvent<T>) => void | Promise<void>;

export class EventBus {
  private handlers: Map<string, Set<EventHandler>> = new Map();
  private allHandlers: Set<EventHandler> = new Set();

  /**
   * Subscribe to a specific event type
   */
  on<T>(type: BeaconEventType, handler: EventHandler<T>): () => void {
    if (!this.handlers.has(type)) {
      this.handlers.set(type, new Set());
    }

    this.handlers.get(type)!.add(handler as EventHandler);

    // Return unsubscribe function
    return () => {
      this.handlers.get(type)?.delete(handler as EventHandler);
    };
  }

  /**
   * Subscribe to all events
   */
  onAll(handler: EventHandler): () => void {
    this.allHandlers.add(handler);

    return () => {
      this.allHandlers.delete(handler);
    };
  }

  /**
   * Emit an event to all subscribers
   */
  async emit<T>(type: BeaconEventType, event: BeaconEvent<T>): Promise<void> {
    const handlers = this.handlers.get(type) || new Set();
    const allPromises: Promise<void>[] = [];

    // Call type-specific handlers
    for (const handler of handlers) {
      try {
        const result = handler(event);
        if (result instanceof Promise) {
          allPromises.push(result);
        }
      } catch (error) {
        console.error(`[EventBus] Error in handler for ${type}:`, error);
      }
    }

    // Call wildcard handlers
    for (const handler of this.allHandlers) {
      try {
        const result = handler(event);
        if (result instanceof Promise) {
          allPromises.push(result);
        }
      } catch (error) {
        console.error(`[EventBus] Error in wildcard handler:`, error);
      }
    }

    // Wait for all async handlers
    await Promise.allSettled(allPromises);
  }

  /**
   * Subscribe to an event once
   */
  once<T>(type: BeaconEventType, handler: EventHandler<T>): () => void {
    const wrappedHandler: EventHandler<T> = (event) => {
      unsubscribe();
      return handler(event);
    };

    const unsubscribe = this.on(type, wrappedHandler);
    return unsubscribe;
  }

  /**
   * Wait for a specific event
   */
  waitFor<T>(
    type: BeaconEventType,
    predicate?: (event: BeaconEvent<T>) => boolean,
    timeout = 30000
  ): Promise<BeaconEvent<T>> {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        unsubscribe();
        reject(new Error(`Timeout waiting for event: ${type}`));
      }, timeout);

      const unsubscribe = this.on<T>(type, (event) => {
        if (!predicate || predicate(event)) {
          clearTimeout(timer);
          unsubscribe();
          resolve(event);
        }
      });
    });
  }

  /**
   * Get the number of handlers for a specific event type
   */
  listenerCount(type: BeaconEventType): number {
    return (this.handlers.get(type)?.size || 0) + this.allHandlers.size;
  }

  /**
   * Remove all handlers for a specific event type
   */
  removeAllListeners(type?: BeaconEventType): void {
    if (type) {
      this.handlers.delete(type);
    } else {
      this.handlers.clear();
      this.allHandlers.clear();
    }
  }
}
