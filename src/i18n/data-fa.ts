/**
 * Persian translations for mock-data display strings (audit actions,
 * diagnoses, series descriptions, constraint rationales, …).
 * Keys are the exact English strings used in src/lib/mock; unmatched
 * strings fall back to their English original via td().
 */
export const dataFa: Record<string, string> = {
  system: "سیستم",
  approved: "تأییدشده",
  pending: "در انتظار",
  returned: "بازگشت‌خورده",
  adjust: "نیازمند اصلاح",

  // diagnoses
  "Glioblastoma, right frontal": "گلیوبلاستومای پیشانی راست",
  "Glioblastoma, left temporal": "گلیوبلاستومای گیجگاهی چپ",
  "Glioblastoma, right parietal": "گلیوبلاستومای آهیانه راست",

  // structure names
  Brainstem: "ساقهٔ مغز",
  "Optic chiasm": "کیاسمای بینایی",
  "Optic nerves": "عصب‌های بینایی",
  "Optic nerve L": "عصب بینایی چپ",
  "Optic nerve R": "عصب بینایی راست",
  "Eye L": "چشم چپ",
  "Eye R": "چشم راست",
  "Lens L": "عدسی چپ",
  "Lens R": "عدسی راست",
  Lens: "عدسی",
  Lenses: "عدسی‌ها",
  "Normal brain − PTV": "مغز سالم منهای PTV",

  // series descriptions
  "Planning CT, head fixation": "CT برنامه‌ریزی با فیکساسیون سر",
  "T1c MRI, registered to CT": "MRI با کنتراست، تطبیق‌یافته با CT",
  "T1c MRI, registration suspect near vertex": "MRI با کنتراست، تطبیق مشکوک در ناحیهٔ فرق سر",

  // registration warnings
  "MRI-to-CT registration requires review — confidence 0.71 below threshold 0.85 near vertex slices.":
    "تطبیق MRI با CT نیازمند بازبینی است — ضریب اطمینان ۰٫۷۱ زیر آستانهٔ ۰٫۸۵ (برش‌های نزدیک فرق سر).",
  "CT slice thickness 2.0 mm exceeds protocol preference of ≤ 1.5 mm; acceptable with review.":
    "ضخامت برش CT برابر ۲٫۰ میلی‌متر است؛ پروتکل ۱٫۵ میلی‌متر یا کمتر را ترجیح می‌دهد — با بازبینی قابل قبول است.",
  "Required OAR contour incomplete: optic chiasm — add or import updated RTSTRUCT.":
    "کانتور یکی از اندام‌های در معرض خطر ناقص است: کیاسمای بینایی — فایل RTSTRUCT به‌روز را بارگذاری کنید.",
  "Contour incomplete — flagged at import.": "کانتور ناقص است — هنگام بارگذاری علامت‌گذاری شد.",
  "MRI-to-CT registration requires review before contours can be used for dose work.":
    "تطبیق MRI با CT پیش از استفاده از کانتورها در محاسبات دز، باید بازبینی شود.",

  // structure notes
  "3 mm expansion confirmed.": "حاشیهٔ ۳ میلی‌متری تأیید شد.",
  "Chiasm contour verified on fused series.": "کانتور کیاسما روی تصاویر هم‌پوشان بازبینی و تأیید شد.",

  // audit actions
  "Planning CT imported (CT_PLN, 148 slices)": "CT برنامه‌ریزی بارگذاری شد (CT_PLN، ۱۴۸ برش)",
  "Planning CT imported (CT_PLN, 141 slices)": "CT برنامه‌ریزی بارگذاری شد (CT_PLN، ۱۴۱ برش)",
  "Planning CT imported (CT_PLN, 152 slices)": "CT برنامه‌ریزی بارگذاری شد (CT_PLN، ۱۵۲ برش)",
  "T1c MRI imported and registered to CT (conf. 0.94)":
    "MRI بارگذاری و با CT تطبیق داده شد (ضریب اطمینان ۰٫۹۴)",
  "T1c MRI imported — registration confidence low":
    "MRI بارگذاری شد — ضریب اطمینان تطبیق پایین است",
  "T1c MRI registered to CT (conf. 0.96)": "MRI با CT تطبیق داده شد (ضریب اطمینان ۰٫۹۶)",
  "Registration QC approved": "کیفیت تطبیق تصاویر تأیید شد",
  "Returned to import for re-registration": "برای تطبیق مجدد به مرحلهٔ بارگذاری بازگشت",
  "Target volumes GTV/CTV/PTV approved": "حجم‌های هدف GTV/CTV/PTV تأیید شدند",
  "Clinician approved target and OAR contours":
    "پزشک، کانتورهای هدف و اندام‌های در معرض خطر را تأیید کرد",
  "Plan intent confirmed": "قصد درمان تأیید شد",
  "Candidate generation job queued (research forecast)":
    "فرایند تولید دز کاندید در صف قرار گرفت (پیش‌بینی پژوهشی)",
  "Research candidate dose forecast generated (cand-0241-a)":
    "پیش‌بینی دز کاندید پژوهشی تولید شد (cand-0241-a)",
  "Research candidate dose forecast ready (cand-0241-a)":
    "پیش‌بینی دز کاندید پژوهشی آمادهٔ بازبینی است (cand-0241-a)",
  "Automatic QC flagged vertex region mismatch":
    "کنترل کیفیت خودکار، مغایرت ناحیهٔ فرق سر را علامت‌زد",
  "Contours approved": "کانتورها تأیید شدند",
  "Candidate forecast generated (cand-0177-a)": "پیش‌بینی دز کاندید تولید شد (cand-0177-a)",
  "Review decision recorded — approved for TPS recalculation":
    "نتیجهٔ بازبینی ثبت شد — تأیید برای بازمحاسبه در TPS",
  "Review decision recorded — revisions required":
    "نتیجهٔ بازبینی ثبت شد — اعمال اصلاحیه لازم است",
  "Export package prepared (report + JSON)": "بستهٔ خروجی آماده شد (گزارش + JSON)",
  "Case created via import wizard": "پرونده از طریق جادوگر بارگذاری ایجاد شد",
  "Candidate forecast attached": "پیش‌بینی دز کاندید پیوست شد",
  "SY-MERC-01 · 6 MV FFF · dual-arc VMAT": "SY-MERC-01 · 6 MV FFF · VMAT دو قوسی",

  // constraint rationales
  "Candidate lifts coverage by 1.7 Gy vs reference — the gain that justifies near-limit optic nerve dose.":
    "این کاندید پوشش را ۱٫۷ گری بیشتر از طرح مرجع تأمین می‌کند — همان دستاوردی که دز نزدیک به حد عصب بینایی را توجیه می‌کند.",
  "Well inside limit; candidate slightly improves on reference.":
    "کاملاً داخل حد مجاز است؛ کاندید اندکی بهتر از مرجع عمل می‌کند.",
  "Headroom of 5.1 Gy retained.": "حدود ۵٫۱ گری حاشیهٔ امنیت باقی مانده است.",
  "Left nerve within 1.6 Gy of limit. Accepted trade-off against PTV coverage (see c-ptv-d95).":
    "عصب چپ تنها ۱٫۶ گری با حد مجاز فاصله دارد. این بده‌بستان در برابر پوشش PTV پذیرفته شده است (رک c-ptv-d95).",
  "High-dose spillage band rises with improved conformity; still inside protocol ceiling.":
    "با بهبود هم‌سازی، حجم دز بالا اندکی افزایش یافته؛ اما همچنان زیر سقف پروتکل است.",

  // constraint basis
  "Protocol coverage objective for PTV7020": "هدف پوشش پروتکل برای PTV",
  "Critical serial structure hard limit": "حد سخت برای ساختار سریال بحرانی",
  "Optic apparatus hard limit": "حد سخت دستگاه بینایی",
  "Flagged within 2 Gy of limit for physicist review": "در فاصلهٔ ۲ گری از حد، برای بازبینی فیزیک‌دان علامت‌گذاری می‌شود",
  "ALARA objective for lenses": "اصل ALARA برای عدسی‌ها",
  "High-dose spillage band, % volume": "بازهٔ پخش دز بالا (درصد حجم)",

  // protocol priorities / coverage
  "Brainstem — critical serial organ": "ساقهٔ مغز — اندام سریال بحرانی",
  "Optic apparatus — chiasm prioritised over nerves": "دستگاه بینایی — کیاسما نسبت به عصب‌ها در اولویت",
  "Lenses — as low as reasonably achievable": "عدسی‌ها — دز تا حد امکان پایین",
  "Normal brain — minimise high-dose volume": "مغز سالم — کمینه‌سازی حجم دز بالا",
  "D95% ≥ 57.0 Gy (95% of prescription)": "D95% ≥ ۵۷٫۰ گری (۹۵٪ دز تجویزی)",

  // plan summaries / decisions
  "Achievable-dose forecast prioritising PTV coverage. Left optic nerve driven to 52.4 Gy (review band) in exchange for a 1.7 Gy D95 gain over the reference plan.":
    "پیش‌بینی دز دست‌یافتنی با اولویتِ پوشش PTV. عصب بینایی چپ به ۵۲٫۴ گری رسیده (بازهٔ بازبینی) و در ازای آن، D95 نسبت به طرح مرجع ۱٫۷ گری بهبود یافته است.",
  "Balanced forecast; all constraints passing at export time.":
    "پیش‌بینی متوازن؛ هنگام خروجی، همهٔ قیود در وضعیت قبول بودند.",
  "Approved for local TPS recalculation. QA pending after recalculation.":
    "برای بازمحاسبه در TPS محلی تأیید شد. کنترل کیفیت پس از بازمحاسبه انجام خواهد شد.",

  // review notes defaults
  "Left optic nerve at 52.4 Gy accepted to secure D95 coverage; physics concurrence recorded in audit.":
    "دز ۵۲٫۴ گری عصب بینایی چپ برای تضمین پوشش D95 پذیرفته شده است؛ موافقت فیزیک پزشکی در ممیزی ثبت شده است.",
};
