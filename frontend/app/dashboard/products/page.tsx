'use client';
import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Button } from '../../../components/ui/Button';
import { useRequireAuth } from '../../../hooks/useAuth';
import api, { extractErrorMessage } from '../../../lib/api';
import type { Analytics, Kpis, MonthData, TopProduct, StatusData, RatingData } from '../../../types/api';

const Spin = () => (
  <>
    <div style={{ width: 40, height: 40, border: '3px solid var(--mist)', borderTopColor: 'var(--violet)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
    <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
  </>
);

function KpiCard({ label, value, sub, accent, icon }: { label: string; value: string; sub?: string; accent: string; icon: string }) {
  return (
    <div style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '22px 24px', borderLeft: `4px solid ${accent}`, display: 'flex', alignItems: 'center', gap: 16 }}>
      <div style={{ width: 48, height: 48, borderRadius: 12, background: `${accent}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>{icon}</div>
      <div>
        <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: 4 }}>{label}</p>
        <p style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 700, color: 'var(--royal)', lineHeight: 1, marginBottom: sub ? 3 : 0 }}>{value}</p>
        {sub && <p style={{ fontSize: 11, color: 'var(--muted)' }}>{sub}</p>}
      </div>
    </div>
  );
}

function ChartCard({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '24px 28px' }}>
      <div style={{ marginBottom: 20 }}>
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, color: 'var(--royal)', marginBottom: 3 }}>{title}</h3>
        {subtitle && <p style={{ fontSize: 12, color: 'var(--muted)' }}>{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}

// ── Gráfico de linha — Receita mensal ──────────────────────────────────────────
function RevenueChart({ data }: { data: MonthData[] }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<any>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    const load = async () => {
      const { Chart, registerables } = await import('chart.js');
      Chart.register(...registerables);
      if (chartRef.current) { chartRef.current.destroy(); chartRef.current = null; }

      chartRef.current = new Chart(canvasRef.current!, {
        type: 'line',
        data: {
          labels: data.length ? data.map(d => d.label) : ['Sem dados'],
          datasets: [
            {
              label: 'Receita (R$)',
              data: data.length ? data.map(d => Number(d.revenue)) : [0],
              borderColor: '#7C3AED', backgroundColor: 'rgba(124,58,237,0.08)',
              borderWidth: 2.5, pointBackgroundColor: '#7C3AED', pointRadius: 4,
              fill: true, tension: 0.4, yAxisID: 'y',
            },
            {
              label: 'Pedidos',
              data: data.length ? data.map(d => Number(d.orders)) : [0],
              borderColor: '#059669', backgroundColor: 'rgba(5,150,105,0.06)',
              borderWidth: 2, pointBackgroundColor: '#059669', pointRadius: 4,
              fill: false, tension: 0.4, yAxisID: 'y1',
            }
          ]
        },
        options: {
          responsive: true,
          interaction: { mode: 'index', intersect: false },
          plugins: {
            legend: { position: 'top', labels: { usePointStyle: true, padding: 20, font: { family: 'Inter', size: 12 } } },
            tooltip: { callbacks: { label: ctx => ctx.datasetIndex === 0 ? ` R$ ${Number(ctx.raw).toFixed(2).replace('.', ',')}` : ` ${ctx.raw} pedido${Number(ctx.raw) !== 1 ? 's' : ''}` } }
          },
          scales: {
            x: { grid: { color: '#EDE8F5' }, ticks: { font: { family: 'Inter', size: 11 }, color: '#8B6BA8' } },
            y: { type: 'linear', position: 'left', grid: { color: '#EDE8F5' }, ticks: { font: { family: 'Inter', size: 11 }, color: '#7C3AED', callback: (v: any) => `R$ ${v}` } },
            y1: { type: 'linear', position: 'right', grid: { drawOnChartArea: false }, ticks: { font: { family: 'Inter', size: 11 }, color: '#059669' } }
          }
        }
      });
    };
    load();
    return () => { if (chartRef.current) { chartRef.current.destroy(); chartRef.current = null; } };
  }, [data]);

  return (
    <div>
      {!data.length && <p style={{ textAlign: 'center', color: 'var(--muted)', fontSize: 13, marginBottom: 12 }}>Nenhuma venda registrada ainda — o gráfico aparecerá aqui.</p>}
      <canvas ref={canvasRef} style={{ maxHeight: 280 }} />
    </div>
  );
}

// ── Gráfico de barras — Top produtos ──────────────────────────────────────────
function TopProductsChart({ data }: { data: TopProduct[] }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<any>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    const load = async () => {
      const { Chart, registerables } = await import('chart.js');
      Chart.register(...registerables);
      if (chartRef.current) { chartRef.current.destroy(); chartRef.current = null; }

      const labels = data.length ? data.map(d => d.name.length > 22 ? d.name.slice(0, 22) + '…' : d.name) : ['Sem dados'];
      chartRef.current = new Chart(canvasRef.current!, {
        type: 'bar',
        data: {
          labels,
          datasets: [
            {
              label: 'Receita (R$)',
              data: data.length ? data.map(d => Number(d.revenue)) : [0],
              backgroundColor: ['rgba(124,58,237,0.8)', 'rgba(168,85,247,0.75)', 'rgba(196,160,255,0.7)', 'rgba(233,213,255,0.8)', 'rgba(237,233,245,0.9)'],
              borderColor: ['#7C3AED', '#A855F7', '#C4A0FF', '#DDD6FE', '#EDE9F5'],
              borderWidth: 1.5, borderRadius: 6, yAxisID: 'y',
            },
            {
              label: 'Unidades',
              data: data.length ? data.map(d => Number(d.units_sold)) : [0],
              type: 'line' as any,
              borderColor: '#D97706', backgroundColor: 'rgba(217,119,6,0.1)',
              borderWidth: 2, pointBackgroundColor: '#D97706', pointRadius: 5, tension: 0.3, yAxisID: 'y1',
            }
          ]
        },
        options: {
          responsive: true,
          interaction: { mode: 'index', intersect: false },
          plugins: {
            legend: { position: 'top', labels: { usePointStyle: true, padding: 20, font: { family: 'Inter', size: 12 } } },
            tooltip: { callbacks: { label: ctx => ctx.datasetIndex === 0 ? ` R$ ${Number(ctx.raw).toFixed(2).replace('.', ',')}` : ` ${ctx.raw} unid.` } }
          },
          scales: {
            x: { grid: { color: '#EDE8F5' }, ticks: { font: { family: 'Inter', size: 11 }, color: '#8B6BA8' } },
            y: { position: 'left', grid: { color: '#EDE8F5' }, ticks: { font: { family: 'Inter', size: 11 }, color: '#7C3AED', callback: (v: any) => `R$ ${v}` } },
            y1: { position: 'right', grid: { drawOnChartArea: false }, ticks: { font: { family: 'Inter', size: 11 }, color: '#D97706' } }
          }
        }
      });
    };
    load();
    return () => { if (chartRef.current) { chartRef.current.destroy(); chartRef.current = null; } };
  }, [data]);

  return (
    <div>
      {!data.length && <p style={{ textAlign: 'center', color: 'var(--muted)', fontSize: 13, marginBottom: 12 }}>Nenhum produto vendido ainda.</p>}
      <canvas ref={canvasRef} style={{ maxHeight: 260 }} />
    </div>
  );
}

// ── Gráfico de rosca — Status dos pedidos ─────────────────────────────────────
function OrderStatusChart({ data }: { data: StatusData[] }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<any>(null);

  const statusLabel: Record<string, string> = { paid: 'Pago', pending: 'Pendente', cancelled: 'Cancelado', approved: 'Aprovado' };
  const statusColor: Record<string, string> = { paid: '#059669', pending: '#D97706', cancelled: '#DC2626', approved: '#059669' };

  useEffect(() => {
    if (!canvasRef.current) return;
    const load = async () => {
      const { Chart, registerables } = await import('chart.js');
      Chart.register(...registerables);
      if (chartRef.current) { chartRef.current.destroy(); chartRef.current = null; }

      const hasData = data.length > 0;
      chartRef.current = new Chart(canvasRef.current!, {
        type: 'doughnut',
        data: {
          labels: hasData ? data.map(d => statusLabel[d.status] || d.status) : ['Sem pedidos'],
          datasets: [{
            data: hasData ? data.map(d => Number(d.count)) : [1],
            backgroundColor: hasData ? data.map(d => statusColor[d.status] || '#8B6BA8') : ['#EDE8F5'],
            borderColor: '#fff', borderWidth: 3, hoverOffset: 6,
          }]
        },
        options: {
          responsive: true, cutout: '65%',
          plugins: {
            legend: { position: 'bottom', labels: { usePointStyle: true, padding: 16, font: { family: 'Inter', size: 12 } } },
            tooltip: { callbacks: { label: ctx => hasData ? ` ${ctx.label}: ${ctx.raw} pedido${Number(ctx.raw) !== 1 ? 's' : ''}` : ' Nenhum pedido ainda' } }
          }
        }
      });
    };
    load();
    return () => { if (chartRef.current) { chartRef.current.destroy(); chartRef.current = null; } };
  }, [data]);

  return <canvas ref={canvasRef} style={{ maxHeight: 240 }} />;
}

// ── Barras de avaliações ───────────────────────────────────────────────────────
function RatingChart({ data }: { data: RatingData[] }) {
  const full = [5, 4, 3, 2, 1].map(star => {
    const found = data.find(d => Number(d.rating) === star);
    return { star, count: found ? Number(found.count) : 0 };
  });
  const total = full.reduce((s, d) => s + d.count, 0);
  const colors = ['', '#DC2626', '#D97706', '#F59E0B', '#059669', '#7C3AED'];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: '8px 0' }}>
      {full.map(({ star, count }) => {
        const pct = total > 0 ? Math.round((count / total) * 100) : 0;
        return (
          <div key={star} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--royal)', width: 16, textAlign: 'right', flexShrink: 0 }}>{star}</span>
            <span style={{ fontSize: 13, color: '#F59E0B', flexShrink: 0 }}>★</span>
            <div style={{ flex: 1, height: 10, background: 'var(--mist)', borderRadius: 999, overflow: 'hidden' }}>
              <div style={{ width: `${pct}%`, height: '100%', background: colors[star], borderRadius: 999, transition: 'width 0.8s ease' }} />
            </div>
            <span style={{ fontSize: 12, color: 'var(--muted)', width: 36, textAlign: 'right', flexShrink: 0 }}>{count > 0 ? `${pct}%` : '—'}</span>
            <span style={{ fontSize: 12, color: 'var(--muted)', width: 24, textAlign: 'right', flexShrink: 0 }}>{count}</span>
          </div>
        );
      })}
      <p style={{ fontSize: 11, color: 'var(--muted)', textAlign: 'right', marginTop: 4 }}>
        {total > 0 ? `${total} avaliação${total !== 1 ? 'ões' : ''} no total` : 'Nenhuma avaliação ainda'}
      </p>
    </div>
  );
}

// ── Página principal ───────────────────────────────────────────────────────────
export default function AnalyticsPage() {
  const { loading: authLoading } = useRequireAuth();
  const [data, setData]       = useState<Analytics | null>(null);
  const [dataLoading, setDataLoading] = useState(true);
  const [error, setError]     = useState('');

  useEffect(() => {
    if (authLoading) return;
    api.get('/api/sellers/analytics')
      .then(r => setData(r.data))
      .catch(err => setError(extractErrorMessage(err, 'Erro desconhecido')))
      .finally(() => setDataLoading(false));
  }, [authLoading]);

  const fmt = (v: number) =>
    `R$ ${v.toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.')}`;

  if (authLoading || dataLoading) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 400, gap: 16 }}>
      <Spin />
      <p style={{ fontSize: 14, color: 'var(--muted)' }}>Carregando dados financeiros...</p>
    </div>
  );

  if (error) return (
    <div style={{ maxWidth: 520, margin: '80px auto', textAlign: 'center', padding: 24 }}>
      <p style={{ fontSize: 48, marginBottom: 12 }}>⚠️</p>
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, color: 'var(--royal)', marginBottom: 8 }}>Erro ao carregar</h2>
      <p style={{ fontSize: 14, color: 'var(--muted)', marginBottom: 8 }}>{error}</p>
      <p style={{ fontSize: 12, color: '#C4B5D4', marginBottom: 24 }}>
        Verifique se o backend está rodando e se você está logado.
      </p>
      <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
        <button onClick={() => window.location.reload()}
          style={{ background: 'var(--violet)', color: '#fff', border: 'none', borderRadius: 'var(--radius-pill)', padding: '10px 24px', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>
          Tentar novamente
        </button>
        <Link href="/dashboard" style={{ textDecoration: 'none', display: 'inline-block' }}>
          <Button variant="outline" style={{ width: 'auto' }}>← Dashboard</Button>
        </Link>
      </div>
    </div>
  );

  const { kpis, revenue_by_month, top_products, orders_by_status, rating_distribution } = data!;

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '48px 24px' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 36, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div style={{ display: 'flex', gap: 8, fontSize: 13, color: 'var(--muted)', marginBottom: 8 }}>
            <Link href="/dashboard" style={{ color: 'var(--violet)', textDecoration: 'none' }}>Dashboard</Link>
            <span>/</span><span>Painel Financeiro</span>
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 700, color: 'var(--royal)', marginBottom: 4 }}>
            Painel Financeiro
          </h1>
          <p style={{ fontSize: 14, color: 'var(--muted)' }}>Métricas e resultados da sua loja</p>
        </div>
        <Link href="/dashboard" style={{ textDecoration: 'none' }}>
          <Button variant="outline" size="sm" style={{ width: 'auto' }}>← Voltar</Button>
        </Link>
      </div>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14, marginBottom: 32 }}>
        <KpiCard label="Receita total" value={fmt(kpis.revenue_total)} sub={`${kpis.orders_paid} pedidos pagos`} accent="#7C3AED" icon="💰" />
        <KpiCard label="Receita este mês" value={fmt(kpis.revenue_month)} sub={`${kpis.orders_month} pedidos no mês`} accent="#059669" icon="📈" />
        <KpiCard label="Ticket médio" value={fmt(kpis.avg_ticket)} sub="por pedido pago" accent="#D97706" icon="🎯" />
        <KpiCard label="Pedidos pendentes" value={String(kpis.orders_pending)} sub="aguardando pagamento" accent="#DC2626" icon="⏳" />
      </div>

      {/* Gráficos — linha superior */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 20, marginBottom: 20 }}>
        <ChartCard title="Receita & Pedidos" subtitle="Últimos 12 meses (apenas pedidos pagos)">
          <RevenueChart data={revenue_by_month} />
        </ChartCard>
        <ChartCard title="Top 5 Produtos" subtitle="Mais rentáveis de todos os tempos">
          <TopProductsChart data={top_products} />
        </ChartCard>
      </div>

      {/* Gráficos — linha inferior */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
        <ChartCard title="Status dos Pedidos" subtitle="Distribuição de todos os pedidos">
          <OrderStatusChart data={orders_by_status} />
        </ChartCard>
        <ChartCard title="Avaliações Recebidas" subtitle="Distribuição por nota (1 a 5 estrelas)">
          <RatingChart data={rating_distribution} />
        </ChartCard>
      </div>

      {/* Rodapé */}
      <div style={{ marginTop: 28, padding: '14px 20px', background: 'var(--mist)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ fontSize: 15 }}>ℹ️</span>
        <p style={{ fontSize: 12, color: 'var(--muted)' }}>
          Receitas calculadas apenas sobre pedidos com status <strong style={{ color: 'var(--violet)' }}>pago</strong>. Pedidos pendentes não entram na receita.
        </p>
      </div>
    </div>
  );
}
