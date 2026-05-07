"use client";
import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  IconDashboard, IconExternalLink, IconAlertTriangle, IconCheck,
  IconUsers, IconChartBar, IconClockHour4
} from "@tabler/icons-react";
import { SpotlightCard } from "@/components/aceternity/spotlight";
import { BentoGrid, BentoGridItem } from "@/components/aceternity/bento-grid";
import { AnimatedModal } from "@/components/aceternity/animated-modal";
import { AuroraBackground } from "@/components/aceternity/aurora-background";
import { StatusDonut } from "@/components/charts/StatusDonut";
import { PeopleBar } from "@/components/charts/PeopleBar";
import { PipelineFunnel } from "@/components/charts/PipelineFunnel";
import {
  cn, ClickUpTask, DashboardData,
  isDone, isOpen, isInProgress, fmtPct, fmtDateTime,
} from "@/lib/utils";

const AREAS = [
  { space: "COMERCIAL", tagline: "TikTokShop · Marketplaces · Vendas", featured: true },
  { space: "PRODUCAO", tagline: "Pipeline E1 → E4 · Criação ao estoque", featured: false },
  { space: "OPERACIONAL", tagline: "Pedidos · Fluxo de peças · Devoluções", featured: false },
  { space: "GESTAO", tagline: "PCP · Pessoas · Custo", featured: false },
  { space: "Criativo", tagline: "Design · Coleções · Conteúdo", featured: false },
];

