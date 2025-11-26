/**
 * Emergency Contact Manager
 * Contact storage, quick-dial, auto-notify
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { EmergencyContact } from '../types/crisis.types';
import { Linking } from 'react-native';

export class EmergencyContactManager {
  private readonly CONTACTS_KEY = '@crisis_emergency_contacts';

  public async getContacts(): Promise<EmergencyContact[]> {
    const data = await AsyncStorage.getItem(this.CONTACTS_KEY);
    if (!data) return [];
    return JSON.parse(data);
  }

  public async addContact(contact: Omit<EmergencyContact, 'id'>): Promise<void> {
    const contacts = await this.getContacts();
    const newContact: EmergencyContact = {
      ...contact,
      id: `contact_${Date.now()}`,
    };
    contacts.push(newContact);
    await AsyncStorage.setItem(this.CONTACTS_KEY, JSON.stringify(contacts));
  }

  public async updateContact(id: string, updates: Partial<EmergencyContact>): Promise<void> {
    const contacts = await this.getContacts();
    const index = contacts.findIndex((c) => c.id === id);
    if (index >= 0) {
      contacts[index] = { ...contacts[index], ...updates };
      await AsyncStorage.setItem(this.CONTACTS_KEY, JSON.stringify(contacts));
    }
  }

  public async deleteContact(id: string): Promise<void> {
    const contacts = await this.getContacts();
    const filtered = contacts.filter((c) => c.id !== id);
    await AsyncStorage.setItem(this.CONTACTS_KEY, JSON.stringify(filtered));
  }

  public async callContact(phone: string): Promise<void> {
    const url = `tel:${phone}`;
    const canOpen = await Linking.canOpenURL(url);
    if (canOpen) {
      await Linking.openURL(url);
    }
  }

  public async textContact(phone: string, message?: string): Promise<void> {
    const url = message ? `sms:${phone}?body=${encodeURIComponent(message)}` : `sms:${phone}`;
    const canOpen = await Linking.canOpenURL(url);
    if (canOpen) {
      await Linking.openURL(url);
    }
  }

  public async notifyEmergencyContacts(message: string): Promise<void> {
    const contacts = await this.getContacts();
    const autoNotifyContacts = contacts.filter((c) => c.autoNotify);

    for (const contact of autoNotifyContacts) {
      await this.textContact(contact.phone, message);
    }
  }

  public async getAutoNotifyContacts(): Promise<EmergencyContact[]> {
    const contacts = await this.getContacts();
    return contacts.filter((c) => c.autoNotify).sort((a, b) => a.priority - b.priority);
  }
}
