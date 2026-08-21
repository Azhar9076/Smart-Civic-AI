import { saveOfflineReport } from './offline';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

export const submitCase = async (formData: FormData) => {
  try {
    // Mock successful submission for demo
    await new Promise(res => setTimeout(res, 1000));
    return { id: `CASE-${Math.floor(Math.random() * 10000)}`, status: 'submitted' };
  } catch (error) {
    // If network fails, save offline
    const plainData = Object.fromEntries(formData.entries());
    await saveOfflineReport(plainData);
    throw new Error('Offline');
  }
};

export const getCase = async (id: string) => {
  await new Promise(res => setTimeout(res, 500));
  // Return mock case detail
  return {
    id,
    category: 'Road Damage',
    severity: 4,
    priorityScore: 88,
    status: 'in_progress',
    ward: 'Ward 14',
    coordinates: { lat: 19.076, lng: 72.8777 },
    slaDueAt: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // 2 hours from now
    events: [
      { stage: 'Report Submitted', timestamp: new Date(Date.now() - 3600000).toISOString(), status: 'completed' },
      { stage: 'AI Understanding', runtime: '1.2s', status: 'completed' },
      { stage: 'Location Confirmed', status: 'completed' },
      { stage: 'Priority Calculated', details: 'Score: 88 (Critical)', status: 'completed' },
      { stage: 'Department Assigned', details: 'Roads & Bridges Dept', status: 'completed' },
      { stage: 'Work In Progress', status: 'current' },
      { stage: 'Resolution Evidence', status: 'future' },
      { stage: 'Citizen Verification', status: 'future' },
    ]
  };
};

export const submitVerification = async (id: string, accept: boolean, feedback: string) => {
  await new Promise(res => setTimeout(res, 800));
  return { success: true };
};

export const getDashboardStats = async () => {
  return {
    activeCases: 142,
    criticalPriority: 18,
    resolvedToday: 89,
    slaAtRisk: 12,
    verificationPending: 45
  };
};
