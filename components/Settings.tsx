import React, { useRef } from 'react';
import { AppState } from '../types';
import { Download, Upload, AlertTriangle } from 'lucide-react';
import { saveState } from '../services/storage';

interface SettingsProps {
  appState: AppState;
  onImport: (data: AppState) => void;
}

const Settings: React.FC<SettingsProps> = ({ appState, onImport }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    const dataStr = JSON.stringify(appState, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `sprout_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        // Basic validation
        if (Array.isArray(json.students) && Array.isArray(json.goals)) {
          onImport(json);
          alert("Data merged successfully!");
        } else {
          alert("Invalid file format.");
        }
      } catch (err) {
        alert("Error parsing JSON");
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-3xl font-friendly font-bold text-slate-800 mb-2">Data & Settings</h2>
      <p className="text-slate-500 mb-8">Manage your data securely. No data is sent to the cloud (except specifically for report generation).</p>

      <div className="grid gap-6">
        {/* Export Card */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <div className="flex items-start gap-4">
                <div className="p-3 bg-blue-100 text-blue-600 rounded-lg">
                    <Download size={24} />
                </div>
                <div>
                    <h3 className="font-bold text-lg text-slate-800">Backup / Share Data</h3>
                    <p className="text-slate-500 text-sm mb-4">
                        Download all students, goals, and data points as a JSON file. 
                        You can send this file to a paraprofessional to add data, or keep it as a backup.
                    </p>
                    <button 
                        onClick={handleExport}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-blue-700 transition-colors"
                    >
                        Download JSON
                    </button>
                </div>
            </div>
        </div>

        {/* Import Card */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <div className="flex items-start gap-4">
                <div className="p-3 bg-green-100 text-green-600 rounded-lg">
                    <Upload size={24} />
                </div>
                <div>
                    <h3 className="font-bold text-lg text-slate-800">Import / Merge Data</h3>
                    <p className="text-slate-500 text-sm mb-4">
                        Load a JSON file. <strong className="text-green-700">This will add to your existing data.</strong> 
                        It will not delete your current students. Use this to merge data collected by others.
                    </p>
                    <input 
                        type="file" 
                        accept=".json"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        className="hidden"
                    />
                    <button 
                         onClick={() => fileInputRef.current?.click()}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-green-700 transition-colors"
                    >
                        Select JSON File to Merge
                    </button>
                </div>
            </div>
        </div>

        <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-200 flex items-center gap-3">
            <AlertTriangle className="text-yellow-600" />
            <p className="text-xs text-yellow-800">
                <strong>Privacy Note:</strong> All data is stored in your browser's Local Storage. 
                Clearing your browser cache will remove this data unless you have a JSON backup.
            </p>
        </div>
      </div>
    </div>
  );
};

export default Settings;