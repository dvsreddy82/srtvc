/**
 * Vaccine Schedule Service
 * Calculates vaccine due dates locally from pet data
 */

import { vaccineRepository } from '../repositories/vaccineRepository';
import { Vaccine, VaccineScheduleItem, VaccineSchedule, VACCINE_INTERVALS, DEFAULT_VACCINE_SCHEDULES } from '../models/vaccine';
import type { Pet } from '../models/pet';

export class VaccineScheduleService {
  /**
   * Get vaccine schedule for a pet (local-first calculation)
   */
  async getVaccineSchedule(pet: Pet): Promise<VaccineSchedule> {
    // Get vaccines from local storage (no cloud read)
    const vaccines = await vaccineRepository.getVaccines(pet.id);

    // Calculate schedule items
    const scheduleItems: VaccineScheduleItem[] = [];

    // Get default vaccines for pet's species
    const defaultVaccines = DEFAULT_VACCINE_SCHEDULES[pet.species] || [];

    // Process each default vaccine type
    for (const vaccineType of defaultVaccines) {
      // Find most recent vaccine of this type
      const recentVaccine = vaccines
        .filter((v) => v.type === vaccineType)
        .sort((a, b) => b.administeredDate - a.administeredDate)[0];

      let lastAdministeredDate: number | null = null;
      let nextDueDate: number | null = null;
      let daysUntilDue: number | null = null;
      let isOverdue = false;
      let isDueSoon = false;

      if (recentVaccine) {
        lastAdministeredDate = recentVaccine.administeredDate;
        nextDueDate = recentVaccine.nextDueDate;
      } else {
        // No vaccine record - calculate based on pet's date of birth or first vaccine due
        const interval = VACCINE_INTERVALS[vaccineType] || 365;
        const petDOB = pet.dateOfBirth || Date.now();
        
        // First vaccine due at 6-8 weeks old
        const firstVaccineAge = 6 * 7 * 24 * 60 * 60 * 1000; // 6 weeks in milliseconds
        nextDueDate = petDOB + firstVaccineAge;
      }

      if (nextDueDate) {
        const now = Date.now();
        daysUntilDue = Math.ceil((nextDueDate - now) / (24 * 60 * 60 * 1000));
        isOverdue = daysUntilDue < 0;
        isDueSoon = daysUntilDue >= 0 && daysUntilDue <= 7;
      }

      scheduleItems.push({
        vaccineType,
        lastAdministeredDate,
        nextDueDate,
        daysUntilDue,
        isOverdue,
        isDueSoon,
      });
    }

    // Add any additional vaccines that aren't in default schedule
    for (const vaccine of vaccines) {
      if (!defaultVaccines.includes(vaccine.type)) {
        const now = Date.now();
        const daysUntilDue = Math.ceil((vaccine.nextDueDate - now) / (24 * 60 * 60 * 1000));
        const isOverdue = daysUntilDue < 0;
        const isDueSoon = daysUntilDue >= 0 && daysUntilDue <= 7;

        scheduleItems.push({
          vaccineType: vaccine.type,
          lastAdministeredDate: vaccine.administeredDate,
          nextDueDate: vaccine.nextDueDate,
          daysUntilDue,
          isOverdue,
          isDueSoon,
        });
      }
    }

    // Sort by next due date (overdue first, then due soon, then upcoming)
    scheduleItems.sort((a, b) => {
      if (a.isOverdue && !b.isOverdue) return -1;
      if (!a.isOverdue && b.isOverdue) return 1;
      if (a.isDueSoon && !b.isDueSoon) return -1;
      if (!a.isDueSoon && b.isDueSoon) return 1;
      return (a.nextDueDate || 0) - (b.nextDueDate || 0);
    });

    return {
      petId: pet.id,
      petName: pet.name,
      vaccines: scheduleItems,
      lastSyncDate: Date.now(),
    };
  }

  /**
   * Get vaccines due in next 7 days (for reminders)
   */
  async getVaccinesDueSoon(petId: string): Promise<Vaccine[]> {
    const vaccines = await vaccineRepository.getVaccines(petId);
    const now = Date.now();
    const sevenDaysFromNow = now + 7 * 24 * 60 * 60 * 1000;

    return vaccines.filter((vaccine) => {
      return vaccine.nextDueDate >= now && vaccine.nextDueDate <= sevenDaysFromNow;
    });
  }

  /**
   * Get overdue vaccines
   */
  async getOverdueVaccines(petId: string): Promise<Vaccine[]> {
    const vaccines = await vaccineRepository.getVaccines(petId);
    const now = Date.now();

    return vaccines.filter((vaccine) => vaccine.nextDueDate < now);
  }
}

// Export singleton instance
export const vaccineScheduleService = new VaccineScheduleService();

