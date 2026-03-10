'use client';

/**
 * @fileOverview A simple event-based service to trigger mock system notifications.
 */

export type NotificationType = 'sms' | 'call';

export interface ScamNotification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  phoneNumber: string;
  scamType: string;
}

type NotificationHandler = (notification: ScamNotification) => void;

class NotificationService {
  private listeners: NotificationHandler[] = [];

  subscribe(handler: NotificationHandler) {
    this.listeners.push(handler);
    return () => {
      this.listeners = this.listeners.filter(h => h !== handler);
    };
  }

  notify(notification: ScamNotification) {
    this.listeners.forEach(handler => handler(notification));
  }

  simulateScam(type: NotificationType) {
    const notification: ScamNotification = {
      id: Math.random().toString(36).substring(7),
      type,
      title: 'Possible scam detected',
      body: type === 'sms' 
        ? 'Suspicious message from +351 931 112 233' 
        : 'Incoming call from +351 912 345 678',
      phoneNumber: type === 'sms' ? '+351 931 112 233' : '+351 912 345 678',
      scamType: type === 'sms' ? 'Phishing Bancário' : 'Falsa Identidade',
    };
    this.notify(notification);
  }
}

export const notificationService = new NotificationService();
