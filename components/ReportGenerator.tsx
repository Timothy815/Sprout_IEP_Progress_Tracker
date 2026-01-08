import React, { useState, useEffect } from 'react';
import { Student, Goal, Objective, DataPoint } from '../types';
import { analyzeObjective } from '../services/report';
import { ArrowLeft, Printer, Edit, Tag, Target, Activity, MessageSquare, Eye, EyeOff } from 'lucide-react';
import { ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Legend } from 'recharts';

// Coffee House Chart Colors
const COLORS = [
    "#81D8D0", // Tiffany
    "#C5E1A5", // Matcha
    "#F48FB1", // Berry
    "#FFE082", // Honey
    "#90CAF9", // Sky
    "#8D6E63", // Coffee Roast
];

interface ReportGeneratorProps {
  student: Student;
  goals: Goal[];
  objectives: Objective[];
  dataPoints: DataPoint[];
  onBack: () => void;
  onUpdateStudent: (student: Student) => void;
  onUpdateGoal: (goal: Goal) => void;
}

const ReportGenerator: React.FC<ReportGeneratorProps> = ({ student, goals, objectives, dataPoints, onBack, onUpdateStudent, onUpdateGoal }) => {
  const [teacherComments, setTeacherComments] = useState(student.reportSummary || ''); 
  
  // Initialize goal comments from the passed goals. 
  const [goalComments, setGoalComments] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    goals.forEach(g => {
        if (g.reportObservation) initial[g.id] = g.reportObservation;
    });
    return initial;
  });

  const [hideEmptyObjectives, setHideEmptyObjectives] = useState(false); 

  // Set document title for better default PDF filenames
  useEffect(() => {
    const originalTitle = document.title;
    document.title = `IEP_Report_${student.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}`;
    return () => {
        document.title = originalTitle;
    };
  }, [student.name]);

  const handleGoalCommentChange = (goalId: string, text: string) => {
      setGoalComments(prev => ({
          ...prev,
          [goalId]: text
      }));
  };

  const saveTeacherComments = () => {
    if (teacherComments !== student.reportSummary) {
        onUpdateStudent({ ...student, reportSummary: teacherComments });
    }
  };

  const saveGoalComment = (goalId: string) => {
    const comment = goalComments[goalId];
    const goal = goals.find(g => g.id === goalId);
    if (goal && comment !== goal.reportObservation) {
        onUpdateGoal({ ...goal, reportObservation: comment });
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-latte min-h-screen print:bg-white print:p-0 print:max-w-none print:min-h-0">
      <div className="no-print flex justify-between items-center mb-6 border-b border-coffee-light/20 pb-4">
        <button onClick={onBack} className="flex items-center gap-2 text-coffee-roast hover:text-coffee-bean">
          <ArrowLeft size={20} /> Back to Tracker
        </button>
        <div className="flex gap-3">
             <button 
                onClick={() => setHideEmptyObjectives(!hideEmptyObjectives)}
                className={`px-4 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all shadow-md border ${
                    hideEmptyObjectives 
                    ? 'bg-tiffany text-white border-tiffany' 
                    : 'bg-white text-coffee-roast border-coffee-light hover:bg-latte'
                }`}
                title={hideEmptyObjectives ? "Show all objectives" : "Hide objectives with no data"}
            >
                {hideEmptyObjectives ? <EyeOff size={18} /> : <Eye size={18} />}
                <span className="hidden md:inline">{hideEmptyObjectives ? 'Hiding Empty' : 'Show All'}</span>
            </button>

             <button 
                onClick={handlePrint} 
                className="bg-coffee-bean text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-coffee-roast transition-all shadow-md"
            >
                <Printer size={18} />
                Print / Save PDF
            </button>
        </div>
      </div>

      <div id="print-area" className="p-12 bg-white max-w-[8.5in] mx-auto shadow-2xl relative overflow-hidden print:shadow-none print:p-0 print:max-w-none print:w-full print:mx-0 print:overflow-visible">
        {/* Decorative Top Border */}
        <div className="absolute top-0 left-0 w-full h-3 bg-gradient-to-r from-coffee-roast via-tiffany to-matcha print:h-2"></div>

        <div className="text-center mb-10 border-b-2 border-latte pb-8 print:mb-6 print:pb-4">
            <h1 className="text-4xl font-friendly font-bold text-coffee-bean mb-2">IEP Progress Report</h1>
            <div className="flex justify-center items-center gap-2 text-coffee-roast">
                <span>Prepared for the family of</span>
                <span className="font-bold text-coffee-bean text-lg font-friendly">{student.name}</span>
            </div>
            <p className="text-coffee-light text-sm mt-2">{new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>

        {/* General Teacher Comments Section */}
        <div className="mb-12 bg-cream p-8 rounded-2xl border border-coffee-light/20 break-inside-avoid relative print:mb-6 print:p-4 print:bg-yellow-50/50">
             <div className="absolute top-0 left-8 -translate-y-1/2 bg-coffee-bean text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest shadow-sm print:border print:border-coffee-bean">Teacher's Note</div>
             <h3 className="text-lg font-bold text-coffee-bean mb-4 flex items-center gap-2 mt-2">
                 <MessageSquare size={18} className="text-tiffany"/> Summary & Observations
             </h3>
             <textarea
                className="w-full bg-transparent border-none outline-none font-sans text-coffee-bean resize-none min-h-[100px] placeholder:text-coffee-light/70 leading-relaxed"
                placeholder="Type overall summary observations here (e.g. attendance, behavior, general improvements)..."
                value={teacherComments}
                onChange={(e) => setTeacherComments(e.target.value)}
                onBlur={saveTeacherComments}
             />
        </div>

        {/* Unified Goals Section */}
        <div className="space-y-12 print:space-y-8">
            {goals.map((goal, goalIdx) => {
                // Filter objectives for this goal
                let goalObjectives = objectives.filter(o => o.goalId === goal.id);

                // Apply "Hide Empty" filter if enabled
                if (hideEmptyObjectives) {
                    goalObjectives = goalObjectives.filter(obj => 
                        dataPoints.some(dp => dp.objectiveId === obj.id)
                    );
                }

                if (goalObjectives.length === 0) return null;

                return (
                    <div key={goal.id} className="mb-12 border-b-2 border-dashed border-latte pb-12 last:border-0 last:pb-0 break-inside-avoid">
                        {/* Goal Header */}
                        <div className="mb-8 break-after-avoid">
                             <div className="flex items-center gap-3 mb-3">
                                <span className="text-xs font-bold text-white bg-tiffany px-2 py-1 rounded uppercase tracking-widest print:text-black print:border print:border-black/20">Goal {goalIdx + 1}</span>
                                <span className="text-xs font-bold text-coffee-roast bg-latte px-2 py-1 rounded flex items-center gap-1 uppercase tracking-wide print:bg-gray-100"><Tag size={10}/> {goal.category}</span>
                            </div>
                            <h3 className="text-xl font-bold text-coffee-bean leading-normal">{goal.description}</h3>
                            {goal.presentLevel && (
                                <p className="text-sm text-coffee-roast mt-3 italic border-l-2 border-coffee-light pl-3">Present Level: {goal.presentLevel}</p>
                            )}
                        </div>
                        
                        {/* Objectives Loop */}
                        <div className="space-y-8 pl-4 border-l-2 border-latte ml-2 print:space-y-6">
                            {goalObjectives.map((obj, idx) => {
                                 const objColor = COLORS[idx % COLORS.length];
                                 const analysis = analyzeObjective(obj, dataPoints);
                                 
                                 // We use break-inside-avoid here to ensure the text summary AND chart stay on the same page
                                 return (
                                     <div key={obj.id} className="break-inside-avoid bg-white rounded-xl mb-6 print:mb-4">
                                         {/* Objective Text Summary */}
                                         <div className="mb-6 print:mb-2">
                                             <h4 className="text-lg font-bold text-coffee-bean mb-2 flex items-center gap-2">
                                                 <Target size={18} style={{ color: objColor }} />
                                                 {obj.title}
                                             </h4>
                                             <p className="text-coffee-roast text-sm mb-4">{obj.description}</p>
                                             
                                             <div className="grid grid-cols-2 md:grid-cols-4 gap-6 bg-paper p-5 rounded-xl border border-latte text-sm print:bg-gray-50 print:p-3 print:gap-2">
                                                 <div>
                                                     <span className="block text-[10px] font-bold text-coffee-light uppercase mb-1 tracking-wider">Target</span>
                                                     <span className="font-bold text-coffee-bean">
                                                        {analysis.comparatorText} {obj.targetValue} {obj.unit}
                                                     </span>
                                                 </div>
                                                 <div>
                                                     <span className="block text-[10px] font-bold text-coffee-light uppercase mb-1 tracking-wider">Current Status</span>
                                                     <span className="font-bold text-coffee-bean">{analysis.currentStatus}</span>
                                                     {analysis.currentSecondary && (
                                                         <span className="block text-xs text-red-500 mt-0.5 font-medium">+ {analysis.currentSecondary}</span>
                                                     )}
                                                 </div>
                                                 <div>
                                                     <span className="block text-[10px] font-bold text-coffee-light uppercase mb-1 tracking-wider">Last Data</span>
                                                     <span className="font-bold text-coffee-bean">{analysis.dateStr || "N/A"}</span>
                                                 </div>
                                                 <div>
                                                     <span className="block text-[10px] font-bold text-coffee-light uppercase mb-1 tracking-wider">Progress</span>
                                                     <span className={`${analysis.statusColor} font-bold`}>{analysis.statusText}</span>
                                                 </div>
                                                 {analysis.criteriaText && (
                                                     <div className="col-span-2 md:col-span-4 border-t border-latte mt-2 pt-2 text-xs text-coffee-roast italic">
                                                         {analysis.criteriaText}
                                                     </div>
                                                 )}
                                             </div>
                                         </div>
                                         
                                         {/* Chart */}
                                         <div className="h-56 w-full bg-white rounded-xl border border-latte p-2 relative overflow-hidden print:h-48 print:border-none print:p-0">
                                            {analysis.objData.length > 1 ? (
                                                <div style={{ width: '100%', height: '100%' }}>
                                                    <ResponsiveContainer width="100%" height="100%">
                                                        <ComposedChart 
                                                            data={analysis.objData.map(dp => ({
                                                                ...dp,
                                                                displayDate: new Date(dp.date).toLocaleDateString(undefined, { month: 'numeric', day: 'numeric' })
                                                            }))}
                                                        >
                                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EFEBE9" />
                                                            <XAxis dataKey="displayDate" fontSize={10} tick={{fill: '#8D6E63'}} axisLine={{stroke: '#EFEBE9'}} tickLine={false} />
                                                            <YAxis yAxisId="left" fontSize={10} domain={['dataMin', 'dataMax']} tick={{fill: '#8D6E63'}} axisLine={false} tickLine={false} />
                                                            {obj.hasSecondaryMetric && <YAxis yAxisId="right" orientation="right" fontSize={10} stroke="#EF4444" tick={{fill: '#EF4444'}} axisLine={false} tickLine={false}/>}
                                                            
                                                            <Legend verticalAlign="top" height={36} iconSize={10} wrapperStyle={{fontSize: '12px', color: '#8D6E63'}} />
                                                            <Line yAxisId="left" type="monotone" dataKey="value" name={obj.unit} stroke={objColor} strokeWidth={3} dot={{r: 4, fill: objColor, strokeWidth: 2, stroke: '#fff'}} isAnimationActive={false} />
                                                            {obj.hasSecondaryMetric && <Bar yAxisId="right" dataKey="secondaryValue" name={obj.secondaryMetricName} fill="#EF4444" barSize={20} fillOpacity={0.7} />}
                                                        </ComposedChart>
                                                    </ResponsiveContainer>
                                                </div>
                                            ) : (
                                                <div className="h-full flex flex-col items-center justify-center text-coffee-light">
                                                    <Activity size={24} className="mb-2 opacity-50"/>
                                                    <span className="text-xs">Insufficient data to graph progress</span>
                                                </div>
                                            )}
                                         </div>
                                     </div>
                                 )
                            })}
                        </div>

                        {/* Per-Goal Comments Section */}
                        <div className="mt-8 ml-6 break-inside-avoid bg-latte/30 p-4 rounded-xl border border-latte print:bg-gray-50 print:mt-4">
                            <label className="text-sm font-bold text-coffee-bean mb-2 flex items-center gap-2">
                                <Edit size={14} className="text-coffee-light no-print"/> Goal {goalIdx + 1} Observations
                            </label>
                            <textarea
                                className="w-full bg-transparent border-none rounded-lg text-sm font-sans text-coffee-bean resize-none min-h-[60px] placeholder:text-coffee-light focus:outline-none print:bg-transparent print:border-none print:p-0 print:resize-none"
                                placeholder={`Add specific notes on student progress regarding this goal...`}
                                value={goalComments[goal.id] || ''}
                                onChange={(e) => handleGoalCommentChange(goal.id, e.target.value)}
                                onBlur={() => saveGoalComment(goal.id)}
                            />
                        </div>
                    </div>
                )
            })}
        </div>

        <div className="mt-12 pt-8 border-t border-latte text-center text-xs text-coffee-light flex items-center justify-center gap-2 print:mt-6 print:pt-4">
             <span>🌱</span>
            <p>Generated by Sprout Tracker. Private & Confidential.</p>
        </div>
      </div>
    </div>
  );
};

export default ReportGenerator;