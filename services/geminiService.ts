
import { GoogleGenAI } from "@google/genai";
import { DailyReport, InspectionStatus } from '../types';

const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY || '';
const ai = new GoogleGenAI({ 
  apiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

export const generateReportSummary = async (report: DailyReport): Promise<string> => {
  try {
    const failedItems = report.items.filter(i => i.status === InspectionStatus.FAIL);
    const dateItems = report.items.filter(i => i.inputType === 'date');
    
    const prompt = `
      Bertindaklah sebagai Manajer Loss Prevention dan Safety Officer profesional.
      Analisis data inspeksi harian berikut dan buatlah ringkasan eksekutif yang ringkas dan profesional dalam Bahasa Indonesia.
      
      **Data Inspeksi:**
      - Tanggal: ${new Date(report.date).toLocaleDateString('id-ID')}
      - Toko/Store: ${report.store || 'Tidak Disebutkan'}
      - Nama LP Supervisor: ${report.lpSupervisor || report.shift || 'Tidak Disebutkan'}
      - NIK Petugas: ${report.nik || report.inspectorName || 'Tidak Disebutkan'}
      - Skor Kepatuhan: ${report.complianceScore}%
      
      **Pemeriksaan Gagal (${failedItems.length}):**
      ${failedItems.map(i => `- [${i.category}] ${i.label}: ${i.comment || 'Tidak ada catatan'} ${i.photo ? '(BUKTI FOTO DILAMPIRKAN)' : ''}`).join('\n')}

      **Data Terukur (Tanggal/Angka):**
      ${dateItems.map(i => `- ${i.label}: ${i.value || 'Tidak diisi'}`).join('\n')}
      (Periksa jika tanggal expired sudah lewat atau mendekati hari ini: ${new Date().toLocaleDateString('id-ID')})
      
      **Observasi Lapangan:**
      ${report.observations.map(o => `- [Prioritas: ${o.severity}] ${o.location}: ${o.description} ${o.photo ? '(TERLAMPIR BUKTI FOTO)' : ''}`).join('\n')}
      
      **Instruksi:**
      1. Mulai dengan penilaian status keamanan operasional pada shift tersebut secara umum (Sangat Baik, Baik, Perlu Perbaikan, atau Kritis).
      2. Soroti risiko keamanan atau keselamatan spesifik berdasarkan item yang gagal dan observasi. Jika ada foto bukti yang dilampirkan pada item ceklist atau observasi, sebutkan bahwa bukti visual telah diamankan dan perlu ditinjau.
      3. Jika ada item tanggal yang expired (seperti APAR), berikan peringatan keras.
      4. Berikan 2-3 rekomendasi tindakan perbaikan yang jelas untuk tim operasional di lokasi.
      5. Gunakan bahasa korporat yang formal, objektif, dan tegas.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
    });

    return response.text || "Tidak dapat membuat ringkasan.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Gagal terhubung ke layanan AI. Silakan coba lagi nanti.";
  }
};

export interface ExecutiveTrendResult {
  summary: string;
  generatedAt: string;
  riskLevel: 'Aman' | 'Waspada' | 'Kritis';
  recurringIssuesCount: number;
}

/**
 * Analyzes stored compliance reports across stores and generates an automated executive trend summary.
 */
export const generateExecutiveTrendSummary = async (reports: DailyReport[]): Promise<ExecutiveTrendResult> => {
  if (!reports || reports.length === 0) {
    return {
      summary: "Belum ada laporan inspeksi tersimpan untuk dianalisis. Silakan buat laporan inspeksi baru.",
      generatedAt: new Date().toISOString(),
      riskLevel: 'Aman',
      recurringIssuesCount: 0
    };
  }

  try {
    // 1. Calculate overall stats
    const totalReports = reports.length;
    const avgScore = Math.round(reports.reduce((acc, r) => acc + r.complianceScore, 0) / totalReports);
    
    // 2. Aggregate recurring checklist failures
    const failureCountMap: { [label: string]: { count: number; category: string; stores: Set<string> } } = {};
    reports.forEach(r => {
      r.items.forEach(i => {
        if (i.status === InspectionStatus.FAIL) {
          if (!failureCountMap[i.label]) {
            failureCountMap[i.label] = { count: 0, category: i.category, stores: new Set() };
          }
          failureCountMap[i.label].count += 1;
          if (r.store) failureCountMap[i.label].stores.add(r.store);
        }
      });
    });

    const sortedFailures = Object.entries(failureCountMap)
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 5)
      .map(([label, info]) => `- **[${info.category}]** ${label} (${info.count}x terdeteksi di: ${Array.from(info.stores).slice(0, 3).join(', ')})`);

    // 3. Aggregate high/critical observations
    const criticalObs: string[] = [];
    reports.forEach(r => {
      r.observations.forEach(o => {
        if (o.severity === 'Critical' || o.severity === 'High') {
          criticalObs.push(`- [${o.severity}] ${r.store || 'Toko'}: ${o.description} (${o.location})`);
        }
      });
    });

    // 4. Stores compliance list
    const complianceStores = Array.from(new Set(reports.map(r => r.store).filter(Boolean)));

    const prompt = `
      Anda adalah Chief Loss Prevention & Safety Executive (Head of Security & Safety LP BU Banten).
      Buatlah "Ringkasan Eksekutif Tren Compliance LP & K3" (Executive Brief) yang singkat, tajam, dan berdampak tinggi berdasarkan analisis ${totalReports} laporan inspeksi terkumpul berikut:

      DATA PERFORMA OPERASIONAL:
      - Total Laporan Diperiksa: ${totalReports} laporan
      - Rata-rata Skor Kepatuhan: ${avgScore}%
      - Toko Terlibat (${complianceStores.length} toko): ${complianceStores.slice(0, 6).join('; ')}
      
      TEMUAN CEKLIST BERULANG (Recurring Safety & Security Failures):
      ${sortedFailures.length > 0 ? sortedFailures.join('\n') : 'Tidak ada temuan kegagalan ceklist mayor.'}

      TEMUAN OBSERVASI PRIORITAS TINGGI / KRITIS:
      ${criticalObs.length > 0 ? criticalObs.slice(0, 5).join('\n') : 'Tidak ada temuan observasi kritis/tinggi.'}

      PANDUAN OUTPUT RINGKASAN EKSEKUTIF:
      Gunakan format Markdown yang rapi dengan struktur 3 bagian berikut:
      
      ### 1. Status Risiko & Kepatuhan Operasional
      Sajikan 1-2 kalimat simpulan tingkat kesehatan operasional dan kepatuhan toko secara umum.
      
      ### 2. Tren & Isu Keselamatan Berulang (Recurring Issues)
      Sebutkan pola temuan keselamatan dan keamanan yang berulang antar-toko (misalnya kendala APAR, jalur evakuasi/pintu darurat, akses kontrol/rolling door, kamera CCTV, kebersihan panel listrik, atau prosedur greeter). Jelaskan dampak risikonya secara ringkas.

      ### 3. Arahan Tindakan Prioritas Manajemen
      Berikan 2-3 butir rekomendasi langkah korektif konkret dan terukur untuk Supervisor LP dan Store Manager.

      Gunakan bahasa Indonesia korporat formal, objektif, tegas, dan berorientasi mitigasi risiko (zero loss & zero incident). Jangan bertele-tele.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
    });

    const summaryText = response.text || "Tidak ada analisis tren yang dihasilkan.";
    
    // Determine overall risk level
    let riskLevel: 'Aman' | 'Waspada' | 'Kritis' = 'Aman';
    if (avgScore < 80 || criticalObs.length >= 2) {
      riskLevel = 'Kritis';
    } else if (avgScore < 90 || sortedFailures.length >= 2 || criticalObs.length > 0) {
      riskLevel = 'Waspada';
    }

    return {
      summary: summaryText,
      generatedAt: new Date().toISOString(),
      riskLevel,
      recurringIssuesCount: Object.keys(failureCountMap).length
    };
  } catch (error) {
    console.error("Gemini Executive Trend Summary Error:", error);
    return {
      summary: "Gagal menghubungkan ke layanan Gemini AI untuk menganalisis tren. Silakan klik tombol 'Analisis Ulang' untuk mencoba kembali.",
      generatedAt: new Date().toISOString(),
      riskLevel: 'Waspada',
      recurringIssuesCount: 0
    };
  }
};

