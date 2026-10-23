import { signInWithPopup, GoogleAuthProvider, onAuthStateChanged, User, signOut } from 'firebase/auth';
import { auth, saveGoogleDriveConfig, getGoogleDriveConfig } from './firebase';

export { auth };

export const TARGET_GDRIVE_EMAIL = 'lpdareabanten@gmail.com';
const STORAGE_TOKEN_KEY = 'gdrive_shared_access_token';
const STORAGE_TOKEN_EXPIRY = 'gdrive_token_expires_at';
const STORAGE_WEBHOOK_KEY = 'gdrive_apps_script_webhook_url';

const provider = new GoogleAuthProvider();
provider.addScope('https://www.googleapis.com/auth/spreadsheets');
provider.addScope('https://www.googleapis.com/auth/drive.file');

// In-memory token caching
let cachedAccessToken: string | null = null;
let isSigningIn = false;

export const initAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      if (cachedAccessToken) {
        if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
      } else {
        // Coba periksa token tersimpan lokal
        const localToken = getStoredLocalToken();
        if (localToken) {
          cachedAccessToken = localToken;
          if (onAuthSuccess) onAuthSuccess(user, localToken);
        } else if (!isSigningIn) {
          if (onAuthFailure) onAuthFailure();
        }
      }
    } else {
      if (onAuthFailure) onAuthFailure();
    }
  });
};

export const googleSignIn = async (): Promise<{ user: User; accessToken: string } | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Gagal mendapatkan access token Google Workspace.');
    }
    
    cachedAccessToken = credential.accessToken;
    const expiryTime = Date.now() + 3500 * 1000; // ~1 jam

    // Simpan token lokal untuk sinkronisasi otomatis tanpa popup
    try {
      localStorage.setItem(STORAGE_TOKEN_KEY, credential.accessToken);
      localStorage.setItem(STORAGE_TOKEN_EXPIRY, String(expiryTime));
      localStorage.setItem('gdrive_connected_email', result.user.email || TARGET_GDRIVE_EMAIL);
    } catch (e) {
      // ignore
    }

    // Bagikan token ke Firestore agar seluruh anggota/inspektor bisa upload ke Google Drive LP Area Banten tanpa login
    try {
      await saveGoogleDriveConfig({
        userEmail: result.user.email || TARGET_GDRIVE_EMAIL,
        accessToken: credential.accessToken,
        expiresAt: expiryTime,
        updatedAt: new Date().toISOString(),
      });
    } catch (err) {
      console.warn("Gagal menyimpan shared token ke Firestore:", err);
    }

    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    console.error('Sign in with Google error:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const getAccessToken = async (): Promise<string | null> => {
  return cachedAccessToken;
};

function getStoredLocalToken(): string | null {
  try {
    const token = localStorage.getItem(STORAGE_TOKEN_KEY);
    const expiry = localStorage.getItem(STORAGE_TOKEN_EXPIRY);
    if (token) {
      if (expiry && Number(expiry) > Date.now()) {
        return token;
      }
      // Jika belum ada expiry atau belum expired
      return token;
    }
  } catch (e) {
    // ignore
  }
  return null;
}

/**
 * Mendapatkan token efektif secara diam-diam (tanpa popup login):
 * 1. Cek memory
 * 2. Cek localStorage
 * 3. Cek Firestore (token bersama yang disimpan Fariz)
 */
export const getEffectiveDriveToken = async (): Promise<string | null> => {
  if (cachedAccessToken) return cachedAccessToken;

  const localToken = getStoredLocalToken();
  if (localToken) {
    cachedAccessToken = localToken;
    return localToken;
  }

  // Coba ambil token bersama dari Cloud Firestore
  try {
    const remoteConfig = await getGoogleDriveConfig();
    if (remoteConfig?.accessToken) {
      // Cek apakah belum kadaluarsa
      if (!remoteConfig.expiresAt || remoteConfig.expiresAt > Date.now()) {
        cachedAccessToken = remoteConfig.accessToken;
        try {
          localStorage.setItem(STORAGE_TOKEN_KEY, remoteConfig.accessToken);
          if (remoteConfig.expiresAt) {
            localStorage.setItem(STORAGE_TOKEN_EXPIRY, String(remoteConfig.expiresAt));
          }
        } catch (e) {}
        return remoteConfig.accessToken;
      }
    }
  } catch (err) {
    console.warn("Gagal mengambil shared token dari Firestore:", err);
  }

  return null;
};

export const getStoredWebhookUrl = (): string | null => {
  try {
    return localStorage.getItem(STORAGE_WEBHOOK_KEY);
  } catch {
    return null;
  }
};

export const getEffectiveWebhookUrl = async (): Promise<string | null> => {
  const local = getStoredWebhookUrl();
  if (local) return local;

  try {
    const remote = await getGoogleDriveConfig();
    if (remote?.appsScriptWebhookUrl) {
      try {
        localStorage.setItem(STORAGE_WEBHOOK_KEY, remote.appsScriptWebhookUrl);
      } catch {}
      return remote.appsScriptWebhookUrl;
    }
  } catch (err) {
    console.warn("Gagal membaca webhook Google Drive dari Firestore:", err);
  }
  return null;
};

export const saveStoredWebhookUrl = async (url: string): Promise<void> => {
  try {
    localStorage.setItem(STORAGE_WEBHOOK_KEY, url.trim());
    await saveGoogleDriveConfig({ 
      userEmail: TARGET_GDRIVE_EMAIL,
      appsScriptWebhookUrl: url.trim() 
    });
  } catch (e) {
    console.warn("Gagal menyimpan webhook url:", e);
  }
};

export const logout = async () => {
  await signOut(auth);
  cachedAccessToken = null;
  try {
    localStorage.removeItem(STORAGE_TOKEN_KEY);
    localStorage.removeItem(STORAGE_TOKEN_EXPIRY);
  } catch (e) {}
};

