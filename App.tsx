import React, { useState, useEffect } from 'react';
import { AppState, ViewState, Student, Goal, Objective, DataPoint } from './types';
import { loadState, saveState, mergeData } from './services/storage';
import Navigation from './components/Navigation';
import StudentList from './components/StudentList';
import GoalTracker from './components/GoalTracker';
import Settings from './components/Settings';
import ConfirmModal from './components/ConfirmModal';

const App: React.FC = () => {
  // State
  const [data, setData] = useState<AppState>({ students: [], goals: [], objectives: [], dataPoints: [] });
  const [view, setView] = useState<ViewState>('DASHBOARD');
  const [activeStudentId, setActiveStudentId] = useState<string | null>(null);

  // Modal State
  const [modalConfig, setModalConfig] = useState<{isOpen: boolean, message: string, onConfirm: () => void} | null>(null);

  // Load initial data
  useEffect(() => {
    const loaded = loadState();
    setData(loaded);
  }, []);

  // Persistence effect
  useEffect(() => {
    saveState(data);
  }, [data]);

  // Helper to trigger confirmation
  const triggerConfirm = (message: string, action: () => void) => {
    setModalConfig({
        isOpen: true,
        message,
        onConfirm: () => {
            action();
            setModalConfig(null);
        }
    });
  };

  // Actions
  const handleAddStudent = (student: Student) => {
    setData(prev => ({ ...prev, students: [...prev.students, student] }));
  };

  const handleDeleteStudent = (id: string) => {
    triggerConfirm(
        "This will permanently remove the student and ALL their goals and data. This cannot be undone.",
        () => {
            setData(prev => {
                const goalIdsToDelete = prev.goals.filter(g => g.studentId === id).map(g => g.id);
                const objectiveIdsToDelete = prev.objectives.filter(o => goalIdsToDelete.includes(o.goalId)).map(o => o.id);
                
                return {
                    students: prev.students.filter(s => s.id !== id),
                    goals: prev.goals.filter(g => g.studentId !== id),
                    objectives: prev.objectives.filter(o => !goalIdsToDelete.includes(o.goalId)),
                    dataPoints: prev.dataPoints.filter(dp => !objectiveIdsToDelete.includes(dp.objectiveId))
                };
            });
            if (activeStudentId === id) {
                setView('DASHBOARD');
                setActiveStudentId(null);
            }
        }
    );
  };

  const handleSelectStudent = (id: string) => {
    setActiveStudentId(id);
    setView('STUDENT_DETAIL');
  };

  // --- Goal (Parent) Actions ---
  const handleAddGoal = (goal: Goal) => {
    setData(prev => ({ ...prev, goals: [...prev.goals, goal] }));
  };

  const handleDeleteGoal = (id: string) => {
      triggerConfirm(
          "Delete this IEP Goal? This will remove all objectives and data points associated with it.",
          () => {
            setData(prev => {
                const objectiveIdsToDelete = prev.objectives.filter(o => o.goalId === id).map(o => o.id);
                return {
                    ...prev,
                    goals: prev.goals.filter(g => g.id !== id),
                    objectives: prev.objectives.filter(o => o.goalId !== id),
                    dataPoints: prev.dataPoints.filter(dp => !objectiveIdsToDelete.includes(dp.objectiveId))
                };
            });
          }
      );
  };

  // --- Objective (Child) Actions ---
  const handleAddObjective = (obj: Objective) => {
    setData(prev => ({ ...prev, objectives: [...prev.objectives, obj] }));
  };

  const handleUpdateObjective = (updatedObj: Objective) => {
    setData(prev => ({
      ...prev,
      objectives: prev.objectives.map(o => o.id === updatedObj.id ? updatedObj : o)
    }));
  };

  const handleDeleteObjective = (id: string) => {
    triggerConfirm(
        "Delete this objective? This will remove all associated data points.",
        () => {
            setData(prev => ({
                ...prev,
                objectives: prev.objectives.filter(o => o.id !== id),
                dataPoints: prev.dataPoints.filter(dp => dp.objectiveId !== id)
            }));
        }
    );
  };

  // --- Data Point Actions ---
  const handleAddDataPoint = (dp: DataPoint) => {
    setData(prev => ({ ...prev, dataPoints: [...prev.dataPoints, dp] }));
  };

  const handleDeleteDataPoint = (id: string) => {
    triggerConfirm(
        "Delete this data point?",
        () => {
            setData(prev => ({
                ...prev,
                dataPoints: prev.dataPoints.filter(dp => dp.id !== id)
            }));
        }
    );
  };

  const handleImport = (importedData: AppState) => {
    const merged = mergeData(data, importedData);
    setData(merged);
  };

  // View Rendering Logic
  const renderContent = () => {
    if (view === 'DASHBOARD') {
      return (
        <StudentList 
          students={data.students} 
          onAddStudent={handleAddStudent}
          onSelectStudent={handleSelectStudent}
          onDeleteStudent={handleDeleteStudent}
        />
      );
    }

    if (view === 'SETTINGS') {
      return <Settings appState={data} onImport={handleImport} />;
    }

    if (view === 'STUDENT_DETAIL' && activeStudentId) {
      const student = data.students.find(s => s.id === activeStudentId);
      if (!student) return <div>Student not found</div>;

      const studentGoals = data.goals.filter(g => g.studentId === activeStudentId);
      const studentObjectives = data.objectives.filter(o => studentGoals.some(g => g.id === o.goalId));
      const relevantDataPoints = data.dataPoints.filter(dp => studentObjectives.some(o => o.id === dp.objectiveId));

      return (
        <GoalTracker
          student={student}
          goals={studentGoals}
          objectives={studentObjectives}
          dataPoints={relevantDataPoints}
          onBack={() => setView('DASHBOARD')}
          onAddGoal={handleAddGoal}
          onDeleteGoal={handleDeleteGoal}
          onAddObjective={handleAddObjective}
          onUpdateObjective={handleUpdateObjective}
          onDeleteObjective={handleDeleteObjective}
          onAddDataPoint={handleAddDataPoint}
          onDeleteDataPoint={handleDeleteDataPoint}
        />
      );
    }

    return <div>View not found</div>;
  };

  return (
    <div className="min-h-screen font-sans bg-latte text-coffee-bean">
      <Navigation currentView={view} onChangeView={setView} />
      <main className="mt-4">
        {renderContent()}
      </main>
      
      {modalConfig && (
        <ConfirmModal 
            isOpen={modalConfig.isOpen}
            message={modalConfig.message}
            onConfirm={modalConfig.onConfirm}
            onCancel={() => setModalConfig(null)}
        />
      )}
    </div>
  );
};

export default App;