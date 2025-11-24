/**
 * Relationship Tracker
 * Manages people and contact events
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Person, ContactEvent } from '../types/relationship.types';
import { TOP_PEOPLE_LIMIT } from '../constants/relationship.constants';

export class RelationshipTracker {
  public async createPerson(person: Omit<Person, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<Person> {
    const newPerson: Person = {
      ...person,
      id: `person_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId: await this.getUserId(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await this.savePerson(newPerson);
    return newPerson;
  }

  public async updatePerson(personId: string, updates: Partial<Person>): Promise<Person> {
    const person = await this.getPerson(personId);
    if (!person) {
      throw new Error('Person not found');
    }

    Object.assign(person, updates, { updatedAt: new Date() });
    await this.savePerson(person);
    return person;
  }

  public async getPerson(personId: string): Promise<Person | null> {
    try {
      const peopleJson = await AsyncStorage.getItem('lifeos_people');
      if (!peopleJson) return null;

      const people: Person[] = JSON.parse(peopleJson);
      return people.find((p) => p.id === personId) || null;
    } catch (error) {
      console.error('Error getting person:', error);
      return null;
    }
  }

  public async getAllPeople(): Promise<Person[]> {
    try {
      const peopleJson = await AsyncStorage.getItem('lifeos_people');
      if (!peopleJson) return [];

      return JSON.parse(peopleJson);
    } catch (error) {
      console.error('Error getting people:', error);
      return [];
    }
  }

  public async getTopPeople(): Promise<Person[]> {
    const people = await this.getAllPeople();
    return people.filter((p) => p.isTopPerson).slice(0, TOP_PEOPLE_LIMIT);
  }

  public async setTopPerson(personId: string, isTop: boolean): Promise<void> {
    const person = await this.getPerson(personId);
    if (!person) return;

    if (isTop) {
      const topPeople = await this.getTopPeople();
      if (topPeople.length >= TOP_PEOPLE_LIMIT && !person.isTopPerson) {
        throw new Error(`You can only have ${TOP_PEOPLE_LIMIT} top people`);
      }
    }

    person.isTopPerson = isTop;
    person.updatedAt = new Date();
    await this.savePerson(person);
  }

  public async deletePerson(personId: string): Promise<void> {
    try {
      const peopleJson = await AsyncStorage.getItem('lifeos_people');
      if (!peopleJson) return;

      const people: Person[] = JSON.parse(peopleJson);
      const filtered = people.filter((p) => p.id !== personId);

      await AsyncStorage.setItem('lifeos_people', JSON.stringify(filtered));
    } catch (error) {
      console.error('Error deleting person:', error);
    }
  }

  public async logContact(
    contact: Omit<ContactEvent, 'id' | 'userId' | 'createdAt'>
  ): Promise<ContactEvent> {
    const newContact: ContactEvent = {
      ...contact,
      id: `contact_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId: await this.getUserId(),
      createdAt: new Date(),
    };

    await this.saveContact(newContact);
    return newContact;
  }

  public async getContactsForPerson(personId: string): Promise<ContactEvent[]> {
    try {
      const contactsJson = await AsyncStorage.getItem('lifeos_contacts');
      if (!contactsJson) return [];

      const contacts: ContactEvent[] = JSON.parse(contactsJson);
      return contacts
        .filter((c) => c.personId === personId)
        .sort((a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime());
    } catch (error) {
      console.error('Error getting contacts:', error);
      return [];
    }
  }

  public async getLastContact(personId: string): Promise<ContactEvent | null> {
    const contacts = await this.getContactsForPerson(personId);
    return contacts[0] || null;
  }

  public async getDaysSinceLastContact(personId: string): Promise<number> {
    const lastContact = await this.getLastContact(personId);
    if (!lastContact) return 999;

    const now = new Date();
    const lastContactDate = new Date(lastContact.occurredAt);
    const diffMs = now.getTime() - lastContactDate.getTime();
    return Math.floor(diffMs / (1000 * 60 * 60 * 24));
  }

  private async savePerson(person: Person): Promise<void> {
    try {
      const peopleJson = await AsyncStorage.getItem('lifeos_people');
      const people: Person[] = peopleJson ? JSON.parse(peopleJson) : [];

      const index = people.findIndex((p) => p.id === person.id);
      if (index >= 0) {
        people[index] = person;
      } else {
        people.push(person);
      }

      await AsyncStorage.setItem('lifeos_people', JSON.stringify(people));
    } catch (error) {
      console.error('Error saving person:', error);
    }
  }

  private async saveContact(contact: ContactEvent): Promise<void> {
    try {
      const contactsJson = await AsyncStorage.getItem('lifeos_contacts');
      const contacts: ContactEvent[] = contactsJson ? JSON.parse(contactsJson) : [];

      contacts.push(contact);

      if (contacts.length > 1000) {
        contacts.splice(0, contacts.length - 1000);
      }

      await AsyncStorage.setItem('lifeos_contacts', JSON.stringify(contacts));
    } catch (error) {
      console.error('Error saving contact:', error);
    }
  }

  private async getUserId(): Promise<string> {
    try {
      const userId = await AsyncStorage.getItem('timeline_user_id');
      return userId || 'anonymous';
    } catch {
      return 'anonymous';
    }
  }
}

export const relationshipTracker = new RelationshipTracker();
