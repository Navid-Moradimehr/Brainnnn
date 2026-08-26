"use client";

import Link from "next/link";
import { FlaskConical, ShieldCheck, Database, Server } from "lucide-react";
import { useI18n } from "@/i18n/I18nProvider";

export default function AboutPage() {
  const { t } = useI18n();
  return (
    <div className="min-h-full">
      <div className="mx-auto max-w-3xl px-6 py-10">
        <p className="text-label text-muted-foreground">{t("about.label")}</p>
        <h1 className="mt-1 text-xl font-semibold tracking-tight">{t("about.title")}</h1>

        <div className="mt-6 rounded-md border border-warn/30 bg-warn-soft p-4" role="note">
          <p className="flex items-start gap-2.5 text-sm leading-relaxed text-status-warn">
            <FlaskConical className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
            {t("about.disclaimer")}
          </p>
        </div>

        <section className="mt-8 space-y-6 text-sm leading-relaxed text-muted-foreground">
          <div>
            <h2 className="flex items-center gap-2 text-sm font-medium text-foreground">
              <ShieldCheck className="h-4 w-4 text-status-ok" aria-hidden /> {t("about.realVsMock")}
            </h2>
            <p className="mt-2">{t("about.realVsMockBody")}</p>
          </div>
          <div>
            <h2 className="flex items-center gap-2 text-sm font-medium text-foreground">
              <Server className="h-4 w-4 text-status-info" aria-hidden /> {t("about.arch")}
            </h2>
            <p className="mt-2">{t("about.archBody")}</p>
          </div>
          <div>
            <h2 className="flex items-center gap-2 text-sm font-medium text-foreground">
              <Database className="h-4 w-4 text-status-warn" aria-hidden /> {t("about.data")}
            </h2>
            <p className="mt-2">{t("about.dataBody")}</p>
          </div>
        </section>

        <Link href="/" className="mt-10 inline-block text-sm text-status-ok underline underline-offset-4">
          {t("about.back")}
        </Link>
      </div>
    </div>
  );
}
