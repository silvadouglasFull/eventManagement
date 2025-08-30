// src/core/EventEmitter.ts
import { Logger } from './Logger';

type EventListener<T> = (data: T) => void;

export class EventEmitter {
    private listeners: Map<string, EventListener<any>[]> = new Map();

    public emit<T>(eventName: string, data: T): void {
        const eventListeners = this.listeners.get(eventName);
        if (eventListeners) {
            Logger.info('EventEmitter', `Emitting event: ${eventName}`);
            eventListeners.forEach(listener => {
                try {
                    listener(data);
                } catch (error) {
                    Logger.error('EventEmitter', `Error processing event ${eventName}`, error);
                }
            });
        }
    }

    public on<T>(eventName: string, listener: EventListener<T>): void {
        if (!this.listeners.has(eventName)) {
            this.listeners.set(eventName, []);
        }
        this.listeners.get(eventName)?.push(listener);
        Logger.info('EventEmitter', `Subscribed to event: ${eventName}`);
    }
}