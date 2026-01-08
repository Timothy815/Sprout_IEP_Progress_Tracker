import React, { useState } from 'react';
import { Student, Goal, Objective, DataPoint } from '../types';
import { generateId } from '../services/storage';
import { ArrowLeft, Plus, TrendingUp, BookOpen, Calendar, Edit2, Trash2, X, History, FileText, Target, AlertCircle, Layers, Tag } from 'lucide-react';
import { ComposedChart, LineChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, ReferenceArea, Legend } from 'recharts';
import ReportGenerator from './ReportGenerator';

interface GoalTrackerProps {
  student: Student;
  goals: Goal[];
  objectives: Objective[];
  dataPoints: DataPoint[];
  onBack: () => void;
  onAddGoal: (goal: Goal) => void;
  onDeleteGoal: (id: string) => void;
  onAddObjective: (obj: Objective) => void;
  onUpdateObjective: (obj: Objective) => void;
  onDeleteObjective: (id: string) => void;
  onAddDataPoint: (dp: DataPoint) => void;
  onDeleteDataPoint: (id: string) => void;
}

const CATEGORIES = [
    "Reading", "Writing", "Math", "Speech/Language", 
    "Social/Emotional", "Behavioral", "Motor Skills", 
    "Adaptive/Life Skills", "Transition", "Other"
];

// Coffee House Chart Colors
const COLORS = [
    "#81D8D0", // Tiffany
    "#C5E1A5", // Matcha
    "#F48FB1", // Berry
    "#FFE082", // Honey
    "#90CAF9", // Sky
    "#8D6E63", // Coffee Roast
];

