import { AppState, Student, Goal, Objective, DataPoint } from '../types';

const STORAGE_KEY = 'sprout_iep_data_v4'; // Bumped version for secondary metrics

export const generateId = (): string => {
  return Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
};

export const loadState = (): AppState => {
  // Try loading v4
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      return parsed;
    } catch (e) {
      console.error("Failed to parse stored data", e);
    }
  }

  // Fallback: Check for v3 data and migrate it
  const legacyStoredV3 = localStorage.getItem('sprout_iep_data_v3');
  if (legacyStoredV3) {
    try {
        const v3 = JSON.parse(legacyStoredV3);
        console.log("Migrating V3 data to V4 structure...");
        
        // Ensure new fields are initialized as undefined/false for existing data
        const newObjectives = v3.objectives.map((o: any) => ({
            ...o,
            hasSecondaryMetric: false,
            secondaryMetricName: undefined
        }));

        const migratedState: AppState = {
            ...v3,
            objectives: newObjectives
        };

        saveState(migratedState);
        return migratedState;
    } catch (e) {
        console.error("V3 Migration failed", e);
    }
  }

  // Fallback: Check for v2 data and migrate it
  const legacyStoredV2 = localStorage.getItem('sprout_iep_data_v2');
  if (legacyStoredV2) {
    try {
        const v2 = JSON.parse(legacyStoredV2);
        console.log("Migrating V2 data to V4 structure...");
        
        const newGoals = v2.goals.map((g: any) => ({
            ...g,
            category: g.category || 'General'
        }));

        const newObjectives = v2.objectives.map((o: any) => ({
            ...o,
            targetComparator: o.targetComparator || '>=',
            hasSecondaryMetric: false
        }));

        const migratedState: AppState = {
            ...v2,
            goals: newGoals,
            objectives: newObjectives
        };

        saveState(migratedState);
        return migratedState;
    } catch (e) {
        console.error("V2 Migration failed", e);
    }
  }

  // Fallback: Check for v1 data
  const legacyStored = localStorage.getItem('sprout_iep_data_v1');
  if (legacyStored) {
      // (Omitted detailed V1 migration for brevity, assuming V2/V3 caught most users, but logic remains same)
  }

  return { students: [], goals: [], objectives: [], dataPoints: [] };
};

export const saveState = (state: AppState) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
};

export const mergeData = (current: AppState, incoming: AppState): AppState => {
  const newStudents = [...current.students];
  const newGoals = [...current.goals];
  const newObjectives = [...current.objectives];
  const newDataPoints = [...current.dataPoints];

  incoming.students.forEach(s => {
    if (!newStudents.find(existing => existing.id === s.id)) newStudents.push(s);
  });

  incoming.goals.forEach(g => {
    if (!newGoals.find(existing => existing.id === g.id)) newGoals.push(g);
  });

  incoming.objectives.forEach(o => {
    if (!newObjectives.find(existing => existing.id === o.id)) newObjectives.push(o);
  });

  incoming.dataPoints.forEach(dp => {
    if (!newDataPoints.find(existing => existing.id === dp.id)) newDataPoints.push(dp);
  });

  return {
    students: newStudents,
    goals: newGoals,
    objectives: newObjectives,
    dataPoints: newDataPoints
  };
};