
export interface DataPoint {
  id: string;
  objectiveId: string; // Renamed from goalId to reflect hierarchy
  date: string; // ISO string
  value: number;
  secondaryValue?: number; // e.g., Number of errors
  notes?: string;
  recordedBy: string; 
}

// The Parent Container
export interface Goal {
  id: string;
  studentId: string;
  category: string; // e.g., "Reading", "Math", "Behavioral"
  description: string; // The main broad IEP goal text
  presentLevel: string; // Present Levels of Academic Achievement and Functional Performance
  createdAt: string;
  reportObservation?: string; // Teacher's specific observations for this goal in the report
}

// The Measurable Child Item (formerly called Goal)
export interface Objective {
  id: string;
  goalId: string; // Link to Parent Goal
  title: string;
  description: string; // Specific objective text
  unit: string; // e.g., "% accuracy", "trials", "minutes"
  targetValue: number;
  targetComparator: '>=' | '<='; // "At least" or "At most"
  
  // Secondary Metric Config (New)
  hasSecondaryMetric?: boolean;
  secondaryMetricName?: string; // e.g. "Errors"
  
  baselineValue: number;
  masteryCriteria?: string; // e.g. "4 out of 5 consecutive trials"
  allowableVariance?: number; // e.g. 5 (meaning Target +/- 5)
  startDate: string;
  endDate: string;
}

export interface Student {
  id: string;
  name: string;
  grade: string;
  teacher: string;
  reportSummary?: string; // General teacher comments for the report
}

export interface AppState {
  students: Student[];
  goals: Goal[];         // Parents
  objectives: Objective[]; // Children
  dataPoints: DataPoint[];
}

export type ViewState = 'DASHBOARD' | 'STUDENT_DETAIL' | 'REPORT_GENERATOR' | 'SETTINGS';

export interface ViewContext {
  view: ViewState;
  activeStudentId?: string;
}
