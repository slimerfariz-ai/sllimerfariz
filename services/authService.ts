import { BU_BANTEN_SUPERVISORS, BUBantenSupervisor, normalizeSpvName } from '../data/buBantenStores';

export interface AuthUser {
  nik: string;
  name: string;
  jabatan: string;
  homeBase: string;
  phone?: string;
  totalStore?: number;
  loginAt: string;
  isAreaManager?: boolean;
}

const STORAGE_AUTH_USER_KEY = 'lp_auth_current_user_v1';
const STORAGE_REMEMBER_NIK_KEY = 'lp_auth_remember_nik_v1';
const STORAGE_CUSTOM_PASSWORDS_PREFIX = 'lp_auth_pwd_';

/**
 * Cari data LP Supervisor berdasarkan NIK (case-insensitive & trim)
 */
export const findSupervisorByNik = (nikInput: string): BUBantenSupervisor | undefined => {
  if (!nikInput) return undefined;
  const clean = nikInput.trim().toUpperCase();
  return BU_BANTEN_SUPERVISORS.find(s => s.nik.trim().toUpperCase() === clean);
};

/**
 * Ambil NIK yang disimpan untuk fitur "Ingat NIK saya"
 */
export const getRememberedNik = (): string => {
  try {
    return localStorage.getItem(STORAGE_REMEMBER_NIK_KEY) || '';
  } catch {
    return '';
  }
};

/**
 * Simpan atau hapus NIK yang diingat
 */
export const setRememberedNik = (nik: string, remember: boolean): void => {
  try {
    if (remember && nik) {
      localStorage.setItem(STORAGE_REMEMBER_NIK_KEY, nik.trim().toUpperCase());
    } else {
      localStorage.removeItem(STORAGE_REMEMBER_NIK_KEY);
    }
  } catch {
    // ignore
  }
};

/**
 * Ambil session user aktif saat ini
 */
export const getCurrentUser = (): AuthUser | null => {
  try {
    const raw = localStorage.getItem(STORAGE_AUTH_USER_KEY);
    if (!raw) return null;
    const user = JSON.parse(raw) as AuthUser;
    if (user && user.nik && user.name) {
      return user;
    }
    return null;
  } catch {
    return null;
  }
};

/**
 * Simpan user login ke session storage & localStorage
 */
export const saveCurrentUser = (user: AuthUser): void => {
  try {
    localStorage.setItem(STORAGE_AUTH_USER_KEY, JSON.stringify(user));
  } catch (err) {
    console.error('Gagal menyimpan sesi login:', err);
  }
};

/**
 * Logout & bersihkan session aktif
 */
export const logout = (): void => {
  try {
    localStorage.removeItem(STORAGE_AUTH_USER_KEY);
  } catch {
    // ignore
  }
};

/**
 * Verifikasi kata sandi untuk NIK tertentu
 */
const verifyPassword = (cleanNik: string, passwordInput: string): boolean => {
  const pwd = passwordInput.trim();
  if (!pwd) return false;

  // 1. Cek apakah ada custom password tersimpan di browser
  try {
    const customPwd = localStorage.getItem(`${STORAGE_CUSTOM_PASSWORDS_PREFIX}${cleanNik}`);
    if (customPwd && customPwd === pwd) {
      return true;
    }
  } catch {
    // ignore
  }

  // 2. Password default yang diterima:
  // - NIK itu sendiri (misal: 094826 atau E04309)
  if (pwd.toUpperCase() === cleanNik) {
    return true;
  }

  // - Master/default passwords standar operasional
  const defaultMasterPasswords = [
    'lp123456',
    'LP123456',
    'banten123',
    'BANTEN123',
    'admin123',
    'ADMIN123',
    '123456',
  ];

  if (defaultMasterPasswords.includes(pwd)) {
    return true;
  }

  return false;
};

/**
 * Fungsi Login dengan NIK dan Password
 */
export const loginWithNikAndPassword = async (
  nikInput: string,
  passwordInput: string,
  rememberMe: boolean = true
): Promise<AuthUser> => {
  const cleanNik = (nikInput || '').trim().toUpperCase();
  const cleanPassword = (passwordInput || '').trim();

  if (!cleanNik) {
    throw new Error('Silakan masukkan NIK.');
  }

  if (cleanNik.length < 3) {
    throw new Error('NIK tidak valid (minimal 3-4 karakter).');
  }

  if (!cleanPassword) {
    throw new Error('Silakan masukkan password.');
  }

  // Cari di daftar resmi LP Supervisor BU Banten
  const spv = findSupervisorByNik(cleanNik);

  if (!verifyPassword(cleanNik, cleanPassword)) {
    throw new Error('Password salah. Silakan coba lagi.');
  }

  const isAreaManager = cleanNik === '101402' || (spv && spv.jabatan.includes('AREA MANAGER'));

  const authUser: AuthUser = {
    nik: cleanNik,
    name: spv ? spv.name : `Karyawan LP (${cleanNik})`,
    jabatan: spv ? spv.jabatan : 'LP SUPERVISOR',
    homeBase: spv ? spv.homeBase : 'AREA BANTEN',
    phone: spv?.phone,
    totalStore: spv?.totalStore,
    loginAt: new Date().toISOString(),
    isAreaManager: !!isAreaManager,
  };

  saveCurrentUser(authUser);
  setRememberedNik(cleanNik, rememberMe);

  return authUser;
};

/**
 * Simpan password baru jika pengguna ingin mengubah kata sandi
 */
export const updateSupervisorPassword = (nik: string, oldPassword: string, newPassword: string): void => {
  const cleanNik = nik.trim().toUpperCase();
  if (!verifyPassword(cleanNik, oldPassword)) {
    throw new Error('Password lama tidak sesuai.');
  }
  if (!newPassword || newPassword.trim().length < 4) {
    throw new Error('Password baru minimal 4 karakter.');
  }

  try {
    localStorage.setItem(`${STORAGE_CUSTOM_PASSWORDS_PREFIX}${cleanNik}`, newPassword.trim());
  } catch {
    throw new Error('Gagal menyimpan password baru.');
  }
};
