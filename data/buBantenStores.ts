export interface BUBantenStore {
  no: number;
  code: string;
  name: string;
  brand?: string;
  businessUnit: string;
  lpSpv: string;
  nikSpv: string;
  homeBase?: string;
  jabatan?: string;
  isHomeBase?: boolean;
}

export interface BUBantenSupervisor {
  no?: number;
  name: string;
  nik: string;
  homeBase: string;
  jabatan: string;
  totalStore: number;
  phone?: string;
}

// 147 Toko & PIC LP Supervisor Resmi BU Banten sesuai data file
const RAW_BU_BANTEN_STORES: BUBantenStore[] = [
  // IWAN HENDRA SAPUTRA (ARH - Home Base: LIVING WORLD ALAM SUTERA, NIK: 097485)
  { no: 1, code: 'PA31', name: 'MALL LIVING WORLD ALAM SUTERA ( HOME BASE )', businessUnit: 'AGC', lpSpv: 'IWAN HENDRA SAPUTRA', nikSpv: '097485', homeBase: 'LIVING WORLD ALAM SUTERA', jabatan: 'ARH', isHomeBase: true },
  { no: 2, code: '328', name: 'BUMI KAWLA', businessUnit: 'CBA', lpSpv: 'IWAN HENDRA SAPUTRA', nikSpv: '097485', homeBase: 'LIVING WORLD ALAM SUTERA', jabatan: 'ARH' },
  { no: 3, code: '328-CSK', name: 'LAHAN CISAUK', businessUnit: '328', lpSpv: 'IWAN HENDRA SAPUTRA', nikSpv: '097485', homeBase: 'LIVING WORLD ALAM SUTERA', jabatan: 'ARH' },
  { no: 4, code: 'A546', name: 'AZKO MALL CIPUTRA', businessUnit: 'AHI', lpSpv: 'IWAN HENDRA SAPUTRA', nikSpv: '097485', homeBase: 'CIPUTRA MALL CITRA RAYA', jabatan: 'ARH' },
  { no: 5, code: 'F686', name: 'CHATIME MALL CIPUTRA', businessUnit: 'FBI', lpSpv: 'IWAN HENDRA SAPUTRA', nikSpv: '097485', homeBase: 'CIPUTRA MALL CITRA RAYA', jabatan: 'ARH' },
  { no: 6, code: 'J742', name: 'SELMA MALL CIPUTRA', businessUnit: 'HCIR', lpSpv: 'IWAN HENDRA SAPUTRA', nikSpv: '097485', homeBase: 'CIPUTRA MALL CITRA RAYA', jabatan: 'ARH' },
  { no: 7, code: 'CH004', name: 'CHATIME MOBLIE 004 JAKARTA', businessUnit: 'FBI', lpSpv: 'IWAN HENDRA SAPUTRA', nikSpv: '097485', homeBase: 'CIPUTRA MALL CITRA RAYA', jabatan: 'ARH' },
  { no: 8, code: 'CH005', name: 'CHATIME MOBLIE 005 JAKARTA', businessUnit: 'FBI', lpSpv: 'IWAN HENDRA SAPUTRA', nikSpv: '097485', homeBase: 'CIPUTRA MALL CITRA RAYA', jabatan: 'ARH' },
  { no: 9, code: 'CH001', name: 'CHATIME MOBILE 001', businessUnit: 'FBI', lpSpv: 'IWAN HENDRA SAPUTRA', nikSpv: '097485', homeBase: 'CIPUTRA MALL CITRA RAYA', jabatan: 'ARH' },

  // ASEP SUNANDAR (LP SUPERVISOR - Home Base: LIVING PLAZA BINTARO, NIK: 094848)
  { no: 11, code: 'PA56', name: 'AGC LP BINTARO', businessUnit: 'AGC', lpSpv: 'ASEP SUNANDAR', nikSpv: '094848', homeBase: 'LIVING PLAZA BINTARO', jabatan: 'LP SUPERVISOR' },
  { no: 12, code: 'A341-SC', name: 'AZKO SERVICE CENTER', businessUnit: 'AHI', lpSpv: 'ASEP SUNANDAR', nikSpv: '094848', homeBase: 'LIVING PLAZA BINTARO', jabatan: 'LP SUPERVISOR' },
  { no: 13, code: 'A341', name: 'AHI BINTARO (HOME BASE)', businessUnit: 'AHI', lpSpv: 'ASEP SUNANDAR', nikSpv: '094848', homeBase: 'LIVING PLAZA BINTARO', jabatan: 'LP SUPERVISOR', isHomeBase: true },
  { no: 14, code: 'J301', name: 'HCI BINTARO', businessUnit: 'HCIR', lpSpv: 'ASEP SUNANDAR', nikSpv: '094848', homeBase: 'LIVING PLAZA BINTARO', jabatan: 'LP SUPERVISOR' },
  { no: 15, code: 'J574', name: 'EYE SOUL BINTARO', businessUnit: 'HCIR', lpSpv: 'ASEP SUNANDAR', nikSpv: '094848', homeBase: 'LIVING PLAZA BINTARO', jabatan: 'LP SUPERVISOR' },
  { no: 16, code: 'T327', name: 'TOYS KINGDOME BINTARO', businessUnit: 'TGI', lpSpv: 'ASEP SUNANDAR', nikSpv: '094848', homeBase: 'LIVING PLAZA BINTARO', jabatan: 'LP SUPERVISOR' },
  { no: 17, code: 'A552', name: 'ATARU BINTARO', businessUnit: 'AHI', lpSpv: 'ASEP SUNANDAR', nikSpv: '094848', homeBase: 'LIVING PLAZA BINTARO', jabatan: 'LP SUPERVISOR' },
  { no: 18, code: 'FA32', name: 'GINDACO BINTARO', businessUnit: 'FBI', lpSpv: 'ASEP SUNANDAR', nikSpv: '094848', homeBase: 'LIVING PLAZA BINTARO', jabatan: 'LP SUPERVISOR' },
  { no: 19, code: 'F306', name: 'CHATIME BINTARO', businessUnit: 'AHI', lpSpv: 'ASEP SUNANDAR', nikSpv: '094848', homeBase: 'LIVING PLAZA BINTARO', jabatan: 'LP SUPERVISOR' },
  { no: 20, code: 'F426', name: 'CHATIME BINTARO PLAZA', businessUnit: 'FBI', lpSpv: 'ASEP SUNANDAR', nikSpv: '094848', homeBase: 'LIVING PLAZA BINTARO', jabatan: 'LP SUPERVISOR' },
  { no: 21, code: 'J476', name: 'IE BINTARO', businessUnit: 'HCIR', lpSpv: 'ASEP SUNANDAR', nikSpv: '094848', homeBase: 'LIVING PLAZA BINTARO', jabatan: 'LP SUPERVISOR' },

  // JAKA HARYADI (LP SUPERVISOR - Home Base: LW ALSUT (AHI), NIK: 118843)
  { no: 22, code: 'A322', name: 'AZKO LW ALSUT (HOME BASE)', businessUnit: 'AHI', lpSpv: 'JAKA HARYADI', nikSpv: '118843', homeBase: 'LW ALSUT (AHI)', jabatan: 'LP SUPERVISOR', isHomeBase: true },
  { no: 23, code: 'A490', name: 'PENDOPO LW ALSUT', businessUnit: 'AHI', lpSpv: 'JAKA HARYADI', nikSpv: '118843', homeBase: 'LW ALSUT (AHI)', jabatan: 'LP SUPERVISOR' },
  { no: 24, code: 'T305', name: 'TOYS KING DOME', businessUnit: 'TGI', lpSpv: 'JAKA HARYADI', nikSpv: '118843', homeBase: 'LW ALSUT (AHI)', jabatan: 'LP SUPERVISOR' },
  { no: 25, code: 'A553', name: 'ATARU LW ALSUT', businessUnit: 'AHI', lpSpv: 'JAKA HARYADI', nikSpv: '118843', homeBase: 'LW ALSUT (AHI)', jabatan: 'LP SUPERVISOR' },
  { no: 26, code: 'A664', name: 'AZKO EXPRES MODERLAND', businessUnit: 'AHI', lpSpv: 'JAKA HARYADI', nikSpv: '118843', homeBase: 'LW ALSUT (AHI)', jabatan: 'LP SUPERVISOR' },
  { no: 27, code: 'F533', name: 'CHATIME LW', businessUnit: 'FBI', lpSpv: 'JAKA HARYADI', nikSpv: '118843', homeBase: 'LW ALSUT (AHI)', jabatan: 'LP SUPERVISOR' },
  { no: 28, code: 'F503', name: 'ATEALIER LW', businessUnit: 'FBI', lpSpv: 'JAKA HARYADI', nikSpv: '118843', homeBase: 'LW ALSUT (AHI)', jabatan: 'LP SUPERVISOR' },
  { no: 29, code: 'FD31', name: 'GOGO CURY LW', businessUnit: 'FBI', lpSpv: 'JAKA HARYADI', nikSpv: '118843', homeBase: 'LW ALSUT (AHI)', jabatan: 'LP SUPERVISOR' },
  { no: 30, code: 'FC32', name: 'CUPBOB LW', businessUnit: 'FBI', lpSpv: 'JAKA HARYADI', nikSpv: '118843', homeBase: 'LW ALSUT (AHI)', jabatan: 'LP SUPERVISOR' },
  { no: 31, code: 'F33H', name: 'CHATIME RUKO PORIS', businessUnit: 'FBI', lpSpv: 'JAKA HARYADI', nikSpv: '118843', homeBase: 'LW ALSUT (AHI)', jabatan: 'LP SUPERVISOR' },
  { no: 32, code: 'FE32', name: 'SEOL 88', businessUnit: 'FBI', lpSpv: 'JAKA HARYADI', nikSpv: '118843', homeBase: 'LW ALSUT (AHI)', jabatan: 'LP SUPERVISOR' },
  { no: 33, code: 'F31G', name: 'CHATIME GS CIPONDOH', businessUnit: 'FBI', lpSpv: 'JAKA HARYADI', nikSpv: '118843', homeBase: 'LW ALSUT (AHI)', jabatan: 'LP SUPERVISOR' },
  { no: 34, code: 'A322-DC', name: 'DC HUB AZKO', businessUnit: 'AHI', lpSpv: 'JAKA HARYADI', nikSpv: '118843', homeBase: 'LW ALSUT (AHI)', jabatan: 'LP SUPERVISOR' },

  // SISWANTO (LP SUPERVISOR - Home Base: HCI LW ALSUT (HCIR), NIK: 115172)
  { no: 35, code: 'A630', name: 'AZKO RAWA BUNTU', businessUnit: 'AHI', lpSpv: 'SISWANTO', nikSpv: '115172', homeBase: 'HCI LW ALSUT (HCIR)', jabatan: 'LP SUPERVISOR' },
  { no: 36, code: 'J347', name: 'HCI LW ALSUT (HOME BASE)', businessUnit: 'HCIR', lpSpv: 'SISWANTO', nikSpv: '115172', homeBase: 'HCI LW ALSUT (HCIR)', jabatan: 'LP SUPERVISOR', isHomeBase: true },
  { no: 37, code: 'J742-LW', name: 'IE LW ALSUT', businessUnit: 'HCIR', lpSpv: 'SISWANTO', nikSpv: '115172', homeBase: 'HCI LW ALSUT (HCIR)', jabatan: 'LP SUPERVISOR' },
  { no: 38, code: 'J553', name: 'EYE SOUL LW ASLUT', businessUnit: 'HCIR', lpSpv: 'SISWANTO', nikSpv: '115172', homeBase: 'HCI LW ALSUT (HCIR)', jabatan: 'LP SUPERVISOR' },
  { no: 39, code: 'J430', name: 'SELMA LW ASLUT', businessUnit: 'HCIR', lpSpv: 'SISWANTO', nikSpv: '115172', homeBase: 'HCI LW ALSUT (HCIR)', jabatan: 'LP SUPERVISOR' },
  { no: 40, code: 'J519', name: 'THYS LW ASLUT', businessUnit: 'HCIR', lpSpv: 'SISWANTO', nikSpv: '115172', homeBase: 'HCI LW ALSUT (HCIR)', jabatan: 'LP SUPERVISOR' },
  { no: 41, code: 'FA31', name: 'GINDACO LW ASLUT', businessUnit: 'FBI', lpSpv: 'SISWANTO', nikSpv: '115172', homeBase: 'HCI LW ALSUT (HCIR)', jabatan: 'LP SUPERVISOR' },
  { no: 42, code: 'A715', name: 'AZKO EXPRES GRAHA', businessUnit: 'AHI', lpSpv: 'SISWANTO', nikSpv: '115172', homeBase: 'HCI LW ALSUT (HCIR)', jabatan: 'LP SUPERVISOR' },
  { no: 43, code: 'F31G-ST', name: 'CHATIME KIOS SILKTOWN F31G', businessUnit: 'FBI', lpSpv: 'SISWANTO', nikSpv: '115172', homeBase: 'HCI LW ALSUT (HCIR)', jabatan: 'LP SUPERVISOR' },
  { no: 44, code: 'F565', name: 'CHATIME TRANSMART', businessUnit: 'FBI', lpSpv: 'SISWANTO', nikSpv: '115172', homeBase: 'HCI LW ALSUT (HCIR)', jabatan: 'LP SUPERVISOR' },
  { no: 45, code: 'F407', name: 'CHATIME TERAS KOTA', businessUnit: 'FBI', lpSpv: 'SISWANTO', nikSpv: '115172', homeBase: 'HCI LW ALSUT (HCIR)', jabatan: 'LP SUPERVISOR' },
  { no: 46, code: 'F35X', name: 'CHATIME RAWA BUNTU', businessUnit: 'FBI', lpSpv: 'SISWANTO', nikSpv: '115172', homeBase: 'HCI LW ALSUT (HCIR)', jabatan: 'LP SUPERVISOR' },

  // FIRMANSYAH (LP SUPERVISOR - Home Base: LP PALM SEMI, NIK: 107325)
  { no: 47, code: 'PA60', name: 'AGC LP PALEM SEMI', businessUnit: 'AGC', lpSpv: 'FIRMANSYAH', nikSpv: '107325', homeBase: 'LP PALM SEMI', jabatan: 'LP SUPERVISOR' },
  { no: 48, code: 'A584', name: 'AZKO PALM SEMI (HOME BASE)', businessUnit: 'AHI', lpSpv: 'FIRMANSYAH', nikSpv: '107325', homeBase: 'LP PALM SEMI', jabatan: 'LP SUPERVISOR', isHomeBase: true },
  { no: 49, code: 'J304', name: 'HCI PALM SEMI', businessUnit: 'HCIR', lpSpv: 'FIRMANSYAH', nikSpv: '107325', homeBase: 'LP PALM SEMI', jabatan: 'LP SUPERVISOR' },
  { no: 50, code: 'A585', name: 'ATARU PALM SEMI', businessUnit: 'AHI', lpSpv: 'FIRMANSYAH', nikSpv: '107325', homeBase: 'LP PALM SEMI', jabatan: 'LP SUPERVISOR' },
  { no: 51, code: 'F31N', name: 'CHATIME PALM SEMI', businessUnit: 'FBI', lpSpv: 'FIRMANSYAH', nikSpv: '107325', homeBase: 'LP PALM SEMI', jabatan: 'LP SUPERVISOR' },
  { no: 52, code: 'Q311', name: 'KLO TANGERANG', businessUnit: 'KLO', lpSpv: 'FIRMANSYAH', nikSpv: '107325', homeBase: 'LP PALM SEMI', jabatan: 'LP SUPERVISOR' },
  { no: 53, code: 'T375', name: 'TOYS PALM SEMI', businessUnit: 'TGI', lpSpv: 'FIRMANSYAH', nikSpv: '107325', homeBase: 'LP PALM SEMI', jabatan: 'LP SUPERVISOR' },

  // ARIYANTO ANDRIE (LP SUPERVISOR - Home Base: MALL KARAWACI, NIK: 107419)
  { no: 54, code: 'A301', name: 'AZKO KARAWACI (HOME BASE)', businessUnit: 'AHI', lpSpv: 'ARIYANTO ANDRIE', nikSpv: '107419', homeBase: 'MALL KARAWACI', jabatan: 'LP SUPERVISOR', isHomeBase: true },
  { no: 55, code: 'J365', name: 'HCI KARAWACI', businessUnit: 'HCIR', lpSpv: 'ARIYANTO ANDRIE', nikSpv: '107419', homeBase: 'MALL KARAWACI', jabatan: 'LP SUPERVISOR' },
  { no: 56, code: 'J445', name: 'IE KARAWACI', businessUnit: 'HCIR', lpSpv: 'ARIYANTO ANDRIE', nikSpv: '107419', homeBase: 'MALL KARAWACI', jabatan: 'LP SUPERVISOR' },
  { no: 57, code: 'F413', name: 'CHATIME AZKO KARAWACI', businessUnit: 'FBI', lpSpv: 'ARIYANTO ANDRIE', nikSpv: '107419', homeBase: 'MALL KARAWACI', jabatan: 'LP SUPERVISOR' },
  { no: 58, code: 'F339', name: 'CHATIME MALL KARAWACI', businessUnit: 'FBI', lpSpv: 'ARIYANTO ANDRIE', nikSpv: '107419', homeBase: 'MALL KARAWACI', jabatan: 'LP SUPERVISOR' },
  { no: 59, code: 'T325', name: 'TOYS KINGDOME KARAWACI', businessUnit: 'TGI', lpSpv: 'ARIYANTO ANDRIE', nikSpv: '107419', homeBase: 'MALL KARAWACI', jabatan: 'LP SUPERVISOR' },
  { no: 60, code: 'FD52', name: 'GOGO CURY MALL KARAWACI', businessUnit: 'FBI', lpSpv: 'ARIYANTO ANDRIE', nikSpv: '107419', homeBase: 'MALL KARAWACI', jabatan: 'LP SUPERVISOR' },
  { no: 61, code: 'Y303', name: 'MOLLY KARAWACI', businessUnit: 'FBI', lpSpv: 'ARIYANTO ANDRIE', nikSpv: '107419', homeBase: 'MALL KARAWACI', jabatan: 'LP SUPERVISOR' },
  { no: 62, code: '328-K27', name: 'LAHAN KAV 27 ALAM SUTERA', businessUnit: '328', lpSpv: 'ARIYANTO ANDRIE', nikSpv: '107419', homeBase: 'MALL KARAWACI', jabatan: 'LP SUPERVISOR' },

  // EKO TRIYONO (LP SUPERVISOR - Home Base: MALL Q BIG BSD, NIK: 104354)
  { no: 63, code: 'A445', name: 'AZKO Q BIG (HOME BASE)', businessUnit: 'AHI', lpSpv: 'EKO TRIYONO', nikSpv: '104354', homeBase: 'MALL Q BIG BSD', jabatan: 'LP SUPERVISOR', isHomeBase: true },
  { no: 64, code: 'A550', name: 'ATARU Q BIG', businessUnit: 'AHI', lpSpv: 'EKO TRIYONO', nikSpv: '104354', homeBase: 'MALL Q BIG BSD', jabatan: 'LP SUPERVISOR' },
  { no: 65, code: 'J534', name: 'HCI Q BIG', businessUnit: 'HCIR', lpSpv: 'EKO TRIYONO', nikSpv: '104354', homeBase: 'MALL Q BIG BSD', jabatan: 'LP SUPERVISOR' },
  { no: 66, code: 'J436', name: 'IE Q BIG', businessUnit: 'HCIR', lpSpv: 'EKO TRIYONO', nikSpv: '104354', homeBase: 'MALL Q BIG BSD', jabatan: 'LP SUPERVISOR' },
  { no: 67, code: 'J562', name: 'EYE SOUL Q BIG', businessUnit: 'HCIR', lpSpv: 'EKO TRIYONO', nikSpv: '104354', homeBase: 'MALL Q BIG BSD', jabatan: 'LP SUPERVISOR' },
  { no: 68, code: 'T328', name: 'TOYS QBIG', businessUnit: 'TGI', lpSpv: 'EKO TRIYONO', nikSpv: '104354', homeBase: 'MALL Q BIG BSD', jabatan: 'LP SUPERVISOR' },
  { no: 69, code: 'R320', name: 'PET KINGDOME Q-BIG', businessUnit: 'HCIR', lpSpv: 'EKO TRIYONO', nikSpv: '104354', homeBase: 'MALL Q BIG BSD', jabatan: 'LP SUPERVISOR' },
  { no: 70, code: 'F708', name: 'CHATIME Q-BIG 2', businessUnit: 'FBI', lpSpv: 'EKO TRIYONO', nikSpv: '104354', homeBase: 'MALL Q BIG BSD', jabatan: 'LP SUPERVISOR' },
  { no: 71, code: 'F412', name: 'CHATIME AEON', businessUnit: 'FBI', lpSpv: 'EKO TRIYONO', nikSpv: '104354', homeBase: 'MALL Q BIG BSD', jabatan: 'LP SUPERVISOR' },
  { no: 72, code: 'J610', name: 'KELS AEON BSD', businessUnit: 'HCIR', lpSpv: 'EKO TRIYONO', nikSpv: '104354', homeBase: 'MALL Q BIG BSD', jabatan: 'LP SUPERVISOR' },
  { no: 73, code: 'F661', name: 'CHATIME THE BREEZE', businessUnit: 'FBI', lpSpv: 'EKO TRIYONO', nikSpv: '104354', homeBase: 'MALL Q BIG BSD', jabatan: 'LP SUPERVISOR' },

  // ASRI MAHMUD (LP SUPERVISOR - Home Base: PARAMOUNT, NIK: 005395)
  { no: 74, code: 'A360', name: 'AZKO PARAMOUNT (HOME BASE)', businessUnit: 'AHI', lpSpv: 'ASRI MAHMUD', nikSpv: '005395', homeBase: 'PARAMOUNT', jabatan: 'LP SUPERVISOR', isHomeBase: true },
  { no: 75, code: 'F400', name: 'CHATIME PARAMOUNT', businessUnit: 'FBI', lpSpv: 'ASRI MAHMUD', nikSpv: '005395', homeBase: 'PARAMOUNT', jabatan: 'LP SUPERVISOR' },
  { no: 76, code: 'F509', name: 'CHATIME SUMARECON', businessUnit: 'FBI', lpSpv: 'ASRI MAHMUD', nikSpv: '005395', homeBase: 'PARAMOUNT', jabatan: 'LP SUPERVISOR' },
  { no: 77, code: 'F33C', name: 'CHATIME BP PARAMOUNT', businessUnit: 'FBI', lpSpv: 'ASRI MAHMUD', nikSpv: '005395', homeBase: 'PARAMOUNT', jabatan: 'LP SUPERVISOR' },
  { no: 78, code: 'Y309', name: 'MOLLY SUMARECON', businessUnit: 'FBI', lpSpv: 'ASRI MAHMUD', nikSpv: '005395', homeBase: 'PARAMOUNT', jabatan: 'LP SUPERVISOR' },
  { no: 79, code: '328-SH', name: 'LAHAN KUNCIRAN 2 ( SKY HOUSE )', businessUnit: '328', lpSpv: 'ASRI MAHMUD', nikSpv: '005395', homeBase: 'PARAMOUNT', jabatan: 'LP SUPERVISOR' },
  { no: 80, code: '328-IK', name: 'LAHAN KUNCIRAN 3 ( IKEA )', businessUnit: '328', lpSpv: 'ASRI MAHMUD', nikSpv: '005395', homeBase: 'PARAMOUNT', jabatan: 'LP SUPERVISOR' },

  // FARIZ HASAN (LP SUPERVISOR - Home Base: LP CIPUTAT POINT, NIK: 094826)
  { no: 81, code: 'AGC-CP', name: 'AGC LP CIPUTAT', businessUnit: 'AGC', lpSpv: 'FARIZ HASAN', nikSpv: '094826', homeBase: 'LP CIPUTAT POINT', jabatan: 'LP SUPERVISOR' },
  { no: 82, code: 'AGC-PC', name: 'AGC LP PONDOK CABE', businessUnit: 'AGC', lpSpv: 'FARIZ HASAN', nikSpv: '094826', homeBase: 'LP CIPUTAT POINT', jabatan: 'LP SUPERVISOR' },
  { no: 83, code: 'A416', name: 'AZKO PONDOK CABE (HOME BASE)', businessUnit: 'AHI', lpSpv: 'FARIZ HASAN', nikSpv: '094826', homeBase: 'LP CIPUTAT POINT', jabatan: 'LP SUPERVISOR', isHomeBase: true },
  { no: 84, code: 'J364', name: 'HCI PONDOK CABE', businessUnit: 'HCIR', lpSpv: 'FARIZ HASAN', nikSpv: '094826', homeBase: 'LP CIPUTAT POINT', jabatan: 'LP SUPERVISOR' },
  { no: 85, code: 'F398', name: 'CHATIME PONDOK CABE', businessUnit: 'FBI', lpSpv: 'FARIZ HASAN', nikSpv: '094826', homeBase: 'LP CIPUTAT POINT', jabatan: 'LP SUPERVISOR' },
  { no: 86, code: 'A463', name: 'AZKO LP CIPUTAT', businessUnit: 'AHI', lpSpv: 'FARIZ HASAN', nikSpv: '094826', homeBase: 'LP CIPUTAT POINT', jabatan: 'LP SUPERVISOR' },
  { no: 87, code: 'J377', name: 'HCI LP CIPUTAT', businessUnit: 'HCIR', lpSpv: 'FARIZ HASAN', nikSpv: '094826', homeBase: 'LP CIPUTAT POINT', jabatan: 'LP SUPERVISOR' },
  { no: 88, code: 'F467', name: 'CHATIME LP CIPUTAT', businessUnit: 'FBI', lpSpv: 'FARIZ HASAN', nikSpv: '094826', homeBase: 'LP CIPUTAT POINT', jabatan: 'LP SUPERVISOR' },
  { no: 89, code: 'A581', name: 'AZKO EXPRES CIRENDEU', businessUnit: 'AHI', lpSpv: 'FARIZ HASAN', nikSpv: '094826', homeBase: 'LP CIPUTAT POINT', jabatan: 'LP SUPERVISOR' },
  { no: 90, code: 'F330', name: 'CHATIME RUKO UIN CIPUTAT', businessUnit: 'FBI', lpSpv: 'FARIZ HASAN', nikSpv: '094826', homeBase: 'LP CIPUTAT POINT', jabatan: 'LP SUPERVISOR' },
  { no: 91, code: 'F521', name: 'CHATIME MALL TANGCIT', businessUnit: 'FBI', lpSpv: 'FARIZ HASAN', nikSpv: '094826', homeBase: 'LP CIPUTAT POINT', jabatan: 'LP SUPERVISOR' },
  { no: 92, code: 'A98C', name: 'AZKO SERVICE CENTER LP CIPUTAT', businessUnit: 'AHI', lpSpv: 'FARIZ HASAN', nikSpv: '094826', homeBase: 'LP CIPUTAT POINT', jabatan: 'LP SUPERVISOR' },
  { no: 93, code: 'J-SLM', name: 'SELMA LP CIPUTAT', businessUnit: 'HCIR', lpSpv: 'FARIZ HASAN', nikSpv: '094826', homeBase: 'LP CIPUTAT POINT', jabatan: 'LP SUPERVISOR' },

  // MUZAINI (LP SUPERVISOR - Home Base: KARANG MULYA, NIK: 004930)
  { no: 94, code: 'A457', name: 'AZKO KARANG MULYA (HOME BASE)', businessUnit: 'AHI', lpSpv: 'MUZAINI', nikSpv: '004930', homeBase: 'KARANG MULYA', jabatan: 'LP SUPERVISOR', isHomeBase: true },
  { no: 95, code: 'A443', name: 'AZKO CILEDUG', businessUnit: 'AHI', lpSpv: 'MUZAINI', nikSpv: '004930', homeBase: 'KARANG MULYA', jabatan: 'LP SUPERVISOR' },
  { no: 96, code: 'F485', name: 'CHATIME MOBILE', businessUnit: 'FBI', lpSpv: 'MUZAINI', nikSpv: '004930', homeBase: 'KARANG MULYA', jabatan: 'LP SUPERVISOR' },
  { no: 97, code: 'F31E', name: 'CHATIME KIOS SPPBU CILEDUG', businessUnit: 'FBI', lpSpv: 'MUZAINI', nikSpv: '004930', homeBase: 'KARANG MULYA', jabatan: 'LP SUPERVISOR' },
  { no: 98, code: 'A743', name: 'NEKA CILEDUG INDAH', businessUnit: 'AHI', lpSpv: 'MUZAINI', nikSpv: '004930', homeBase: 'KARANG MULYA', jabatan: 'LP SUPERVISOR' },
  { no: 99, code: 'A745', name: 'NEKA PINANG', businessUnit: 'AHI', lpSpv: 'MUZAINI', nikSpv: '004930', homeBase: 'KARANG MULYA', jabatan: 'LP SUPERVISOR' },
  { no: 100, code: 'F33K', name: 'CHATIME GREENLAKE', businessUnit: 'FBI', lpSpv: 'MUZAINI', nikSpv: '004930', homeBase: 'KARANG MULYA', jabatan: 'LP SUPERVISOR' },
  { no: 101, code: 'A767', name: 'NEKA KREO TANGERANG', businessUnit: 'AHI', lpSpv: 'MUZAINI', nikSpv: '004930', homeBase: 'KARANG MULYA', jabatan: 'LP SUPERVISOR' },
  { no: 102, code: 'A-CPD', name: 'AZKO CIPONDOH ( PROJEK )', businessUnit: 'AHI', lpSpv: 'MUZAINI', nikSpv: '004930', homeBase: 'KARANG MULYA', jabatan: 'LP SUPERVISOR' },

  // BAMBANG SANTOSO (LP SUPERVISOR - Home Base: REMPOA, NIK: 106465)
  { no: 103, code: 'A434', name: 'AZKO REMPOA (HOME BASE)', businessUnit: 'AHI', lpSpv: 'BAMBANG SANTOSO', nikSpv: '106465', homeBase: 'REMPOA', jabatan: 'LP SUPERVISOR', isHomeBase: true },
  { no: 104, code: 'F414', name: 'CHATIME REMPOA', businessUnit: 'FBI', lpSpv: 'BAMBANG SANTOSO', nikSpv: '106465', homeBase: 'REMPOA', jabatan: 'LP SUPERVISOR' },
  { no: 105, code: 'A702', name: 'AZKO EXPRES VETERAN', businessUnit: 'AHI', lpSpv: 'BAMBANG SANTOSO', nikSpv: '106465', homeBase: 'REMPOA', jabatan: 'LP SUPERVISOR' },
  { no: 106, code: 'F425', name: 'CHATIME BINTARO EXC', businessUnit: 'FBI', lpSpv: 'BAMBANG SANTOSO', nikSpv: '106465', homeBase: 'REMPOA', jabatan: 'LP SUPERVISOR' },
  { no: 107, code: 'T391', name: 'TOSY KINGDOME EXC', businessUnit: 'TGI', lpSpv: 'BAMBANG SANTOSO', nikSpv: '106465', homeBase: 'REMPOA', jabatan: 'LP SUPERVISOR' },
  { no: 108, code: 'FD-BX', name: 'GOGO CURY BINTARO EXCHANGE', businessUnit: 'FBI', lpSpv: 'BAMBANG SANTOSO', nikSpv: '106465', homeBase: 'REMPOA', jabatan: 'LP SUPERVISOR' },
  { no: 109, code: 'A653', name: 'AZKO BINTARO EXC', businessUnit: 'AHI', lpSpv: 'BAMBANG SANTOSO', nikSpv: '106465', homeBase: 'REMPOA', jabatan: 'LP SUPERVISOR' },

  // AZULI RAHMAN (LP SUPERVISOR - Home Base: LP PAMULANG, NIK: 107229)
  { no: 110, code: 'I307', name: 'AGC LP PAMULANG', businessUnit: 'AGC', lpSpv: 'AZULI RAHMAN', nikSpv: '107229', homeBase: 'LP PAMULANG', jabatan: 'LP SUPERVISOR' },
  { no: 111, code: 'A536', name: 'AZKO LP PAMULANG (HOME BASE)', businessUnit: 'AHI', lpSpv: 'AZULI RAHMAN', nikSpv: '107229', homeBase: 'LP PAMULANG', jabatan: 'LP SUPERVISOR', isHomeBase: true },
  { no: 112, code: 'T357', name: 'TOYS KINGDOME', businessUnit: 'TGI', lpSpv: 'AZULI RAHMAN', nikSpv: '107229', homeBase: 'LP PAMULANG', jabatan: 'LP SUPERVISOR' },
  { no: 113, code: 'J714', name: 'SELMA LP PAMULANG', businessUnit: 'TGI', lpSpv: 'AZULI RAHMAN', nikSpv: '107229', homeBase: 'LP PAMULANG', jabatan: 'LP SUPERVISOR' },
  { no: 114, code: 'J425', name: 'IE LP PAMULANG', businessUnit: 'HCIR', lpSpv: 'AZULI RAHMAN', nikSpv: '107229', homeBase: 'LP PAMULANG', jabatan: 'LP SUPERVISOR' },
  { no: 115, code: 'F630', name: 'CHATIME LP PAMULANG', businessUnit: 'FBI', lpSpv: 'AZULI RAHMAN', nikSpv: '107229', homeBase: 'LP PAMULANG', jabatan: 'LP SUPERVISOR' },
  { no: 116, code: 'F331', name: 'CHATIME BP CIATER', businessUnit: 'FBI', lpSpv: 'AZULI RAHMAN', nikSpv: '107229', homeBase: 'LP PAMULANG', jabatan: 'LP SUPERVISOR' },
  { no: 117, code: 'A742', name: 'NEKA ARIA CIPUTAT', businessUnit: 'AHI', lpSpv: 'AZULI RAHMAN', nikSpv: '107229', homeBase: 'LP PAMULANG', jabatan: 'LP SUPERVISOR' },
  { no: 118, code: 'F716', name: 'CHATIME SERPONG PARADISE', businessUnit: 'FBI', lpSpv: 'AZULI RAHMAN', nikSpv: '107229', homeBase: 'LP PAMULANG', jabatan: 'LP SUPERVISOR' },

  // MUSTAR (LP SUPERVISOR - Home Base: PET KINGDOME, NIK: 097496)
  { no: 119, code: '328-K4', name: 'LAHAN KUNCIRAN 4 (SKY HOUSE)', businessUnit: '328', lpSpv: 'MUSTAR', nikSpv: '097496', homeBase: 'PET KINGDOME', jabatan: 'LP SUPERVISOR' },
  { no: 120, code: '328-KB', name: 'LAHAN KUNCIRAN KEBUN', businessUnit: '328', lpSpv: 'MUSTAR', nikSpv: '097496', homeBase: 'PET KINGDOME', jabatan: 'LP SUPERVISOR' },
  { no: 121, code: 'A31H', name: 'AZKO JOMBANG', businessUnit: 'AHI', lpSpv: 'MUSTAR', nikSpv: '097496', homeBase: 'PET KINGDOME', jabatan: 'LP SUPERVISOR', isHomeBase: true },

  // NANA SURYANA (LP SUPERVISOR - Home Base: MALL CILEGON, NIK: 189403)
  { no: 122, code: 'A482', name: 'AZKO MALL CILEGON ( HOME BASE )', businessUnit: 'AHI', lpSpv: 'NANA SURYANA', nikSpv: '189403', homeBase: 'MALL CILEGON', jabatan: 'LP SUPERVISOR', isHomeBase: true },
  { no: 123, code: 'J370', name: 'HCI MALL CILEGON', businessUnit: 'HCIR', lpSpv: 'NANA SURYANA', nikSpv: '189403', homeBase: 'MALL CILEGON', jabatan: 'LP SUPERVISOR' },
  { no: 124, code: 'J461', name: 'INFORMA ELEKTRONIK CILEGON', businessUnit: 'HCIR', lpSpv: 'NANA SURYANA', nikSpv: '189403', homeBase: 'MALL CILEGON', jabatan: 'LP SUPERVISOR' },
  { no: 125, code: 'J765', name: 'SELMA CILEGON', businessUnit: 'HCIR', lpSpv: 'NANA SURYANA', nikSpv: '189403', homeBase: 'MALL CILEGON', jabatan: 'LP SUPERVISOR' },
  { no: 126, code: 'F543', name: 'CHATIME CILEGON', businessUnit: 'FBI', lpSpv: 'NANA SURYANA', nikSpv: '189403', homeBase: 'MALL CILEGON', jabatan: 'LP SUPERVISOR' },
  { no: 127, code: 'Q309', name: 'KLO CILEGON', businessUnit: 'KLO', lpSpv: 'NANA SURYANA', nikSpv: '189403', homeBase: 'MALL CILEGON', jabatan: 'LP SUPERVISOR' },
  { no: 128, code: 'Q310', name: 'AZKO TIRTAYASA CILEGON', businessUnit: 'AHI', lpSpv: 'NANA SURYANA', nikSpv: '189403', homeBase: 'MALL CILEGON', jabatan: 'LP SUPERVISOR' },
  { no: 129, code: '328-ST', name: 'LAHAN SERANG TIMUR', businessUnit: '328', lpSpv: 'NANA SURYANA', nikSpv: '189403', homeBase: 'MALL CILEGON', jabatan: 'LP SUPERVISOR' },

  // MURJANI (PROMOSI) (TOBE SPV - Home Base: CITRA RAYA, NIK: E04306)
  { no: 130, code: 'A403', name: 'AZKO CITRA RAYA ( HOME BASE )', businessUnit: 'AHI', lpSpv: 'MURJANI', nikSpv: 'E04306', homeBase: 'CITRA RAYA', jabatan: 'TOBE SPV', isHomeBase: true },
  { no: 131, code: 'J383', name: 'HCI CITRA RAYA', businessUnit: 'HCIR', lpSpv: 'MURJANI', nikSpv: 'E04306', homeBase: 'CITRA RAYA', jabatan: 'TOBE SPV' },
  { no: 132, code: 'J459', name: 'INFORMA ELEKTRONIK CITRA RAYA', businessUnit: 'HCIR', lpSpv: 'MURJANI', nikSpv: 'E04306', homeBase: 'CITRA RAYA', jabatan: 'TOBE SPV' },
  { no: 133, code: 'F368', name: 'CHATIME CITRA RAYA', businessUnit: 'FBI', lpSpv: 'MURJANI', nikSpv: 'E04306', homeBase: 'CITRA RAYA', jabatan: 'TOBE SPV' },
  { no: 134, code: 'F673', name: 'CHATIME ECO PLAZA', businessUnit: 'FBI', lpSpv: 'MURJANI', nikSpv: 'E04306', homeBase: 'CITRA RAYA', jabatan: 'TOBE SPV' },
  { no: 135, code: 'F703', name: 'CHATIME CITY PLAZA', businessUnit: 'FBI', lpSpv: 'MURJANI', nikSpv: 'E04306', homeBase: 'CITRA RAYA', jabatan: 'TOBE SPV' },
  { no: 136, code: '328-CR', name: 'LAHAN CITRA RAYA CIAKAR TANGERANG', businessUnit: '328', lpSpv: 'MURJANI', nikSpv: 'E04306', homeBase: 'CITRA RAYA', jabatan: 'TOBE SPV' },
  { no: 137, code: 'A758', name: 'NEKA TIGA RAKSA CISOKA', businessUnit: 'AHI', lpSpv: 'MURJANI', nikSpv: 'E04306', homeBase: 'CITRA RAYA', jabatan: 'TOBE SPV' },

  // DIDIK WAHYUDI (LP SUPERVISOR - Home Base: SERANG, NIK: E04309)
  { no: 138, code: '328-SR', name: 'LAHAN SERANG TIMUR', businessUnit: '328', lpSpv: 'DIDIK WAHYUDI', nikSpv: 'E04309', homeBase: 'SERANG', jabatan: 'LP SUPERVISOR' },
  { no: 139, code: 'A596', name: 'AZKO SERANG ( HOME BASE )', businessUnit: 'AHI', lpSpv: 'DIDIK WAHYUDI', nikSpv: 'E04309', homeBase: 'SERANG', jabatan: 'LP SUPERVISOR', isHomeBase: true },
  { no: 140, code: 'A765', name: 'NEKA SERANG', businessUnit: 'AHI', lpSpv: 'DIDIK WAHYUDI', nikSpv: 'E04309', homeBase: 'SERANG', jabatan: 'LP SUPERVISOR' },
  { no: 141, code: 'A748', name: 'NEKA PANDEGLANG', businessUnit: 'AHI', lpSpv: 'DIDIK WAHYUDI', nikSpv: 'E04309', homeBase: 'SERANG', jabatan: 'LP SUPERVISOR' },
  { no: 142, code: 'F340', name: 'CHATIME KIOS SERANG', businessUnit: 'FBI', lpSpv: 'DIDIK WAHYUDI', nikSpv: 'E04309', homeBase: 'SERANG', jabatan: 'LP SUPERVISOR' },
  { no: 143, code: 'F34F', name: 'CHATIME RUKO AHMAD YANI SERANG', businessUnit: 'FBI', lpSpv: 'DIDIK WAHYUDI', nikSpv: 'E04309', homeBase: 'SERANG', jabatan: 'LP SUPERVISOR' },
  { no: 144, code: 'F587', name: 'CHATIME MALL OF SERANG', businessUnit: 'FBI', lpSpv: 'DIDIK WAHYUDI', nikSpv: 'E04309', homeBase: 'SERANG', jabatan: 'LP SUPERVISOR' },
  { no: 145, code: 'A673', name: 'AZKO EX RANGKAS BITUNG', businessUnit: 'AHI', lpSpv: 'DIDIK WAHYUDI', nikSpv: 'E04309', homeBase: 'SERANG', jabatan: 'LP SUPERVISOR' },

  // VAISAL VAHMI (LP SUPERVISOR - Home Base: DC CIKANDE 1, NIK: 004121)
  { no: 146, code: 'DC01', name: 'DC CIKANDE 1 ( HOME BASE )', businessUnit: 'DC', lpSpv: 'VAISAL VAHMI', nikSpv: '004121', homeBase: 'DC CIKANDE 1', jabatan: 'LP SUPERVISOR', isHomeBase: true },

  // SATIMIN (LP SUPERVISOR / DC - Home Base: DC CIKUPA, NIK: 001695)
  { no: 147, code: 'DC02', name: 'DC CIKUPA ( HOME BASE )', businessUnit: 'DC', lpSpv: 'SATIMIN', nikSpv: '001695', homeBase: 'DC CIKUPA', jabatan: 'LP SUPERVISOR / DC', isHomeBase: true },

  // DARJATUL HAJI (LP SUPERVISOR - Home Base: DC CIKANDE 2, NIK: 108656)
  { no: 148, code: 'DC03', name: 'DC CIKANDE 2 ( HOME BASE )', businessUnit: 'DC', lpSpv: 'DARJATUL HAJI', nikSpv: '108656', homeBase: 'DC CIKANDE 2', jabatan: 'LP SUPERVISOR', isHomeBase: true },
];

