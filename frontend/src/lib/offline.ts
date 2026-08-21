export interface OfflineReport {
  id: string;
  payload: any;
  timestamp: number;
  status: 'pending' | 'syncing' | 'synced' | 'failed';
  retryCount: number;
}

// Simple fallback mock since we can't install idb dynamically easily
// In a real app, you'd use the 'idb' package
const STORE_NAME = 'smart-civic-offline';

export const initOfflineDB = async () => {
  if (typeof window === 'undefined') return;
  // Initialize localStorage as fallback for IDB in this demo
  if (!localStorage.getItem(STORE_NAME)) {
    localStorage.setItem(STORE_NAME, JSON.stringify([]));
  }
};

export const saveOfflineReport = async (report: any) => {
  const reports = getPendingReports();
  const offlineReport: OfflineReport = {
    id: `off-${Date.now()}`,
    payload: report,
    timestamp: Date.now(),
    status: 'pending',
    retryCount: 0
  };
  reports.push(offlineReport);
  localStorage.setItem(STORE_NAME, JSON.stringify(reports));
  return offlineReport;
};

export const getPendingReports = (): OfflineReport[] => {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(STORE_NAME);
  return data ? JSON.parse(data) : [];
};

export const getOfflineCount = (): number => {
  return getPendingReports().filter(r => r.status === 'pending').length;
};

export const syncOfflineReports = async () => {
  if (typeof window === 'undefined') return;
  const reports = getPendingReports();
  let updated = false;

  for (let i = 0; i < reports.length; i++) {
    if (reports[i].status === 'pending') {
      try {
        reports[i].status = 'syncing';
        // Simulate API call
        await new Promise(res => setTimeout(res, 500));
        reports[i].status = 'synced';
        updated = true;
      } catch (e) {
        reports[i].status = 'failed';
        reports[i].retryCount += 1;
        updated = true;
      }
    }
  }
  
  if (updated) {
    const remaining = reports.filter(r => r.status !== 'synced');
    localStorage.setItem(STORE_NAME, JSON.stringify(remaining));
  }
};

export const registerSyncListener = () => {
  if (typeof window !== 'undefined') {
    window.addEventListener('online', syncOfflineReports);
  }
};