const PIPELINE_FOLDERS = [
  { id: "901317910419", code: "E1", name: "Piloto", desc: "Mockup + arte" },
  { id: "901317910425", code: "E2", name: "Viabilidade", desc: "Aprovação + cadastro" },
  { id: "901317910566", code: "E3", name: "Produção", desc: "Corte · costura · estampa" },
  { id: "901317910592", code: "E4", name: "Final", desc: "Entrada estoque" },
];

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedSpace, setSelectedSpace] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<number>(Date.now());

  // Initial load + auto-refresh every 5 minutes (client-side)
  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(
          `${process.env.NODE_ENV === "production" ? "/dmuniz-dashboard" : ""}/data.json?t=${Date.now()}`
        );
        const json = await res.json();
        setData(json);
        setLastRefresh(Date.now());
      } catch (e) {
        console.error("Failed to load data:", e);
      } finally {
        setLoading(false);
      }
    };
    load();
    const id = setInterval(load, 5 * 60 * 1000); // 5 min
    return () => clearInterval(id);
  }, []);

  const tasks = data?.tasks || [];
  const total = tasks.length;
  const done = useMemo(() => tasks.filter(isDone).length, [tasks]);
  const inProgress = useMemo(() => tasks.filter(isInProgress).length, [tasks]);
  const noAssign = useMemo(() => tasks.filter((t) => !t.person_detected).length, [tasks]);
  const noDate = useMemo(() => tasks.filter((t) => !t.due_date && isOpen(t)).length, [tasks]);

  const statusData = useMemo(
    () => [
      { name: "Concluídas", value: done, color: "#10b981" },
      { name: "Em andamento", value: inProgress, color: "#f59e0b" },
      { name: "Não iniciadas", value: total - done - inProgress, color: "#3a3a3a" },
    ],
    [done, inProgress, total]
  );

  const pipelineData = useMemo(
    () =>
      PIPELINE_FOLDERS.map((f) => {
        const t = tasks.filter((x) => x.folder_id === f.id);
        return { stage: f.code, total: t.length, done: t.filter(isDone).length };
      }),
    [tasks]
  );

  const peopleData = useMemo(() => {
    const counts: Record<string, number> = {};
    tasks.forEach((t) => {
      const p = t.person_detected || "(sem dono)";
      counts[p] = (counts[p] || 0) + 1;
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .map(([name, value]) => ({ name, value }));
  }, [tasks]);

  const areaTasks = useMemo(
    () => (selectedSpace ? tasks.filter((t) => t.space === selectedSpace) : []),
    [selectedSpace, tasks]
  );

  if (loading || !data) return <LoadingScreen />;

  return (
    <main className="bg-dots min-h-screen">
      <AuroraBackground>
        <div className="mx-auto max-w-[1400px] px-6 py-10 lg:px-10 lg:py-14">
          {/* HEADER */}
          <header className="mb-12 flex flex-wrap items-end justify-between gap-6 border-b border-line pb-8">
            <div>
              <div className="mb-3 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[2px] text-muted">
                <span className="live-dot" />
                Dashboard ao vivo · Sincronizado via ClickUp API
              </div>
              <h1 className="text-5xl font-extrabold tracking-tighter text-white lg:text-6xl">
                DMUNIZ <em className="font-serif font-normal italic text-muted">executive</em>
              </h1>
              <p className="mt-3 max-w-xl text-sm text-muted">
                Visão única da operação para Carol &amp; David. Pipeline, comercial, gestão e operacional em uma só tela.
              </p>
            </div>
            <div className="text-right font-mono text-[10px] uppercase tracking-[1.5px] text-muted">
              Última sincronização
              <strong className="mt-1 block text-xs tracking-[0.5px] text-white">
                {fmtDateTime(data.fetched_at)}
              </strong>
              <RefreshCountdown lastRefresh={lastRefresh} />
            </div>
          </header>

          {/* KPIs */}
          <section className="mb-12 grid gap-3 md:grid-cols-2 lg:grid-cols-4">
            <SpotlightCard
              className="bg-gradient-to-br from-emerald-500/10 to-transparent border-emerald-500/30"
              spotlightColor="rgba(16, 185, 129, 0.12)"
            >
              <div className="p-6">
                <KPILabel>Tasks no sistema</KPILabel>
                <KPIValue value={total} />
                <KPISub>5 áreas · 11 papéis · operação completa</KPISub>
              </div>
            </SpotlightCard>
            <SpotlightCard>
              <div className="p-6">
                <KPILabel>Concluídas</KPILabel>
                <KPIValue value={done} suffix={fmtPct(done, total)} />
                <KPISub>{done === 0 ? "Ninguém marcou conclusão ainda" : "Tasks finalizadas"}</KPISub>
              </div>
            </SpotlightCard>
            <SpotlightCard>
              <div className="p-6">
                <KPILabel>Em andamento</KPILabel>
                <KPIValue value={inProgress} />
                <KPISub>
                  {inProgress === 0 ? "ClickUp parado — equipe não move tasks" : "Tasks ativas agora"}
                </KPISub>
              </div>
            </SpotlightCard>
            <SpotlightCard
              className={noAssign > 0 ? "border-amber-500/30" : undefined}
              spotlightColor="rgba(245, 158, 11, 0.10)"
            >
              <div className="p-6">
                <KPILabel>Sem responsável</KPILabel>
                <KPIValue value={noAssign} suffix={fmtPct(noAssign, total)} />
                <KPISub>Sem dono = nada acontece. Atribuir oficialmente.</KPISub>
              </div>
            </SpotlightCard>
          </section>

          {/* CHARTS ROW */}
          <SectionTitle icon={<IconChartBar size={14} />}>
            Visão analítica · <em>distribuição e funil</em>
          </SectionTitle>
          <section className="mb-12 grid gap-3 lg:grid-cols-3">
            <Panel title="Status">
              <StatusDonut data={statusData} />
              <div className="mt-3 flex flex-wrap justify-center gap-3 text-xs">
                {statusData.map((d) => (
                  <div key={d.name} className="flex items-center gap-1.5">
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{ background: d.color }}
                    />
                    <span className="text-muted">{d.name}</span>
                    <span className="font-mono text-white">{d.value}</span>
                  </div>
                ))}
              </div>
            </Panel>

            <Panel title="Pipeline E1 → E4" wide>
              <PipelineFunnel data={pipelineData} />
              <div className="mt-2 flex justify-center gap-4 font-mono text-[10px] uppercase tracking-widest text-muted">
                <span>
                  <span className="mr-1.5 inline-block h-2 w-2 rounded bg-line-strong" />
                  Total
                </span>
                <span>
                  <span className="mr-1.5 inline-block h-2 w-2 rounded bg-emerald-500" />
                  Concluídas
                </span>
              </div>
            </Panel>
          </section>

          {/* ÁREAS BENTO */}
          <SectionTitle icon={<IconDashboard size={14} />}>
            Áreas · <em>clique para abrir o detalhe</em>
          </SectionTitle>
          <BentoGrid className="mb-12 md:grid-cols-3 md:auto-rows-[14rem]">
            {AREAS.map((cfg) => {
              const t = tasks.filter((x) => x.space === cfg.space);
              const d = t.filter(isDone).length;
              return (
                <BentoGridItem
                  key={cfg.space}
                  featured={cfg.featured}
                  className={cfg.featured ? "md:col-span-2 md:row-span-2" : ""}
                  onClick={() => {
                    setSelectedSpace(cfg.space);
                    setModalOpen(true);
                  }}
                >
                  <div>
                    <div className="font-mono text-[9px] uppercase tracking-[2px] text-muted">
                      Área operacional
                    </div>
                    <div
                      className={cn(
                        "mt-1 font-bold tracking-tighter",
                        cfg.featured ? "text-3xl lg:text-4xl" : "text-xl"
                      )}
                    >
                      {cfg.space}
                    </div>
                    <div className="mt-2 text-xs text-muted">{cfg.tagline}</div>
                  </div>
                  <div className="mt-auto">
                    <div className="flex items-baseline gap-2">
                      <div
                        className={cn(
                          "font-extrabold tracking-tighter",
                          cfg.featured ? "text-6xl" : "text-4xl"
                        )}
                      >
                        {t.length}
                      </div>
                      <div className="font-serif italic text-muted">
                        {t.length === 1 ? "task" : "tasks"}
                      </div>
                    </div>
                    {t.length > 0 && (
                      <div className="mt-3 flex items-center gap-3 text-xs text-muted">
                        <span>{d} concluídas</span>
                        <span>·</span>
                        <span>{fmtPct(d, t.length)}</span>
                      </div>
                    )}
                    <div className="mt-4 flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[1.8px] text-muted transition-colors group-hover/bento:text-white">
                      Ver detalhes
                      <span className="transition-transform group-hover/bento:translate-x-1">→</span>
                    </div>
                  </div>
                </BentoGridItem>
              );
            })}
          </BentoGrid>

          {/* PESSOAS + ALERTAS */}
          <SectionTitle icon={<IconUsers size={14} />}>
            Pessoas &amp; alertas · <em>onde a operação trava</em>
          </SectionTitle>
          <section className="mb-12 grid gap-3 lg:grid-cols-2">
            <Panel title="Carga por pessoa">
              <PeopleBar data={peopleData} />
            </Panel>
            <Panel title="Alertas">
              <Alerts {...{ noAssign, noDate, inProgress, total, tasks }} />
            </Panel>
          </section>

          {/* FOOTER */}
          <footer className="mt-16 flex flex-wrap items-center justify-between gap-4 border-t border-line pt-6 text-xs text-muted">
            <div>DMUNIZ · Dashboard sincronizado do ClickUp DMPROJETO via API</div>
            <a
              href="https://app.clickup.com/90133119220/"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg border border-line-strong px-3 py-2 text-white transition-colors hover:bg-white hover:text-black"
            >
              Abrir ClickUp <IconExternalLink size={12} />
            </a>
          </footer>
        </div>
      </AuroraBackground>

      {/* MODAL */}
      <AnimatedModal open={modalOpen} onClose={() => setModalOpen(false)}>
        {selectedSpace && (
          <>
            <div className="mb-7 flex items-start justify-between border-b border-line pb-5">
              <div>
                <div className="font-mono text-[10px] uppercase tracking-[2px] text-muted">
                  Área · {selectedSpace}
                </div>
                <div className="mt-1.5 text-3xl font-extrabold tracking-tight">
                  {selectedSpace} <em className="font-serif font-normal italic text-muted">· detalhe</em>
                </div>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="grid h-9 w-9 place-items-center rounded-lg border border-line bg-surface-2 text-base transition-colors hover:bg-white hover:text-black"
              >
                ✕
              </button>
            </div>
            <ModalStats tasks={areaTasks} />
            <div className="mb-3 mt-7 font-serif italic text-base">Tasks da área</div>
            <div className="space-y-2">
              {areaTasks.length === 0 && (
                <div className="rounded-xl border border-line bg-surface-2 p-8 text-center text-sm text-muted">
                  Sem tasks nessa área.
                </div>
              )}
              {areaTasks.map((t) => (
                <div
                  key={t.id}
                  className="flex items-center justify-between gap-3 rounded-xl border border-line p-4 transition-colors hover:border-line-strong hover:bg-surface-2"
                >
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium">{t.name}</div>
                    {t.folder && (
                      <div className="mt-1 font-mono text-[10px] uppercase tracking-wider text-muted">
                        {t.folder}
                      </div>
                    )}
                  </div>
                  <span className="rounded-full border border-line bg-surface-2 px-2.5 py-1 font-mono text-[9px] uppercase tracking-wider text-muted">
                    {t.status || "—"}
                  </span>
                  {t.url && (
                    <a
                      href={t.url}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-lg border border-line px-2.5 py-1 font-mono text-[10px] text-muted transition-colors hover:bg-white hover:text-black"
                    >
                      ClickUp ↗
                    </a>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </AnimatedModal>
    </main>
  );
}

/* ===== Components ===== */
function KPILabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="font-mono text-[10px] uppercase tracking-[1.8px] text-muted">{children}</div>
  );
}
function KPIValue({ value, suffix }: { value: number; suffix?: string }) {
  return (
    <div className="mt-3 flex items-baseline gap-2">
      <div className="text-5xl font-extrabold tracking-tighter">{value}</div>
      {suffix && <div className="font-serif italic text-base text-muted">{suffix}</div>}
    </div>
  );
}
function KPISub({ children }: { children: React.ReactNode }) {
  return <div className="mt-2.5 text-xs text-muted">{children}</div>;
}

function SectionTitle({ children, icon }: { children: React.ReactNode; icon?: React.ReactNode }) {
  return (
    <div className="mb-4 flex items-center gap-3 font-mono text-[10px] uppercase tracking-[2.5px] text-muted">
      {icon}
      <span>{children}</span>
      <div className="ml-2 h-px flex-1 bg-line" />
    </div>
  );
}

function Panel({
  title,
  children,
  wide = false,
}: {
  title: string;
  children: React.ReactNode;
  wide?: boolean;
}) {
  return (
    <div className={cn("rounded-2xl border border-line bg-surface p-6", wide && "lg:col-span-2")}>
      <div className="mb-4 font-serif italic text-base text-white">{title}</div>
      {children}
    </div>
  );
}

function ModalStats({ tasks }: { tasks: ClickUpTask[] }) {
  const done = tasks.filter(isDone).length;
  const open = tasks.length - done;
  const noAssign = tasks.filter((t) => !t.person_detected).length;
  const cells = [
    { label: "Total", value: tasks.length },
    { label: "Pendentes", value: open },
    { label: "Concluídas", value: done },
    { label: "Sem dono", value: noAssign },
  ];
  return (
    <div className="grid gap-2.5 md:grid-cols-4">
      {cells.map((c) => (
        <div key={c.label} className="rounded-xl border border-line bg-surface-2 p-4">
          <div className="font-mono text-[9px] uppercase tracking-[1.5px] text-muted">
            {c.label}
          </div>
          <div className="mt-1.5 text-2xl font-extrabold tracking-tight">{c.value}</div>
        </div>
      ))}
    </div>
  );
}

function Alerts({
  noAssign,
  noDate,
  inProgress,
  total,
  tasks,
}: {
  noAssign: number;
  noDate: number;
  inProgress: number;
  total: number;
  tasks: ClickUpTask[];
}) {
  const lastUpdated = Math.max(...tasks.map((t) => Number(t.date_updated || 0)));
  const daysSince = Math.floor((Date.now() - lastUpdated) / 86400000);
  const list: { cls: "bad" | "warn" | "ok"; text: React.ReactNode; icon: React.ReactNode }[] = [];
  if (noAssign > 0)
    list.push({
      cls: "bad",
      icon: <IconAlertTriangle size={14} />,
      text: (
        <>
          <strong>{noAssign} tasks sem responsável detectado.</strong> Atribuir oficialmente no ClickUp.
        </>
      ),
    });
  if (noDate > 0)
    list.push({
      cls: "warn",
      icon: <IconClockHour4 size={14} />,
      text: (
        <>
          <strong>{noDate} tasks sem data de entrega.</strong> Sem prazo, nada acontece.
        </>
      ),
    });
  if (inProgress === 0 && total > 0)
    list.push({
      cls: "bad",
      icon: <IconAlertTriangle size={14} />,
      text: (
        <>
          <strong>Nenhuma task em andamento.</strong> Equipe não está movimentando o ClickUp.
        </>
      ),
    });
  if (daysSince > 7)
    list.push({
      cls: "bad",
      icon: <IconAlertTriangle size={14} />,
      text: (
        <>
          <strong>Última atualização há {daysSince} dias.</strong> ClickUp parado.
        </>
      ),
    });
  if (list.length === 0)
    list.push({
      cls: "ok",
      icon: <IconCheck size={14} />,
      text: (
        <>
          <strong>Operação saudável.</strong> Sem alertas.
        </>
      ),
    });

  return (
    <div className="space-y-2">
      {list.map((a, i) => (
        <div
          key={i}
          className={cn(
            "flex items-start gap-3 rounded-xl border p-4 text-sm",
            a.cls === "bad" && "border-red-500/30 bg-red-500/5",
            a.cls === "warn" && "border-amber-500/30 bg-amber-500/5",
            a.cls === "ok" && "border-emerald-500/30 bg-emerald-500/5"
          )}
        >
          <div
            className={cn(
              "mt-0.5 grid h-6 w-6 flex-shrink-0 place-items-center rounded-full text-white",
              a.cls === "bad" && "bg-red-500",
              a.cls === "warn" && "bg-amber-500",
              a.cls === "ok" && "bg-emerald-500"
            )}
          >
            {a.icon}
          </div>
          <div className="leading-relaxed">{a.text}</div>
        </div>
      ))}
    </div>
  );
}

function RefreshCountdown({ lastRefresh }: { lastRefresh: number }) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 30 * 1000);
    return () => clearInterval(id);
  }, []);
  const elapsed = Math.floor((now - lastRefresh) / 60000);
  const next = Math.max(0, 5 - elapsed);
  return (
    <div className="mt-1.5 text-[9px] tracking-widest text-muted">
      próximo refresh em ~{next}min
    </div>
  );
}

function LoadingScreen() {
  return (
    <div className="grid min-h-screen place-items-center">
      <div className="text-center">
        <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-2 border-line border-t-emerald-500" />
        <div className="font-mono text-xs uppercase tracking-widest text-muted">Carregando dashboard…</div>
      </div>
    </div>
  );
}