// Pastikan penomoran toko selalu berurutan 1 sampai total toko (147)
export const BU_BANTEN_STORES: BUBantenStore[] = RAW_BU_BANTEN_STORES.map((s, idx) => ({
  ...s,
  no: idx + 1,
}));

// Rekapitulasi PIC LP Supervisor Resmi BU Banten
export const BU_BANTEN_SUPERVISORS: BUBantenSupervisor[] = [
  { no: 1, name: 'FARIZ HASAN', nik: '094826', homeBase: 'LP CIPUTAT POINT', jabatan: 'LP SUPERVISOR', totalStore: 13, phone: '0881024802233' },
  { no: 2, name: 'JAKA HARYADI', nik: '118843', homeBase: 'LW ALSUT (AHI)', jabatan: 'LP SUPERVISOR', totalStore: 13, phone: '082116008148' },
  { no: 3, name: 'SISWANTO', nik: '115172', homeBase: 'HCI LW ALSUT (HCIR)', jabatan: 'LP SUPERVISOR', totalStore: 12, phone: '087812574266' },
  { no: 4, name: 'ASEP SUNANDAR', nik: '094848', homeBase: 'LIVING PLAZA BINTARO', jabatan: 'LP SUPERVISOR', totalStore: 11, phone: '087774235784' },
  { no: 5, name: 'EKO TRIYONO', nik: '104354', homeBase: 'MALL Q BIG BSD', jabatan: 'LP SUPERVISOR', totalStore: 11, phone: '082114787667' },
  { no: 6, name: 'IWAN HENDRA SAPUTRA', nik: '097485', homeBase: 'LIVING WORLD ALAM SUTERA', jabatan: 'ARH', totalStore: 9, phone: '082116008148' },
  { no: 7, name: 'ARIYANTO ANDRIE', nik: '107419', homeBase: 'MALL KARAWACI', jabatan: 'LP SUPERVISOR', totalStore: 9, phone: '082122944455' },
  { no: 8, name: 'AZULI RAHMAN', nik: '107229', homeBase: 'LP PAMULANG', jabatan: 'LP SUPERVISOR', totalStore: 9, phone: '082124153406' },
  { no: 9, name: 'MUZAINI', nik: '004930', homeBase: 'KARANG MULYA', jabatan: 'LP SUPERVISOR', totalStore: 9, phone: '085780749203' },
  { no: 10, name: 'NANA SURYANA', nik: '189403', homeBase: 'MALL CILEGON', jabatan: 'LP SUPERVISOR', totalStore: 8, phone: '085155477014' },
  { no: 11, name: 'DIDIK WAHYUDI', nik: 'E04309', homeBase: 'SERANG', jabatan: 'LP SUPERVISOR', totalStore: 8, phone: '08989123035' },
  { no: 12, name: 'FIRMANSYAH', nik: '107325', homeBase: 'LP PALM SEMI', jabatan: 'LP SUPERVISOR', totalStore: 7, phone: '085810588470' },
  { no: 13, name: 'ASRI MAHMUD', nik: '005395', homeBase: 'PARAMOUNT', jabatan: 'LP SUPERVISOR', totalStore: 7, phone: '085691955120' },
  { no: 14, name: 'BAMBANG SANTOSO', nik: '106465', homeBase: 'REMPOA', jabatan: 'LP SUPERVISOR', totalStore: 7, phone: '0895619504041' },
  { no: 15, name: 'MURJANI', nik: 'E04306', homeBase: 'CITRA RAYA', jabatan: 'TOBE SPV', totalStore: 8, phone: '08989123035' },
  { no: 16, name: 'MUSTAR', nik: '097496', homeBase: 'PET KINGDOME', jabatan: 'LP SUPERVISOR', totalStore: 3, phone: '08998282727' },
  { no: 17, name: 'VAISAL VAHMI', nik: '004121', homeBase: 'DC CIKANDE 1', jabatan: 'LP SUPERVISOR', totalStore: 1, phone: '085211179154' },
  { no: 18, name: 'SATIMIN', nik: '001695', homeBase: 'DC CIKUPA', jabatan: 'LP SUPERVISOR / DC', totalStore: 1, phone: '085966213900' },
  { no: 19, name: 'DARJATUL HAJI', nik: '108656', homeBase: 'DC CIKANDE 2', jabatan: 'LP SUPERVISOR', totalStore: 1 },
  { no: 20, name: 'NOVFRIANTO BAIDIWAN', nik: '101402', homeBase: 'AREA BANTEN', jabatan: 'LP AREA MANAGER', totalStore: 147 },
];

