import { Student, Goal, Objective, DataPoint } from "../types";

// Helper to analyze a single objective's status
export const analyzeObjective = (obj: Objective, dataPoints: DataPoint[]) => {
    const objData = dataPoints
        .filter(dp => dp.objectiveId === obj.id)
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    const latest = objData.length > 0 ? objData[objData.length - 1] : null;
    const startValue = obj.baselineValue;
    const targetValue = obj.targetValue;
    const comparator = obj.targetComparator || '>=';
    
    // Format current status
    let currentStatus = "No data";
    let currentSecondary = "";
    
    if (latest) {
        currentStatus = `${latest.value} ${obj.unit}`;
        if (latest.secondaryValue !== undefined && obj.hasSecondaryMetric) {
            currentSecondary = `${latest.secondaryValue} ${obj.secondaryMetricName}`;
        }
    }
    
    const dateStr = latest ? new Date(latest.date).toLocaleDateString() : "";
    const comparatorText = comparator === '<=' ? 'At most' : 'At least';
    const criteriaText = obj.masteryCriteria ? `Criteria: ${obj.masteryCriteria}` : "";

    // Analysis Logic
    let statusText = "Data collection in progress.";
    let statusColor = "text-slate-600"; // Neutral

    if (latest && typeof latest.value === 'number') {
        const aimingHigh = comparator === '>=';
        
        const metTarget = aimingHigh ? latest.value >= targetValue : latest.value <= targetValue;
        const madeProgress = aimingHigh ? latest.value > startValue : latest.value < startValue;

        if (metTarget) {
            statusText = "Target Met.";
            statusColor = "text-green-700 font-bold";
        }
        else if (madeProgress) {
            statusText = "Making progress toward goal.";
            statusColor = "text-blue-700";
        }
        else if (latest.value === startValue) {
            statusText = "Maintained baseline.";
            statusColor = "text-slate-600";
        }
        else {
            statusText = "Needs attention.";
            statusColor = "text-red-600 font-bold";
        }
    }

    return {
        objData,
        latest,
        currentStatus,
        currentSecondary,
        dateStr,
        comparatorText,
        criteriaText,
        statusText,
        statusColor
    };
};

export const generateReport = (
  student: Student,
  goals: Goal[],
  objectives: Objective[],
  dataPoints: DataPoint[]
): string => {
  const reportDate = new Date().toLocaleDateString();
  
  let report = `## IEP Progress Report\n`;
  report += `**Student:** ${student.name}  \n`;
  report += `**Grade:** ${student.grade}  \n`;
  report += `**Date:** ${reportDate}  \n\n`;
  
  if (goals.length === 0) {
    report += `*No goals recorded.*\n`;
    return report;
  }

  goals.forEach((goal, index) => {
      report += `### Goal ${index + 1} (${goal.category || 'General'})\n`;
      report += `> **${goal.description}**\n\n`;
      
      if (goal.presentLevel) {
          report += `**Present Levels:** ${goal.presentLevel}\n\n`;
      }

      const goalObjectives = objectives.filter(o => o.goalId === goal.id);

      if (goalObjectives.length === 0) {
          report += `*No specific objectives recorded for this goal.*\n\n`;
      } else {
          goalObjectives.forEach(obj => {
            const analysis = analyzeObjective(obj, dataPoints);
            
            let statusString = `${analysis.currentStatus}`;
            if (analysis.currentSecondary) statusString += ` (with ${analysis.currentSecondary})`;

            report += `*   **${obj.title}**\n`;
            report += `    *   *Measure:* ${obj.description}\n`;
            report += `    *   *Target:* ${analysis.comparatorText} ${obj.targetValue} ${obj.unit} ${analysis.criteriaText ? `| ${analysis.criteriaText}` : ""} | *Current:* ${statusString} (${analysis.dateStr})\n`;
            report += `    *   *Status:* **${analysis.statusText}**\n`;
          });
      }
      report += `\n---\n`;
  });
  
  return report;
};