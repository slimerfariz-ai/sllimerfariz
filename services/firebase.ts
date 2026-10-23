import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDocs, 
  deleteDoc, 
  collection, 
  query, 
  orderBy, 
  onSnapshot, 
  getDocFromServer 
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';
import { DailyReport } from '../types';

export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);

// Error Handling conforming strictly to SKILL.md FirestoreErrorInfo specification
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid || null,
      email: auth.currentUser?.email || null,
      emailVerified: auth.currentUser?.emailVerified || null,
      isAnonymous: auth.currentUser?.isAnonymous || null,
      tenantId: auth.currentUser?.tenantId || null,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Test connection on boot according to SKILL.md guidelines
export async function testConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn("Client is offline, using cached local data.");
    } else {
      console.info("Firestore connection check initiated.");
    }
    return false;
  }
}

// Run test connection
testConnection();

const REPORTS_COLLECTION = 'inspection_reports';

/**
 * Clean data for Firestore persistence (strip undefined values)
 */
function sanitizeReportForFirestore(report: DailyReport): Record<string, any> {
  const sanitized: Record<string, any> = {
    id: String(report.id),
    date: report.date || new Date().toISOString(),
    store: report.store || 'Unknown Store',
    nik: report.nik || '-',
    complianceScore: Number(report.complianceScore ?? 0),
    items: (report.items || []).map(item => ({
      id: item.id,
      category: item.category,
      label: item.label,
      status: item.status || 'NA',
      comment: item.comment || '',
      inputType: item.inputType || 'status',
      value: item.value || '',
      photo: item.photo || null
    })),
    observations: (report.observations || []).map(obs => ({
      id: obs.id,
      description: obs.description || '',
      severity: obs.severity || 'Medium',
      location: obs.location || '',
      timestamp: obs.timestamp || '',
      photo: obs.photo || null
    })),
    updatedAt: new Date().toISOString()
  };

  if (report.lpSupervisor) sanitized.lpSupervisor = report.lpSupervisor;
  if (report.inspectorName) sanitized.inspectorName = report.inspectorName;
  if (report.shift) sanitized.shift = report.shift;
  if (report.aiSummary) sanitized.aiSummary = report.aiSummary;
  if (report.googleSpreadsheetUrl) sanitized.googleSpreadsheetUrl = report.googleSpreadsheetUrl;
  if (report.googleSpreadsheetId) sanitized.googleSpreadsheetId = report.googleSpreadsheetId;
  if (report.googleDriveFolderUrl) sanitized.googleDriveFolderUrl = report.googleDriveFolderUrl;
  if (report.googleDriveFileUrl) sanitized.googleDriveFileUrl = report.googleDriveFileUrl;
  if (report.uploadedToDriveAt) sanitized.uploadedToDriveAt = report.uploadedToDriveAt;
  if (report.googleDriveSyncStatus) sanitized.googleDriveSyncStatus = report.googleDriveSyncStatus;
  if (report.googleDriveSyncError) sanitized.googleDriveSyncError = report.googleDriveSyncError;
  if (auth.currentUser?.uid) sanitized.userId = auth.currentUser.uid;
  if (!report.createdAt) sanitized.createdAt = new Date().toISOString();
  else sanitized.createdAt = report.createdAt;

  return sanitized;
}

/**
 * Save or update report in Firestore database
 */
export async function saveReportToFirestore(report: DailyReport): Promise<void> {
  const docRef = doc(db, REPORTS_COLLECTION, report.id);
  const data = sanitizeReportForFirestore(report);

  try {
    await setDoc(docRef, data, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${REPORTS_COLLECTION}/${report.id}`);
  }
}

/**
 * Fetch all reports from Firestore database
 */
export async function getReportsFromFirestore(): Promise<DailyReport[]> {
  const colRef = collection(db, REPORTS_COLLECTION);

  try {
    const snapshot = await getDocs(colRef);
    const reports: DailyReport[] = [];
    snapshot.forEach(docSnap => {
      reports.push(docSnap.data() as DailyReport);
    });
    reports.sort((a, b) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime());
    return reports;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, REPORTS_COLLECTION);
  }
}

/**
 * Real-time subscription to reports in Firestore
 */
export function subscribeToReportsFromFirestore(
  onUpdate: (reports: DailyReport[]) => void,
  onError?: (error: Error) => void
): () => void {
  const colRef = collection(db, REPORTS_COLLECTION);

  return onSnapshot(
    colRef,
    (snapshot) => {
      const reports: DailyReport[] = [];
      snapshot.forEach(docSnap => {
        reports.push(docSnap.data() as DailyReport);
      });
      reports.sort((a, b) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime());
      onUpdate(reports);
    },
    (error) => {
      console.error("Firestore onSnapshot error:", error);
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.LIST, REPORTS_COLLECTION);
    }
  );
}

/**
 * Delete a report from Firestore database
 */
export async function deleteReportFromFirestore(reportId: string): Promise<void> {
  const docRef = doc(db, REPORTS_COLLECTION, reportId);
  try {
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${REPORTS_COLLECTION}/${reportId}`);
  }
}

/**
 * Clear/delete all reports from Firestore database
 */
export async function clearAllReportsFromFirestore(): Promise<void> {
  const colRef = collection(db, REPORTS_COLLECTION);
  try {
    const snapshot = await getDocs(colRef);
    const deletePromises: Promise<void>[] = [];
    snapshot.forEach((docSnap) => {
      deletePromises.push(deleteDoc(docSnap.ref));
    });
    await Promise.all(deletePromises);
  } catch (error) {
    console.warn("Gagal mengosongkan laporan Firestore:", error);
  }
}

export interface GoogleDriveSystemConfig {
  userEmail: string;
  accessToken?: string | null;
  expiresAt?: number | null;
  folderId?: string | null;
  folderUrl?: string | null;
  appsScriptWebhookUrl?: string | null;
  updatedAt?: string | null;
}

const SETTINGS_COLLECTION = 'system_settings';
const G_DRIVE_CONFIG_DOC = 'google_drive_config';

export async function saveGoogleDriveConfig(config: Partial<GoogleDriveSystemConfig>): Promise<void> {
  const docRef = doc(db, SETTINGS_COLLECTION, G_DRIVE_CONFIG_DOC);
  try {
    await setDoc(docRef, { ...config, updatedAt: new Date().toISOString() }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${SETTINGS_COLLECTION}/${G_DRIVE_CONFIG_DOC}`);
  }
}

export async function getGoogleDriveConfig(): Promise<GoogleDriveSystemConfig | null> {
  const docRef = doc(db, SETTINGS_COLLECTION, G_DRIVE_CONFIG_DOC);
  try {
    const docSnap = await getDocFromServer(docRef).catch(() => null);
    if (docSnap && docSnap.exists()) {
      return docSnap.data() as GoogleDriveSystemConfig;
    }
    return null;
  } catch (error) {
    console.warn("Could not fetch remote Google Drive config, using local:", error);
    return null;
  }
}

export function subscribeToGoogleDriveConfig(
  onUpdate: (config: GoogleDriveSystemConfig | null) => void
): () => void {
  const docRef = doc(db, SETTINGS_COLLECTION, G_DRIVE_CONFIG_DOC);
  return onSnapshot(
    docRef,
    (snapshot) => {
      if (snapshot.exists()) {
        onUpdate(snapshot.data() as GoogleDriveSystemConfig);
      } else {
        onUpdate(null);
      }
    },
    (err) => {
      console.warn("Snapshot Google Drive config warning:", err);
    }
  );
}