// Helper normalisasi nama supervisor
export const normalizeSpvName = (name: string): string => {
  return name
    .toUpperCase()
    .replace(/NO\s+LP\s+SPV\s*\(DIRECT\s+/gi, '')
    .replace(/\(PROMOSI\)/gi, '')
    .replace(/\)/g, '')
    .replace(/[.,\s]+/g, ' ')
    .replace(/\bHARIYADI\b/g, 'HARYADI')
    .replace(/\bSUNDANDAR\b/g, 'SUNANDAR')
    .replace(/\bFIRMANSYH\b/g, 'FIRMANSYAH')
    .replace(/\bAZZULI\b/g, 'AZULI')
    .trim();
};

// Helper untuk mengambil NIK resmi berdasarkan nama supervisor
export const getSupervisorNik = (spvName: string): string => {
  if (!spvName) return '';
  const clean = normalizeSpvName(spvName);
  if (!clean) return '';

  for (const s of BU_BANTEN_SUPERVISORS) {
    const sName = normalizeSpvName(s.name);
    if (clean === sName || clean.includes(sName) || sName.includes(clean)) {
      return s.nik;
    }
  }

  // Token match (e.g. single name "Fariz")
  const tokens = clean.split(' ').filter(t => t.length >= 3);
  for (const s of BU_BANTEN_SUPERVISORS) {
    const sTokens = normalizeSpvName(s.name).split(' ');
    if (tokens.some(t => sTokens.includes(t))) {
      return s.nik;
    }
  }

  try {
    const saved = localStorage.getItem(`nik_${clean}`);
    if (saved) return saved;
  } catch (e) {
    // ignore
  }

  return '';
};

