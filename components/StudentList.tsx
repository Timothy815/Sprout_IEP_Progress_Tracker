import React, { useState } from 'react';
import { Student } from '../types';
import { Plus, ChevronRight, Trash2 } from 'lucide-react';
import { generateId } from '../services/storage';

interface StudentListProps {
  students: Student[];
  onSelectStudent: (id: string) => void;
  onAddStudent: (student: Student) => void;
  onDeleteStudent: (id: string) => void;
}

// Coffee House Pastel Palette for Icons
const STUDENT_COLORS = [
    { bg: 'bg-tiffany', text: 'text-white' },
    { bg: 'bg-matcha', text: 'text-coffee-bean' },
    { bg: 'bg-berry', text: 'text-white' },
    { bg: 'bg-honey', text: 'text-coffee-bean' },
    { bg: 'bg-sky', text: 'text-white' },
    { bg: 'bg-coffee-roast', text: 'text-white' },
];

// Custom Icons in the style of the logo (Line art, rounded)
const CUSTOM_ICONS = [
  // Leaf/Sprout
  (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M12 22V12" />
      <path d="M12 12C12 12 16.5 10 16.5 6C16.5 4 15 2.5 13 2.5C10.5 2.5 12 8 12 8" />
      <path d="M12 16C12 16 7 14.5 7 10.5C7 8.5 8.5 7 10 7C11.5 7 12 11 12 11" />
    </svg>
  ),
  // Coffee Cup
  (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M18 8h1a4 4 0 0 1 0 8h-1" />
      <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" />
      <path d="M6 1v3" />
      <path d="M10 1v3" />
      <path d="M14 1v3" />
    </svg>
  ),
  // Sun
  (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
       <circle cx="12" cy="12" r="5" />
       <path d="M12 1v2" />
       <path d="M12 21v2" />
       <path d="M4.22 4.22l1.42 1.42" />
       <path d="M18.36 18.36l1.42 1.42" />
       <path d="M1 12h2" />
       <path d="M21 12h2" />
       <path d="M4.22 19.78l1.42-1.42" />
       <path d="M18.36 5.64l1.42-1.42" />
    </svg>
  ),
  // Book
  (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
       <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
       <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </svg>
  ),
  // Pencil
  (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
       <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
    </svg>
  ),
  // Cloud
  (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
       <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z" />
    </svg>
  ),
  // Star
  (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
       <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  ),
  // Heart
  (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
       <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  )
];

const getStudentTheme = (name: string) => {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const colorIndex = Math.abs(hash) % STUDENT_COLORS.length;
    const iconIndex = Math.abs(hash) % CUSTOM_ICONS.length;
    
    return {
        color: STUDENT_COLORS[colorIndex],
        Icon: CUSTOM_ICONS[iconIndex]
    };
};

const StudentList: React.FC<StudentListProps> = ({ students, onSelectStudent, onAddStudent, onDeleteStudent }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentGrade, setNewStudentGrade] = useState('');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudentName) return;
    
    onAddStudent({
      id: generateId(),
      name: newStudentName,
      grade: newStudentGrade,
      teacher: "Teacher", // Default
    });
    setNewStudentName('');
    setNewStudentGrade('');
    setIsAdding(false);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-10">
        <div>
            <h2 className="text-4xl font-friendly font-bold text-coffee-bean">My Classroom</h2>
            <p className="text-coffee-roast mt-2">Select a student to view their progress.</p>
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="bg-coffee-bean hover:bg-coffee-roast text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-soft transition-all hover:-translate-y-1"
        >
          <Plus size={20} /> Add Student
        </button>
      </div>

      {isAdding && (
        <div className="mb-10 bg-cream p-8 rounded-3xl shadow-soft border border-coffee-light/50 animate-fade-in relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-tiffany"></div>
          <h3 className="text-2xl font-bold mb-6 text-coffee-bean font-friendly">New Student Profile</h3>
          <form onSubmit={handleAdd} className="flex flex-col md:flex-row gap-4">
            <input 
              type="text" 
              placeholder="Student Name"
              className="flex-1 p-4 border border-coffee-light rounded-xl focus:border-tiffany focus:ring-2 focus:ring-tiffany/20 outline-none bg-white text-coffee-bean placeholder:text-coffee-light shadow-inner"
              value={newStudentName}
              onChange={e => setNewStudentName(e.target.value)}
            />
            <input 
              type="text" 
              placeholder="Grade"
              className="w-full md:w-32 p-4 border border-coffee-light rounded-xl focus:border-tiffany focus:ring-2 focus:ring-tiffany/20 outline-none bg-white text-coffee-bean placeholder:text-coffee-light shadow-inner"
              value={newStudentGrade}
              onChange={e => setNewStudentGrade(e.target.value)}
            />
            <div className="flex gap-2">
                <button type="submit" className="bg-tiffany text-white px-6 py-3 rounded-xl font-bold hover:bg-opacity-90 transition-colors">Save</button>
                <button type="button" onClick={() => setIsAdding(false)} className="bg-white border border-coffee-light text-coffee-roast px-6 py-3 rounded-xl font-bold hover:bg-latte transition-colors">Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {students.length === 0 && (
            <div className="col-span-2 text-center py-24 bg-white/50 rounded-3xl border-2 border-dashed border-coffee-light/50">
                <p className="text-xl text-coffee-light font-medium font-friendly">No students yet. Pour a cup of coffee and add your first one!</p>
            </div>
        )}
        {students.map(student => {
            const { color, Icon } = getStudentTheme(student.name);
            return (
              <div 
                key={student.id} 
                className="group bg-white rounded-3xl shadow-sm hover:shadow-soft transition-all duration-300 border border-coffee-light/20 hover:border-tiffany/50 flex justify-between items-center overflow-hidden cursor-pointer"
                onClick={() => onSelectStudent(student.id)}
              >
                <div className="flex-1 p-6 flex items-center gap-5">
                    <div className={`w-16 h-16 ${color.bg} ${color.text} rounded-2xl flex items-center justify-center shadow-sm shrink-0 transform group-hover:rotate-6 transition-transform duration-300`}>
                        <Icon width={32} height={32} />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-coffee-bean group-hover:text-tiffany transition-colors font-friendly">{student.name}</h3>
                        <p className="text-coffee-roast text-sm font-medium">Grade {student.grade}</p>
                    </div>
                </div>

                <div className="flex items-center gap-2 pr-6 border-l border-latte pl-4 py-6">
                     <button 
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            onDeleteStudent(student.id); 
                        }}
                        className="p-2 text-coffee-light hover:text-red-400 hover:bg-red-50 rounded-full transition-colors"
                        title="Delete Student"
                    >
                        <Trash2 size={18} />
                    </button>
                    <div className="text-coffee-light group-hover:text-tiffany transition-colors">
                        <ChevronRight size={24} />
                    </div>
                </div>
              </div>
            )
        })}
      </div>
    </div>
  );
};

export default StudentList;