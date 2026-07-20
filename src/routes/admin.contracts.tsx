import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Download,
  FileDown,
  FileSpreadsheet,
  FileText,
  Loader2,
  Search,
} from "lucide-react";
import { PageHeader, Card, Badge, StatCard } from "@/components/app/ui";
import { supabase } from "@/lib/supabase";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { downloadTablePdf } from "@/lib/pdf";

export const Route = createFileRoute("/admin/contracts")({
  component: Contracts,
});

type ContractRow = {
  id: string;
  user_id: string;
  property_id: string | null;
  status: string | null;
  start_date: string | null;
  end_date: string | null;
  created_at: string;
};

type ContractView = ContractRow & {
  propertyTitle: string;
  propertyPrice: number | null;
  userName: string;
};

const badgeVariant: Record<string, "emerald" | "warn" | "muted" | "blue"> = {
  active: "emerald",
  pending: "warn",
  signed: "blue",
  expired: "muted",
  cancelled: "muted",
};

const statusLabels: Record<string, string> = {
  active: "Ativo",
  pending: "Pendente",
  signed: "Assinado",
  expired: "Expirado",
  cancelled: "Cancelado",
};

function Contracts() {
  const [contracts, setContracts] = useState<ContractRow[]>([]);
  const [views, setViews] = useState<ContractView[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [q, setQ] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const { data, error: loadError } = await supabase
        .from("contracts")
        .select("id, user_id, property_id, status, start_date, end_date, created_at")
        .order("created_at", { ascending: false });

      if (cancelled) return;
      setLoading(false);
      if (loadError) {
        setError(loadError.message);
        setContracts([]);
        setViews([]);
        return;
      }
      const rows = ((data ?? []) as ContractRow[]) ?? [];
      const propertyIds = rows.map((contract) => contract.property_id).filter(Boolean) as string[];
      const userIds = rows.map((contract) => contract.user_id).filter(Boolean);
      const [properties, users] = await Promise.all([
        propertyIds.length
          ? supabase.from("properties").select("id, title, price").in("id", propertyIds)
          : Promise.resolve({
              data: [] as Array<{ id: string; title: string | null; price: number | null }>,
            }),
        userIds.length
          ? supabase.from("users").select("id, name, email").in("id", userIds)
          : Promise.resolve({
              data: [] as Array<{ id: string; name: string | null; email: string | null }>,
            }),
      ]);
      const propertyById = new Map(
        (
          (properties.data ?? []) as Array<{
            id: string;
            title: string | null;
            price: number | null;
          }>
        ).map((property) => [property.id, property]),
      );
      const userById = new Map(
        (
          (users.data ?? []) as Array<{ id: string; name: string | null; email: string | null }>
        ).map((user) => [user.id, user]),
      );
      const nextViews = rows.map((contract) => {
        const property = contract.property_id ? propertyById.get(contract.property_id) : null;
        const user = userById.get(contract.user_id);
        return {
          ...contract,
          propertyTitle: property?.title ?? "Imóvel",
          propertyPrice: property?.price ?? null,
          userName: user?.name ?? user?.email ?? "Usuário",
        };
      });
      setContracts(rows);
      setViews(nextViews);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = views.filter((contract) => {
    const needle = q.toLowerCase();
    return (
      !needle ||
      contract.id.toLowerCase().includes(needle) ||
      contract.propertyTitle.toLowerCase().includes(needle) ||
      contract.userName.toLowerCase().includes(needle)
    );
  });

  const rows = filtered.map((contract) => [
    contract.id.slice(0, 8),
    contract.propertyTitle,
    contract.userName,
    contract.propertyPrice != null ? formatCurrency(Number(contract.propertyPrice)) : "-",
    statusLabel(contract.status),
    formatDate(contract.start_date),
    formatDate(contract.end_date),
  ]);

  const exportCsv = () => {
    if (filtered.length === 0) return;
    const csv = [["id", "imovel", "usuario", "valor", "status", "inicio", "fim"], ...rows]
      .map((row) => row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "contratos.csv";
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const exportPdf = () => {
    if (filtered.length === 0) return;
    downloadTablePdf({
      title: "Contratos",
      subtitle: `Exportado em ${new Date().toLocaleDateString("pt-BR")}`,
      header: ["ID", "Imóvel", "Usuário", "Valor", "Status", "Início", "Fim"],
      rows,
      filename: "contratos.pdf",
    });
  };

  const active = contracts.filter((contract) => contract.status === "active").length;
  const pending = contracts.filter((contract) => contract.status === "pending").length;
  const expiringSoon = contracts.filter((contract) => {
    if (!contract.end_date) return false;
    const days = (new Date(contract.end_date).getTime() - Date.now()) / 86400000;
    return days >= 0 && days <= 30;
  }).length;

  return (
    <>
      <PageHeader
        title="Contratos"
        subtitle="Contratos registrados entre proprietários, inquilinos e participantes da operação."
      >
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              disabled={filtered.length === 0}
              className="flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm hover:bg-secondary disabled:opacity-50"
            >
              <Download className="h-4 w-4" /> Exportar
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={exportCsv}>
              <FileSpreadsheet className="mr-2 h-4 w-4" /> Exportar CSV
            </DropdownMenuItem>
            <DropdownMenuItem onClick={exportPdf}>
              <FileDown className="mr-2 h-4 w-4" /> Exportar PDF
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <Link
          to="/admin/contract-lifecycle"
          className="flex items-center gap-2 rounded-full bg-emerald px-4 py-2 text-sm font-semibold text-white shadow-glow"
        >
          CLM e templates
        </Link>
      </PageHeader>

      {error && (
        <Card className="mb-6 border-destructive/30 bg-destructive/5">
          <p className="text-sm text-destructive">{error}</p>
        </Card>
      )}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Ativos" value={String(active)} icon={CheckCircle2} />
        <StatCard label="Pendentes" value={String(pending)} icon={Clock} accent="skyblue" />
        <StatCard
          label="Vencendo em 30d"
          value={String(expiringSoon)}
          icon={AlertCircle}
          accent="skyblue"
        />
        <StatCard label="Total" value={String(contracts.length)} icon={FileText} />
      </div>

      <Card className="mt-6 overflow-hidden p-0">
        <div className="flex flex-wrap items-center justify-between gap-3 p-6 pb-4">
          <div className="flex max-w-sm flex-1 items-center gap-2 rounded-full border border-border bg-secondary/40 px-4 py-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input
              value={q}
              onChange={(event) => setQ(event.target.value)}
              className="w-full bg-transparent text-sm focus:outline-none"
              placeholder="Buscar contratos..."
            />
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16 text-muted-foreground">
            <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Carregando contratos...
          </div>
        ) : filtered.length === 0 ? (
          <div className="px-6 pb-8 text-sm text-muted-foreground">
            Nenhum contrato encontrado. Quando um contrato for criado, assinado ou importado, ele
            aparecerá aqui.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-y border-border bg-secondary/30 text-left text-xs uppercase tracking-wide text-muted-foreground">
                <th className="px-6 py-3 font-medium">Ref</th>
                <th className="px-6 py-3 font-medium">Imóvel</th>
                <th className="px-6 py-3 font-medium">Usuário</th>
                <th className="px-6 py-3 font-medium">Valor</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium">Início</th>
                <th className="px-6 py-3 font-medium">Fim</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((contract) => (
                <tr
                  key={contract.id}
                  className="border-b border-border last:border-0 hover:bg-secondary/30"
                >
                  <td className="px-6 py-4 font-mono text-xs">{contract.id.slice(0, 8)}</td>
                  <td className="px-6 py-4 font-semibold">{contract.propertyTitle}</td>
                  <td className="px-6 py-4 text-muted-foreground">{contract.userName}</td>
                  <td className="px-6 py-4 font-semibold">
                    {contract.propertyPrice != null
                      ? formatCurrency(Number(contract.propertyPrice))
                      : "-"}
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant={badgeVariant[contract.status ?? ""] ?? "muted"}>
                      {statusLabel(contract.status)}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">
                    {formatDate(contract.start_date)}
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">
                    {formatDate(contract.end_date)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </>
  );
}

function statusLabel(status: string | null | undefined) {
  return status ? (statusLabels[status] ?? status) : "Sem status";
}

function formatDate(value: string | null) {
  if (!value) return "-";
  return new Date(value).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  }).format(value);
}
