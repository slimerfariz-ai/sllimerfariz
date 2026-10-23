import { DailyReport, InspectionStatus } from '../types';
import { getEffectiveDriveToken, getStoredWebhookUrl, getEffectiveWebhookUrl, TARGET_GDRIVE_EMAIL } from './googleAuth';
import { uploadInspectionToGoogleSheets } from './googleSheetsService';

export interface DriveFolderResult {
  id: string;
  name: string;
  webViewLink?: string;
}

export interface DriveUploadResult {
  fileId: string;
  fileName: string;
  webViewLink: string;
  folderId?: string;
  folderUrl?: string;
}

const DEFAULT_FOLDER_NAME = 'Laporan Inspeksi LP BU Banten';

/**
 * Mendapatkan atau membuat folder khusus untuk laporan inspeksi di Google Drive pengguna
 */
export async function getOrCreateInspectionFolder(
  accessToken: string,
  folderName: string = DEFAULT_FOLDER_NAME
): Promise<DriveFolderResult> {
  // 1. Cari folder yang sudah ada
  const query = encodeURIComponent(
    `mimeType = 'application/vnd.google-apps.folder' and name = '${folderName}' and trashed = false`
  );
  const searchUrl = `https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name,webViewLink)&pageSize=1`;

  const searchRes = await fetch(searchUrl, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (searchRes.ok) {
    const data = await searchRes.json();
    if (data.files && data.files.length > 0) {
      const existing = data.files[0];
      return {
        id: existing.id,
        name: existing.name,
        webViewLink: existing.webViewLink || `https://drive.google.com/drive/folders/${existing.id}`,
      };
    }
  }

  // 2. Buat folder baru jika belum ada
  const createRes = await fetch(
    'https://www.googleapis.com/drive/v3/files?fields=id,name,webViewLink',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: folderName,
        mimeType: 'application/vnd.google-apps.folder',
        description: 'Folder penyimpanan otomatis seluruh laporan inspeksi Loss Prevention BU Banten',
      }),
    }
  );

  if (!createRes.ok) {
    const errData = await createRes.json().catch(() => ({}));
    throw new Error(
      errData.error?.message || `Gagal membuat folder di Google Drive (Status: ${createRes.status})`
    );
  }

  const newFolder = await createRes.json();
  return {
    id: newFolder.id,
    name: newFolder.name,
    webViewLink: newFolder.webViewLink || `https://drive.google.com/drive/folders/${newFolder.id}`,
  };
}

/**
 * Pindahkan file Google Sheets / file lain ke folder Google Drive
 */
