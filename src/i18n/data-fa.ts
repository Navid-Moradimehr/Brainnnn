/**
 * Persian translations for mock-data display strings (audit actions,
 * diagnoses, series descriptions, constraint rationales, …).
 * Keys are the exact English strings used in src/lib/mock; unmatched
 * strings fall back to their English original via td().
 */
export const dataFa: Record<string, string> = {
  "Optic nerves": "عصب‌های بینایی",
  Lenses: "عدسی‌ها",
  Lens: "عدسی",
  system: "سیستم",
  approved: "تأییدشده",
  pending: "در انتظار",

  // diagnoses
  "Glioblastoma, right frontal": "گلیوبلاستوما، پیشانی راست",
  "Glioblastoma, left temporal": "گلیوبلاستوما، گیجگاهی چپ",
  "Glioblastoma, right parietal": "گلیوبلاستوما، آهیانه راست",

  // structure names
  Brainstem: "ساقهٔ مغز",
  "Optic chiasm": "کیاسمای بینایی",
  "Optic nerve L": "عصب بینایی چپ",
  "Optic nerve R": "عصب بینایی راست",
  "Eye L": "چشم چپ",
  "Eye R": "چشم راست",
  "Lens L": "عدسی چپ",
  "Lens R": "عدسی راست",
  "Normal brain − PTV": "مغز سالم منهای PTV",

  // series descriptions
  "Planning CT, head fixation": "CT برنامه‌ریزی، فیکساسیون سر",
  "T1c MRI, registered to CT": "MRI با کنتراست، ثبت‌شده روی CT",
  "T1c MRI, registration suspect near vertex": "MRI با کنتراست، ثبت مشکوک در ناحیهٔ فرق سر",
  "T1c MRI, registration suspect near vertex slices.":
    "ثبت MRI روی CT در برش‌های نزدیک فرق سر نیازمند بازبینی است.",

  // registration warnings
  "MRI-to-CT registration requires review — confidence 0.71 below threshold 0.85 near vertex slices.":
    "ثبت MRI روی CT نیازمند بازبینی است — اطمینان ۰٫۷۱ زیر آستانهٔ ۰٫۸۵ در برش‌های نزدیک فرق سر.",
  "CT slice thickness 2.0 mm exceeds protocol preference of ≤ 1.5 mm; acceptable with review.":
    "ضخامت برش CT برابر ۲٫۰ میلی‌متر از ترجیح پروتکل (حداکثر ۱٫۵ میلی‌متر) بیشتر است؛ با بازبینی قابل قبول است.",
  "Required OAR contour incomplete: optic chiasm — add or import updated RTSTRUCT.":
    "کانتور اندام در معرض خطر الزامی ناقص است: کیاسمای بینایی — RTSTRUCT به‌روزشده را بیفزایید یا درون‌بری کنید.",
  "Contour incomplete — flagged at import.": "کانتور ناقص — هنگام درون‌بری پرچم‌گذاری شد.",

  // structure notes
  "3 mm expansion confirmed.": "گسترش ۳ میلی‌متری تأیید شد.",
  "Chiasm contour verified on fused series.": "کانتور کیاسما روی سری‌های هم‌پوشان بازبینی شد.",

  // audit actions
  "Planning CT imported (CT_PLN, 148 slices)": "CT برنامه‌ریزی درون‌بری شد (CT_PLN، ۱۴۸ برش)",
  "Planning CT imported (CT_PLN, 141 slices)": "CT برنامه‌ریزی درون‌بری شد (CT_PLN، ۱۴۱ برش)",
  "Planning CT imported (CT_PLN, 152 slices)": "CT برنامه‌ریزی درون‌بری شد (CT_PLN، ۱۵۲ برش)",
  "T1c MRI imported and registered to CT (conf. 0.94)":
    "MRI درون‌بری و روی CT ثبت شد (اطمینان ۰٫۹۴)",
  "T1c MRI imported — registration confidence low":
    "MRI درون‌بری شد — اطمینان ثبت پایین",
  "T1c MRI registered to CT (conf. 0.96)": "MRI روی CT ثبت شد (اطمینان ۰٫۹۶)",
  "Registration QC approved": "کنترل کیفیت ثبت تصاویر تأیید شد",
  "Returned to import for re-registration": "برای ثبت مجدد به درون‌بری بازگشت",
  "Target volumes GTV/CTV/PTV approved": "حجم‌های هدف GTV/CTV/PTV تأیید شد",
  "Clinician approved target and OAR contours": "پزشک کانتورهای هدف و اندام در معرض خطر را تأیید کرد",
  "Plan intent confirmed": "قصد درمان تأیید شد",
  "Candidate generation job queued (research forecast)":
    "فرایند تولید نامزد در صف قرار گرفت (پیش‌بینی پژوهشی)",
  "Research candidate dose forecast generated (cand-0241-a)":
    "پیش‌بینی دز نامزد پژوهشی تولید شد (cand-0241-a)",
  "Research candidate dose forecast ready (cand-0241-a)":
    "پیش‌بینی دز نامزد پژوهشی آماده است (cand-0241-a)",
  "Automatic QC flagged vertex region mismatch": "کنترل کیفیت خودکار ناهم‌خوانی ناحیهٔ فرق سر را پرچم‌گذاری کرد",
  "Contours approved": "کانتورها تأیید شد",
  "Candidate forecast generated (cand-0177-a)": "پیش‌بینی نامزد تولید شد (cand-0177-a)",
  "Review decision recorded — approved for TPS recalculation":
    "تصمیم بازبینی ثبت شد — برای بازمحاسبهٔ TPS تأیید شد",
  "Review decision recorded — revisions required":
    "تصمیم بازبینی ثبت شد — اصلاحیه لازم است",
  "Export package prepared (report + JSON)": "بستهٔ برون‌بری آماده شد (گزارش + JSON)",
  "Case created via import wizard": "پرونده از طریق جادوگر درون‌بری ایجاد شد",
  "Candidate forecast attached": "پیش‌بینی نامزد پیوست شد",

  // constraint rationales
  "Candidate lifts coverage by 1.7 Gy vs reference — the gain that justifies near-limit optic nerve dose.":
    "نامزد پوشش را ۱٫۷ گری نسبت به مرجع بالا می‌برد — همان دستاوردی که دز نزدیک به حد عصب بینایی را توجیه می‌کند.",
  "Well inside limit; candidate slightly improves on reference.":
    "کاملاً داخل حد مجاز؛ نامزد اندکی بهتر از مرجع است.",
  "Headroom of 5.1 Gy retained.": "حاشیهٔ امنیت ۵٫۱ گری حفظ شده است.",
  "Left nerve within 1.6 Gy of limit. Accepted trade-off against PTV coverage (see c-ptv-d95).":
    "عصب چپ ۱٫۶ گری با حد فاصله دارد. بده‌بستان پذیرفته‌شده در برابر پوشش PTV (بنگرید به c-ptv-d95).",
  "High-dose spillage band rises with improved conformity; still inside protocol ceiling.":
    "بازهٔ پخش دز بالا با بهبود هم‌سازی افزایش یافته؛ همچنان زیر سقف پروتکل است.",

  // constraint basis
  "Protocol coverage objective for PTV7020": "هدف پوشش پروتکل برای PTV",
  "Critical serial structure hard limit": "حد سخت ساختار سریال بحرانی",
  "Optic apparatus hard limit": "حد سخت دستگاه بینایی",
  "Flagged within 2 Gy of limit for physicist review": "در فاصلهٔ ۲ گری از حد برای بازبینی فیزیک‌دان پرچم‌گذاری می‌شود",
  "ALARA objective for lenses": "هدف کمینه‌سازی تابش برای عدسی‌ها",
  "High-dose spillage band, % volume": "بازهٔ پخش دز بالا، درصد حجم",

  // protocol priorities / coverage
  "Brainstem — critical serial organ": "ساقهٔ مغز — اندام سریال بحرانی",
  "Optic apparatus — chiasm prioritised over nerves": "دستگاه بینایی — کیاسما نسبت به عصب‌ها اولویت دارد",
  "Lenses — as low as reasonably achievable": "عدسی‌ها — تا حد امکان پایین‌ترین دز",
  "Normal brain — minimise high-dose volume": "مغز سالم — کمینه‌سازی حجم دز بالا",
  "D95% ≥ 57.0 Gy (95% of prescription)": "D95% بالاتر مساوی ۵۷٫۰ گری (۹۵٪ تجویز)",

  // plan summaries / decisions
  "Achievable-dose forecast prioritising PTV coverage. Left optic nerve driven to 52.4 Gy (review band) in exchange for a 1.7 Gy D95 gain over the reference plan.":
    "پیش‌بینی دز دست‌یافتنی با اولویت پوشش PTV. عصب بینایی چپ به ۵۲٫۴ گری رسیده (بازهٔ بازبینی) در ازای ۱٫۷ گری افزایش D95 نسبت به طرح مرجع.",
  "Balanced forecast; all constraints passing at export time.":
    "پیش‌بینی متوازن؛ هنگام برون‌بری همهٔ قیود قبول بود.",
  "Approved for local TPS recalculation. QA pending after recalculation.":
    "برای بازمحاسبهٔ TPS محلی تأیید شد. کنترل کیفیت پس از بازمحاسبه در انتظار است.",

  // review notes defaults
  "Left optic nerve at 52.4 Gy accepted to secure D95 coverage; physics concurrence recorded in audit.":
    "دز ۵۲٫۴ گری عصب بینایی چپ برای تضمین پوشش D95 پذیرفته شد؛ موافقت فیزیک در ممیزی ثبت شده است.",

  "SY-MERC-01 · 6 MV FFF · dual-arc VMAT": "SY-MERC-01 · 6 MV FFF · VMAT دو قوسی",

  // jobs / misc
  "Candidate already generated for this case.":
    "نامزد برای این پرونده قبلاً تولید شده است.",
};