// Helper untuk mengambil daftar toko yang dipegang oleh PIC LP Supervisor
export const getStoresBySupervisor = (spvName: string): BUBantenStore[] => {
  if (!spvName) return BU_BANTEN_STORES;
  const clean = normalizeSpvName(spvName);
  return BU_BANTEN_STORES.filter(store => {
    const sName = normalizeSpvName(store.lpSpv);
    return sName === clean || clean.includes(sName) || sName.includes(clean);
  });
};

// Helper untuk mengambil Toko Home Base dari Supervisor
export const getHomeBaseStore = (spvName: string): BUBantenStore | undefined => {
  if (!spvName) return undefined;
  const clean = normalizeSpvName(spvName);
  return BU_BANTEN_STORES.find(store => {
    const sName = normalizeSpvName(store.lpSpv);
    return (sName === clean || clean.includes(sName) || sName.includes(clean)) && store.isHomeBase;
  });
};

// Helper untuk menyimpan pembaruan NIK pengguna ke localStorage
export const saveSupervisorNik = (spvName: string, nikValue: string): void => {
  if (!spvName || !nikValue) return;
  const clean = normalizeSpvName(spvName);
  try {
    localStorage.setItem(`nik_${clean}`, nikValue.trim());
  } catch (e) {
    // ignore
  }
};