const GoalTracker: React.FC<GoalTrackerProps> = ({ 
  student, goals, objectives, dataPoints, onBack, 
  onAddGoal, onDeleteGoal, 
  onAddObjective, onUpdateObjective, onDeleteObjective,
  onAddDataPoint, onDeleteDataPoint
}) => {
  const [activeTab, setActiveTab] = useState<'GOALS' | 'REPORT'>('GOALS');
  
  // UI State
  const [showGoalForm, setShowGoalForm] = useState(false);
  const [showObjFormFor, setShowObjFormFor] = useState<string | null>(null); // goalId
  const [editingObjId, setEditingObjId] = useState<string | null>(null);
  
  const [showDataForm, setShowDataForm] = useState<string | null>(null); // objectiveId
  const [showHistoryFor, setShowHistoryFor] = useState<string | null>(null); // objectiveId

  // New Goal Form State
  const [newGoalDesc, setNewGoalDesc] = useState('');
  const [newGoalPL, setNewGoalPL] = useState('');
  const [newGoalCategory, setNewGoalCategory] = useState('Reading');

  // Objective Form State
  const [objTitle, setObjTitle] = useState('');
  const [objDesc, setObjDesc] = useState('');
  const [objUnit, setObjUnit] = useState('%');
  const [objTarget, setObjTarget] = useState(80);
  const [objComparator, setObjComparator] = useState<'>=' | '<='>('>=');
  const [objBaseline, setObjBaseline] = useState(0);
  const [objCriteria, setObjCriteria] = useState('');
  const [objVariance, setObjVariance] = useState<number | ''>('');
  
  // Secondary Metric Form State
  const [objHasSecondary, setObjHasSecondary] = useState(false);
  const [objSecName, setObjSecName] = useState('Errors');

  // Data Form State
  const [dataVal, setDataVal] = useState('');
  const [dataSecVal, setDataSecVal] = useState('');
  const [dataDate, setDataDate] = useState(new Date().toISOString().split('T')[0]);
  const [dataNotes, setDataNotes] = useState('');
  const [dataRecorder, setDataRecorder] = useState('Teacher');

  // --- Handlers ---

  const handleSaveGoal = (e: React.FormEvent) => {
    e.preventDefault();
    onAddGoal({
      id: generateId(),
      studentId: student.id,
      category: newGoalCategory,
      description: newGoalDesc,
      presentLevel: newGoalPL,
      createdAt: new Date().toISOString()
    });
    setNewGoalDesc('');
    setNewGoalPL('');
    setNewGoalCategory('Reading');
    setShowGoalForm(false);
  };

  const startAddObjective = (goalId: string) => {
      setEditingObjId(null);
      setObjTitle(''); setObjDesc(''); setObjUnit('%'); 
      setObjTarget(80); setObjComparator('>='); setObjBaseline(0);
      setObjCriteria(''); setObjVariance('');
      setObjHasSecondary(false); setObjSecName('Errors');
      setShowObjFormFor(goalId);
  };

  const startEditObjective = (obj: Objective) => {
    setEditingObjId(obj.id);
    setObjTitle(obj.title);
    setObjDesc(obj.description);
    setObjUnit(obj.unit);
    setObjTarget(obj.targetValue);
    setObjComparator(obj.targetComparator || '>=');
    setObjBaseline(obj.baselineValue);
    setObjCriteria(obj.masteryCriteria || '');
    setObjVariance(obj.allowableVariance !== undefined ? obj.allowableVariance : '');
    setObjHasSecondary(obj.hasSecondaryMetric || false);
    setObjSecName(obj.secondaryMetricName || 'Errors');
    setShowObjFormFor(obj.goalId);
  };

  const handleSaveObjective = (e: React.FormEvent, goalId: string, closeAfter = true) => {
    e.preventDefault();
    const commonData = {
        title: objTitle,
        description: objDesc,
        unit: objUnit,
        targetValue: Number(objTarget),
        targetComparator: objComparator,
        baselineValue: Number(objBaseline),
        masteryCriteria: objCriteria,
        allowableVariance: objVariance === '' ? 0 : Number(objVariance),
        startDate: new Date().toISOString(),
        endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString(),
        hasSecondaryMetric: objHasSecondary,
        secondaryMetricName: objHasSecondary ? objSecName : undefined,
    };

    if (editingObjId) {
        // Find existing to keep dates
        const existing = objectives.find(o => o.id === editingObjId);
        onUpdateObjective({
            ...commonData,
            id: editingObjId,
            goalId: goalId,
            startDate: existing?.startDate || commonData.startDate,
            endDate: existing?.endDate || commonData.endDate
        });
    } else {
        onAddObjective({
            id: generateId(),
            goalId: goalId,
            ...commonData
        });
    }

    if (closeAfter) {
        setShowObjFormFor(null);
        setEditingObjId(null);
    } else {
        setObjTitle(''); setObjDesc(''); setObjUnit('%'); setObjTarget(80); setObjBaseline(0);
        setObjCriteria(''); setObjVariance('');
        setObjHasSecondary(false); setObjSecName('Errors');
        setEditingObjId(null);
        alert("Objective added! Ready for next one.");
    }
  };

  const handleSaveData = (e: React.FormEvent, objectiveId: string) => {
    e.preventDefault();
    onAddDataPoint({
      id: generateId(),
      objectiveId,
      date: dataDate,
      value: Number(dataVal),
      secondaryValue: dataSecVal ? Number(dataSecVal) : undefined,
      notes: dataNotes,
      recordedBy: dataRecorder
    });
    setShowDataForm(null);
    setDataVal(''); setDataSecVal(''); setDataNotes('');
  };

  // Helper to prepare combined chart data
  const getCombinedChartData = (goalObjectives: Objective[]) => {
      // 1. Collect all dates from all objectives
      const allDates = new Set<string>();
      const objMap: Record<string, Objective> = {};
      
      goalObjectives.forEach(obj => {
          objMap[obj.id] = obj;
          dataPoints
            .filter(dp => dp.objectiveId === obj.id)
            .forEach(dp => allDates.add(dp.date));
      });

      // 2. Sort dates
      const sortedDates = Array.from(allDates).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

      // 3. Construct data objects
      const chartData = sortedDates.map(date => {
          const entry: any = { 
              rawDate: date,
              displayDate: new Date(date).toLocaleDateString(undefined, { month: 'numeric', day: 'numeric' }) 
          };
          
          goalObjectives.forEach(obj => {
              const dp = dataPoints.find(d => d.objectiveId === obj.id && d.date === date);
              if (dp) {
                  entry[obj.id] = dp.value;
                  entry[`${obj.id}_notes`] = dp.notes; // Store notes for tooltip
              }
          });
          return entry;
      });

      return chartData;
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-coffee-light/50 rounded-xl shadow-soft text-sm z-50">
          <p className="font-bold mb-2 text-coffee-bean border-b border-latte pb-1">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} style={{ color: entry.color }} className="mb-1">
              <span className="font-bold">{entry.name}:</span> {entry.value}
              {/* Try to find notes if attached to the data payload */}
              {entry.payload[`${entry.dataKey}_notes`] && (
                  <div className="text-coffee-roast text-xs italic ml-2 max-w-[200px] truncate">
                      "{entry.payload[`${entry.dataKey}_notes`]}"
                  </div>
              )}
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  if (activeTab === 'REPORT') {
    return (
      <ReportGenerator 
        student={student} 
        goals={goals} 
        objectives={objectives} 
        dataPoints={dataPoints} 
        onBack={() => setActiveTab('GOALS')} 
      />
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6 pb-24">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-latte rounded-full transition-colors text-coffee-roast">
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-3xl font-friendly font-bold text-coffee-bean">{student.name}</h1>
            <p className="text-coffee-roast text-sm">{student.grade} Grade</p>
          </div>
        </div>
        
        <div className="flex gap-2">
           <button 
            type="button"
            onClick={() => setShowGoalForm(true)}
            className="bg-white border-2 border-tiffany text-tiffany px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-tiffany/10 transition-colors shadow-sm"
          >
            <Plus size={18} /> New Goal
          </button>
          <button 
            type="button"
            onClick={() => setActiveTab('REPORT')}
            className="bg-coffee-bean text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-soft hover:bg-coffee-roast transition-colors"
          >
            <BookOpen size={18} /> Reports
          </button>
        </div>
      </div>

      {/* New Goal Form (Parent) */}
      {showGoalForm && (
          <div className="bg-cream border border-coffee-light/50 p-8 rounded-3xl shadow-soft mb-8 animate-fade-in relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-tiffany"></div>
              <h3 className="font-bold text-xl text-coffee-bean mb-6 flex items-center gap-2 font-friendly">
                  <Target size={24} className="text-tiffany" /> Set New IEP Goal
              </h3>
              <form onSubmit={handleSaveGoal}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                          <label className="block text-sm font-bold text-coffee-roast mb-1">Goal Category</label>
                          <select 
                            className="w-full p-3 border border-coffee-light rounded-xl focus:outline-none focus:border-tiffany bg-white text-coffee-bean"
                            value={newGoalCategory}
                            onChange={e => setNewGoalCategory(e.target.value)}
                          >
                              {CATEGORIES.map(cat => (
                                  <option key={cat} value={cat}>{cat}</option>
                              ))}
                          </select>
                      </div>
                  </div>
                  <div className="mb-4">
                      <label className="block text-sm font-bold text-coffee-roast mb-1">Goal Description</label>
                      <textarea required className="w-full p-3 border border-coffee-light rounded-xl focus:outline-none focus:border-tiffany bg-white text-coffee-bean" rows={3} placeholder="By [Date], given [Condition], student will..." value={newGoalDesc} onChange={e => setNewGoalDesc(e.target.value)} />
                  </div>
                  <div className="mb-4">
                      <label className="block text-sm font-bold text-coffee-roast mb-1">Present Levels of Performance</label>
                      <textarea className="w-full p-3 border border-coffee-light rounded-xl focus:outline-none focus:border-tiffany bg-white text-coffee-bean" rows={2} placeholder="Currently, the student..." value={newGoalPL} onChange={e => setNewGoalPL(e.target.value)} />
                  </div>
                  <div className="flex justify-end gap-2">
                      <button type="button" onClick={() => setShowGoalForm(false)} className="px-6 py-2 text-coffee-roast font-bold hover:bg-latte rounded-xl">Cancel</button>
                      <button type="submit" className="px-8 py-2 bg-tiffany text-white rounded-xl font-bold shadow-md hover:bg-opacity-90">Save Goal</button>
                  </div>
              </form>
          </div>
      )}

      {/* Goal List */}
      <div className="space-y-12">
        {goals.length === 0 && !showGoalForm && (
            <div className="text-center py-24 bg-white/50 rounded-3xl border-2 border-dashed border-coffee-light/50">
                <p className="text-coffee-light font-friendly text-xl">No goals set yet.</p>
            </div>
        )}

        {goals.map(goal => {
            const goalObjectives = objectives.filter(o => o.goalId === goal.id);
            const combinedChartData = getCombinedChartData(goalObjectives);
            
            return (
                <div key={goal.id} className="bg-white rounded-3xl shadow-soft border border-coffee-light/20 overflow-hidden">
                    {/* Goal Header */}
                    <div className="bg-latte/50 p-6 border-b border-latte">
                        <div className="flex justify-between items-start">
                             <div>
                                 <div className="flex items-center gap-2 mb-3">
                                     <span className="bg-coffee-bean text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">IEP Goal</span>
                                     <span className="bg-white border border-coffee-light text-coffee-roast text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide flex items-center gap-1">
                                        <Tag size={10} /> {goal.category}
                                     </span>
                                 </div>
                                 <h3 className="text-xl font-bold text-coffee-bean leading-snug font-friendly">{goal.description}</h3>
                                 <p className="text-coffee-roast mt-2 text-sm italic border-l-2 border-tiffany pl-3"><span className="font-bold not-italic">Present Level:</span> {goal.presentLevel || "N/A"}</p>
                             </div>
                             <button 
                                type="button"
                                onClick={(e) => { 
                                    e.stopPropagation(); 
                                    onDeleteGoal(goal.id); 
                                }} 
                                className="text-coffee-light hover:text-red-400 p-2 relative z-50 transition-colors"
                                title="Delete Goal"
                            >
                                 <Trash2 size={20} />
                             </button>
                        </div>
                    </div>

                    {/* Objectives List & Combined Chart */}
                    <div className="p-6 bg-white space-y-10">
                        
                        {/* COMBINED CHART */}
                        {goalObjectives.length > 0 && combinedChartData.length > 0 && (
                            <div className="mb-8 p-6 border border-latte rounded-3xl bg-white shadow-sm">
                                <h4 className="font-bold text-coffee-bean mb-6 flex items-center gap-2">
                                    <Layers size={20} className="text-tiffany"/> Combined Progress View
                                </h4>
                                <div className="h-64 w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={combinedChartData}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EFEBE9" />
                                            <XAxis dataKey="displayDate" fontSize={10} tick={{fill: '#8D6E63'}} axisLine={{stroke: '#EFEBE9'}} tickLine={false} />
                                            <YAxis fontSize={10} domain={['auto', 'auto']} tick={{fill: '#8D6E63'}} axisLine={{stroke: '#EFEBE9'}} tickLine={false}/>
                                            <Tooltip content={<CustomTooltip />} />
                                            <Legend verticalAlign="top" height={36} iconType="circle"/>
                                            
                                            {goalObjectives.map((obj, idx) => {
                                                const color = COLORS[idx % COLORS.length];
                                                return (
                                                    <React.Fragment key={obj.id}>
                                                        {/* Target Line - Dashed */}
                                                        <ReferenceLine 
                                                            y={obj.targetValue} 
                                                            stroke={color} 
                                                            strokeDasharray="3 3" 
                                                            strokeOpacity={0.5}
                                                            label={{ value: 'Target', position: 'insideRight', fill: color, fontSize: 10 }}
                                                        />
                                                        {/* Actual Data Line */}
                                                        <Line 
                                                            type="monotone" 
                                                            dataKey={obj.id} 
                                                            name={obj.title} 
                                                            stroke={color} 
                                                            strokeWidth={3} 
                                                            dot={{r: 5, fill: color, strokeWidth: 3, stroke: '#fff'}}
                                                            activeDot={{r: 7}}
                                                            connectNulls
                                                        />
                                                    </React.Fragment>
                                                )
                                            })}
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        )}

                        {/* Add Objective Form */}
                        {showObjFormFor === goal.id && (
                             <div className="bg-paper border-2 border-tiffany/30 p-8 rounded-3xl shadow-inner mb-8 animate-fade-in relative">
                                <button type="button" onClick={() => setShowObjFormFor(null)} className="absolute top-4 right-4 text-coffee-light hover:text-coffee-bean"><X size={24}/></button>
                                <h4 className="font-bold text-xl text-coffee-bean mb-6 font-friendly">{editingObjId ? 'Edit Objective' : 'New Objective'}</h4>
                                <form onSubmit={(e) => handleSaveObjective(e, goal.id, true)} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="md:col-span-2">
                                        <label className="text-xs font-bold text-coffee-roast uppercase tracking-wider mb-1 block">Title / Metric Name</label>
                                        <input required className="w-full p-3 border border-coffee-light rounded-xl bg-white text-coffee-bean focus:border-tiffany focus:outline-none" value={objTitle} onChange={e => setObjTitle(e.target.value)} placeholder="e.g. Words Per Minute" />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="text-xs font-bold text-coffee-roast uppercase tracking-wider mb-1 block">Condition</label>
                                        <textarea required className="w-full p-3 border border-coffee-light rounded-xl bg-white text-coffee-bean focus:border-tiffany focus:outline-none" value={objDesc} onChange={e => setObjDesc(e.target.value)} placeholder="e.g. When reading a 3rd grade level passage..." />
                                    </div>
                                    
                                    {/* Criteria Section */}
                                    <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4 bg-white p-6 rounded-2xl border border-coffee-light/30">
                                        <div className="md:col-span-2 text-xs font-bold text-tiffany uppercase flex items-center gap-1 mb-2">
                                            <Target size={14}/> Success Criteria
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-bold text-coffee-roast uppercase block mb-1">Target</label>
                                            <div className="flex gap-2">
                                                <select 
                                                    className="w-24 p-2 border border-coffee-light rounded-lg bg-latte text-coffee-bean text-xs"
                                                    value={objComparator}
                                                    onChange={e => setObjComparator(e.target.value as '>=' | '<=')}
                                                >
                                                    <option value=">=">At least (≥)</option>
                                                    <option value="<=">At most (≤)</option>
                                                </select>
                                                <input type="number" required className="w-full p-2 border border-coffee-light rounded-lg bg-white text-coffee-bean" value={objTarget} onChange={e => setObjTarget(Number(e.target.value))} />
                                            </div>
                                        </div>
                                        
                                        {/* Unit Selection & Custom Label */}
                                        <div className="flex flex-col gap-1">
                                            <label className="text-[10px] font-bold text-coffee-roast uppercase block">Unit</label>
                                            <div className="flex gap-2">
                                                 <input 
                                                    className="w-full p-2 border border-coffee-light rounded-lg bg-white text-coffee-bean" 
                                                    value={objUnit} 
                                                    onChange={e => setObjUnit(e.target.value)}
                                                    placeholder="%" 
                                                />
                                                <select 
                                                    className="w-12 p-2 border border-coffee-light rounded-lg bg-latte text-coffee-bean" 
                                                    onChange={e => setObjUnit(e.target.value)}
                                                >
                                                    <option value="">...</option>
                                                    <option value="%">%</option>
                                                    <option value="trials">x</option>
                                                    <option value="min">m</option>
                                                </select>
                                            </div>
                                        </div>

                                        <div className="md:col-span-2">
                                            <label className="text-[10px] font-bold text-coffee-roast uppercase block mb-1">Criteria Detail</label>
                                            <input className="w-full p-2 border border-coffee-light rounded-lg bg-white text-coffee-bean" value={objCriteria} onChange={e => setObjCriteria(e.target.value)} placeholder="e.g. 4 out of 5 consecutive trials" />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-bold text-coffee-roast uppercase block mb-1">Baseline</label>
                                            <input type="number" className="w-full p-2 border border-coffee-light rounded-lg bg-white text-coffee-bean" value={objBaseline} onChange={e => setObjBaseline(Number(e.target.value))} />
                                        </div>
                                    </div>
                                    
                                    {/* Secondary Metric Section */}
                                    <div className="md:col-span-2 bg-red-50 p-4 rounded-2xl border border-red-100">
                                        <div className="flex items-center gap-2 mb-2">
                                            <input 
                                                type="checkbox" 
                                                id="hasSecondary" 
                                                checked={objHasSecondary} 
                                                onChange={e => setObjHasSecondary(e.target.checked)}
                                                className="w-4 h-4 text-tiffany rounded focus:ring-tiffany"
                                            />
                                            <label htmlFor="hasSecondary" className="text-xs font-bold text-red-800 uppercase cursor-pointer">Track Secondary Metric? (e.g. Errors)</label>
                                        </div>
                                        
                                        {objHasSecondary && (
                                            <div className="animate-fade-in pl-6 mt-2">
                                                <label className="text-[10px] font-bold text-coffee-roast uppercase block mb-1">Metric Label</label>
                                                <input 
                                                    className="w-full p-2 border border-coffee-light rounded-lg bg-white text-coffee-bean" 
                                                    value={objSecName} 
                                                    onChange={e => setObjSecName(e.target.value)}
                                                    placeholder="Errors" 
                                                />
                                            </div>
                                        )}
                                    </div>

                                    <div className="md:col-span-2 flex justify-end gap-3 mt-4">
                                         {!editingObjId && (
                                            <button type="button" onClick={(e) => handleSaveObjective(e as any, goal.id, false)} className="px-5 py-2.5 bg-sky text-white font-bold rounded-xl shadow-sm hover:opacity-90">Save & Add Another</button>
                                         )}
                                         <button type="submit" className="px-8 py-2.5 bg-tiffany text-white font-bold rounded-xl shadow-md hover:opacity-90">Save Objective</button>
                                    </div>
                                </form>
                             </div>
                        )}

                        {goalObjectives.length === 0 && !showObjFormFor && (
                             <div className="text-center py-10">
                                 <p className="text-coffee-light italic mb-4">No objectives defined yet.</p>
                                 <button type="button" onClick={() => startAddObjective(goal.id)} className="text-tiffany font-bold hover:underline flex items-center justify-center gap-1 mx-auto"><Plus size={16}/> Add Objective</button>
                             </div>
                        )}

                        {goalObjectives.map((obj, idx) => {
                             const objData = dataPoints
                                .filter(dp => dp.objectiveId === obj.id)
                                .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                                .map(dp => ({
                                    ...dp,
                                    displayDate: new Date(dp.date).toLocaleDateString(undefined, { month: 'numeric', day: 'numeric' })
                                }));
                             
                             const objColor = COLORS[idx % COLORS.length];

                             return (
                                 <div key={obj.id} className="border-l-[6px] pl-6 py-2" style={{ borderColor: objColor }}>
                                     <div className="flex justify-between items-start mb-6">
                                         <div>
                                             <h4 className="font-bold text-lg text-coffee-bean flex items-center gap-2">
                                                 <TrendingUp size={20} style={{ color: objColor }} />
                                                 {obj.title}
                                                 {obj.hasSecondaryMetric && <span className="text-xs text-red-400 font-normal bg-red-50 px-2 py-0.5 rounded-full border border-red-100"> + {obj.secondaryMetricName}</span>}
                                             </h4>
                                             <p className="text-coffee-roast text-sm mt-1">{obj.description}</p>
                                             <div className="flex flex-wrap gap-3 mt-3 text-xs font-semibold text-coffee-roast items-center">
                                                <span className="bg-latte px-3 py-1 rounded-full border border-coffee-light/20">
                                                    Target: {obj.targetComparator === '<=' ? '≤' : '≥'} {obj.targetValue} {obj.unit}
                                                </span>
                                                {obj.masteryCriteria && (
                                                    <span className="bg-honey/20 px-3 py-1 rounded-full border border-honey text-coffee-bean flex items-center gap-1">
                                                        <AlertCircle size={10}/> {obj.masteryCriteria}
                                                    </span>
                                                )}
                                             </div>
                                         </div>
                                         <div className="flex gap-1">
                                             <button type="button" onClick={() => startEditObjective(obj)} className="p-2 text-coffee-light hover:text-tiffany transition-colors"><Edit2 size={16}/></button>
                                             <button 
                                                type="button" 
                                                onClick={(e) => { 
                                                    e.stopPropagation(); 
                                                    onDeleteObjective(obj.id); 
                                                }} 
                                                className="p-2 text-coffee-light hover:text-red-500 relative z-50 transition-colors"
                                             >
                                                <Trash2 size={16} />
                                             </button>
                                         </div>
                                     </div>

                                     {/* Chart - Individual with Dual Axis Support */}
                                     <div className="h-48 bg-paper rounded-2xl p-4 mb-6 relative border border-latte shadow-inner">
                                        {objData.length > 0 ? (
                                            <ResponsiveContainer width="100%" height="100%">
                                                <ComposedChart data={objData}>
                                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EFEBE9" />
                                                    <XAxis dataKey="displayDate" fontSize={10} tick={{fill: '#8D6E63'}} axisLine={false} tickLine={false} />
                                                    
                                                    {/* Primary Y Axis (Left) */}
                                                    <YAxis yAxisId="left" fontSize={10} domain={['dataMin - 5', 'dataMax + 5']} tick={{fill: '#8D6E63'}} axisLine={false} tickLine={false} />
                                                    
                                                    {/* Secondary Y Axis (Right) - only if needed */}
                                                    {obj.hasSecondaryMetric && (
                                                        <YAxis yAxisId="right" orientation="right" fontSize={10} stroke="#EF4444" tick={{fill: '#EF4444'}} axisLine={false} tickLine={false} />
                                                    )}

                                                    <Tooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}} />
                                                    <Legend wrapperStyle={{fontSize: '12px'}}/>
                                                    
                                                    {/* Target Line */}
                                                    <ReferenceLine yAxisId="left" y={obj.targetValue} stroke={objColor} strokeDasharray="3 3" label={{ value: 'Target', position: 'insideTopLeft', fontSize: 10, fill: objColor }}/>
                                                    
                                                    {/* Primary Metric Line */}
                                                    <Line yAxisId="left" type="monotone" dataKey="value" name={obj.unit} stroke={objColor} strokeWidth={3} dot={{r:3, fill: objColor, stroke: '#fff'}} activeDot={{r:5}} />

                                                    {/* Secondary Metric Bar */}
                                                    {obj.hasSecondaryMetric && (
                                                        <Bar yAxisId="right" dataKey="secondaryValue" name={obj.secondaryMetricName} fill="#EF4444" barSize={20} fillOpacity={0.5} radius={[4, 4, 0, 0]} />
                                                    )}

                                                </ComposedChart>
                                            </ResponsiveContainer>
                                        ) : <div className="h-full flex items-center justify-center text-xs text-coffee-light">No Data Logged</div>}

                                        {objData.length > 0 && (
                                            <button type="button" onClick={() => setShowHistoryFor(showHistoryFor === obj.id ? null : obj.id)} className="absolute top-3 right-3 p-1.5 bg-white rounded-lg shadow-sm border border-latte text-coffee-roast text-xs flex gap-1 items-center hover:bg-latte"><History size={12}/> History</button>
                                        )}
                                     </div>

                                     {/* History Panel */}
                                     {showHistoryFor === obj.id && (
                                         <div className="bg-cream border border-coffee-light/20 p-4 rounded-xl mb-4 text-sm max-h-40 overflow-y-auto shadow-inner">
                                             {objData.slice().reverse().map(dp => (
                                                 <div key={dp.id} className="flex justify-between items-center py-2 border-b border-coffee-light/20 last:border-0">
                                                     <div className="flex gap-3 items-center">
                                                         <span className="font-bold text-coffee-bean">{dp.displayDate}</span>
                                                         <span className="font-bold bg-white px-2 py-0.5 rounded border border-latte" style={{ color: objColor }}>{dp.value} {obj.unit}</span>
                                                         {dp.secondaryValue !== undefined && (
                                                             <span className="text-red-500 font-bold bg-white px-2 py-0.5 rounded border border-red-50">{dp.secondaryValue} {obj.secondaryMetricName}</span>
                                                         )}
                                                         <span className="text-coffee-roast italic truncate w-32 text-xs">{dp.notes}</span>
                                                     </div>
                                                     <button 
                                                        type="button"
                                                        onClick={(e) => { 
                                                            e.stopPropagation();
                                                            onDeleteDataPoint(dp.id); 
                                                        }} 
                                                        className="text-coffee-light hover:text-red-500 relative z-50"
                                                     >
                                                        <Trash2 size={14} />
                                                     </button>
                                                 </div>
                                             ))}
                                         </div>
                                     )}

                                     {/* Data Entry - Dual Input support */}
                                     {showDataForm === obj.id ? (
                                         <form onSubmit={(e) => handleSaveData(e, obj.id)} className="bg-honey/10 border border-honey/30 p-4 rounded-2xl flex flex-wrap gap-3 items-end shadow-sm">
                                             <div className="w-32">
                                                 <label className="text-[10px] font-bold text-coffee-roast uppercase mb-1 block">Date</label>
                                                 <input type="date" required value={dataDate} onChange={e => setDataDate(e.target.value)} className="w-full p-2 rounded-lg text-sm bg-white text-coffee-bean border border-honey/30 focus:outline-none focus:border-honey"/>
                                             </div>
                                             
                                             {/* Primary Value */}
                                             <div className="w-24">
                                                 <label className="text-[10px] font-bold text-coffee-roast truncate block mb-1" title={obj.unit || "Value"}>{obj.unit || "Value"}</label>
                                                 <input type="number" required value={dataVal} onChange={e => setDataVal(e.target.value)} className="w-full p-2 rounded-lg text-sm bg-white text-coffee-bean border border-honey/30 focus:outline-none focus:border-honey"/>
                                             </div>

                                             {/* Secondary Value (if enabled) */}
                                             {obj.hasSecondaryMetric && (
                                                 <div className="w-24">
                                                     <label className="text-[10px] font-bold text-red-800 truncate block mb-1" title={obj.secondaryMetricName}>{obj.secondaryMetricName}</label>
                                                     <input type="number" required value={dataSecVal} onChange={e => setDataSecVal(e.target.value)} className="w-full p-2 rounded-lg text-sm bg-white text-coffee-bean border border-red-200 focus:outline-none focus:border-red-400"/>
                                                 </div>
                                             )}

                                             <div className="flex-1 min-w-[150px]">
                                                 <label className="text-[10px] font-bold text-coffee-roast uppercase mb-1 block">Notes</label>
                                                 <input type="text" value={dataNotes} onChange={e => setDataNotes(e.target.value)} className="w-full p-2 rounded-lg text-sm bg-white text-coffee-bean border border-honey/30 focus:outline-none focus:border-honey"/>
                                             </div>
                                             <div className="flex gap-2">
                                                 <button type="submit" className="bg-honey text-coffee-bean px-4 py-2 rounded-lg text-sm font-bold shadow-sm hover:bg-opacity-80">Save</button>
                                                 <button type="button" onClick={() => setShowDataForm(null)} className="text-coffee-roast text-xs px-2 hover:underline">Cancel</button>
                                             </div>
                                         </form>
                                     ) : (
                                         <button type="button" onClick={() => setShowDataForm(obj.id)} className="w-full py-3 border border-dashed border-coffee-light rounded-xl text-coffee-roast text-sm hover:border-tiffany hover:text-tiffany hover:bg-tiffany/5 flex justify-center items-center gap-1 transition-colors"><Plus size={16}/> Log New Data</button>
                                     )}
                                 </div>
                             );
                        })}
                        
                        {/* Footer of Goal Card - Add Objective Button */}
                        <div className="border-t border-latte pt-6 mt-4 flex justify-center">
                            <button type="button" onClick={() => startAddObjective(goal.id)} className="text-coffee-roast font-bold text-sm flex items-center gap-2 hover:text-tiffany transition-colors">
                                <Plus size={16} /> Add Another Objective to this Goal
                            </button>
                        </div>
                    </div>
                </div>
            );
        })}
      </div>
    </div>
  );
};

export default GoalTracker;