export async function moveFileToFolder(
  fileId: string,
  folderId: string,
  accessToken: string
): Promise<{ webViewLink?: string }> {
  try {
    const updateRes = await fetch(
      `https://www.googleapis.com/drive/v3/files/${fileId}?addParents=${folderId}&fields=id,parents,webViewLink`,
      {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (updateRes.ok) {
      const data = await updateRes.json();
      return { webViewLink: data.webViewLink };
    }
  } catch (err) {
    console.warn('Gagal memindahkan file ke folder:', err);
  }
  return {};
}

/**
 * Mengunggah berkas ringkasan laporan inspeksi teks/format ke Google Drive
 */
export async function uploadReportSummaryToDrive(
  report: DailyReport,
  accessToken: string,
  folderId?: string
): Promise<DriveUploadResult> {
  const storeName = report.store || 'Toko BU Banten';
  const cleanDate = report.date.replace(/[/\\?%*:|"<>]/g, '-').slice(0, 10);
  const fileName = `Ringkasan LP - ${storeName} - ${cleanDate}.txt`;

  const passCount = report.items.filter((i) => i.status === InspectionStatus.PASS).length;
  const failCount = report.items.filter((i) => i.status === InspectionStatus.FAIL).length;
  const naCount = report.items.filter((i) => i.status === InspectionStatus.NA).length;

  const content = `=====================================================
LAPORAN INSPEKSI LOSS PREVENTION BU BANTEN
=====================================================
Toko/Store: ${report.store || '-'}
Tanggal: ${new Date(report.date).toLocaleDateString('id-ID', { dateStyle: 'full' })}
Nama LP Supervisor: ${report.lpSupervisor || report.shift || '-'}
NIK Supervisor: ${report.nik || '-'}
Skor Kepatuhan (Compliance): ${report.complianceScore}%
Jumlah Temuan Masalah (FAIL): ${failCount}
Item Sesuai (PASS): ${passCount}
Item N/A: ${naCount}
Total Observasi Lapangan: ${report.observations.length}

RINGKASAN & ANALISIS AI:
${report.aiSummary || 'Tidak ada catatan ringkasan otomatis.'}

DAFTAR TEMUAN MASALAH (FAIL):
${
  report.items.filter((i) => i.status === InspectionStatus.FAIL).length > 0
    ? report.items
        .filter((i) => i.status === InspectionStatus.FAIL)
        .map((i, idx) => `${idx + 1}. [${i.category}] ${i.label} -> Catatan: ${i.comment || '-'}`)
        .join('\n')
    : 'Tidak ada temuan checklist FAIL.'
}

TEMUAN OBSERVASI KHUSUS:
${
  report.observations.length > 0
    ? report.observations
        .map(
          (o, idx) =>
            `${idx + 1}. [${o.severity}] Lokasi: ${o.location} (${o.timestamp})\n   Deskripsi: ${o.description}`
        )
        .join('\n')
    : 'Tidak ada observasi khusus.'
}

=====================================================
Tersimpan otomatis ke Google Drive LP BU Banten
=====================================================`;

  // Multipart upload
  const boundary = '-------314159265358979323846';
  const delimiter = `\r\n--${boundary}\r\n`;
  const closeDelimiter = `\r\n--${boundary}--`;

  const metadata: any = {
    name: fileName,
    mimeType: 'text/plain',
    description: `Ringkasan Laporan LP untuk ${storeName} tanggal ${cleanDate}`,
  };

  if (folderId) {
    metadata.parents = [folderId];
  }

  const multipartRequestBody =
    delimiter +
    'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
    JSON.stringify(metadata) +
    delimiter +
    'Content-Type: text/plain; charset=UTF-8\r\n\r\n' +
    content +
    closeDelimiter;

  const uploadRes = await fetch(
    'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': `multipart/related; boundary=${boundary}`,
      },
      body: multipartRequestBody,
    }
  );

  if (!uploadRes.ok) {
    const err = await uploadRes.json().catch(() => ({}));
    throw new Error(err.error?.message || `Gagal mengunggah file ke Google Drive (Status: ${uploadRes.status})`);
  }

  const uploadData = await uploadRes.json();

  return {
    fileId: uploadData.id,
    fileName: uploadData.name,
    webViewLink: uploadData.webViewLink || `https://drive.google.com/file/d/${uploadData.id}/view`,
    folderId,
  };
}

/**
 * Upload laporan via Webhook Google Apps Script (Tanpa login, 24/7)
 */
export async function uploadReportViaWebhook(
  report: DailyReport,
  webhookUrl: string
): Promise<{ spreadsheetUrl: string; folderUrl: string }> {
  const resp = await fetch(webhookUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'text/plain;charset=utf-8',
    },
    body: JSON.stringify({
      targetEmail: TARGET_GDRIVE_EMAIL,
      report,
    }),
  });

  if (!resp.ok) {
    throw new Error(`Webhook Google Drive mengembalikan kode error: ${resp.status}`);
  }

  const data = await resp.json();
  return {
    spreadsheetUrl: data.spreadsheetUrl || data.url || '',
    folderUrl: data.folderUrl || '',
  };
}

/**
 * Otomatis upload hasil inspeksi ke Google Drive (lpdareabanten@gmail.com)
 * TANPA meminta akses login kepada pengguna / petugas inspeksi.
 * 
 * Mekanisme:
 * 1. Menggunakan webhook jika dikonfigurasi (tanpa login & tanpa expire)
 * 2. Menggunakan token bersama (shared token) yang tersimpan di Firestore / cache
 * 3. Jika belum terhubung, mengembalikan null tanpa menampilkan popup login sama sekali.
 */
export async function autoUploadInspectionToGoogleDrive(
  report: DailyReport
): Promise<{
  spreadsheetUrl?: string;
  spreadsheetId?: string;
  driveFolderUrl?: string;
  driveFileUrl?: string;
  uploadedAt: string;
} | null> {
  // 1. Coba Webhook Google Apps Script (Bebas login permanen & sinkron seluruh perangkat)
  const webhookUrl = await getEffectiveWebhookUrl();
  if (webhookUrl) {
    try {
      const whRes = await uploadReportViaWebhook(report, webhookUrl);
      return {
        spreadsheetUrl: whRes.spreadsheetUrl,
        driveFolderUrl: whRes.folderUrl,
        driveFileUrl: whRes.spreadsheetUrl,
        uploadedAt: new Date().toISOString(),
      };
    } catch (whErr) {
      console.warn('Upload via Webhook Google Drive ditunda:', whErr);
    }
  }

  // 2. Coba Token Efektif dari Shared Token Firestore / Local Cache
  const token = await getEffectiveDriveToken();
  if (!token) {
    // Tidak ada token aktif, kembalikan null secara diam-diam tanpa popup login
    return null;
  }

  try {
    const folderRes = await getOrCreateInspectionFolder(token);
    const sheetRes = await uploadInspectionToGoogleSheets(report, token);

    try {
      await uploadReportSummaryToDrive(report, token, folderRes.id);
    } catch (txtErr) {
      console.warn('Ringkasan teks dilewati:', txtErr);
    }

    return {
      spreadsheetUrl: sheetRes.spreadsheetUrl,
      spreadsheetId: sheetRes.spreadsheetId,
      driveFolderUrl: sheetRes.folderUrl || folderRes.webViewLink,
      driveFileUrl: sheetRes.driveViewUrl || sheetRes.spreadsheetUrl,
      uploadedAt: new Date().toISOString(),
    };
  } catch (err: any) {
    console.warn('Gagal upload otomatis dengan token aktif:', err);
    throw err;
  }
}
