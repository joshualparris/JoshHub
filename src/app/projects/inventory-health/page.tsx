"use client";

import { useMemo, useState } from "react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell
} from "recharts";
import { 
  Search, 
  AlertCircle, 
  FileSearch, 
  GitBranch,
  Globe,
  Folder,
  LayoutGrid,
  List as ListIcon
} from "lucide-react";

import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { apps } from "@/data/apps";
import { ProjectInventoryCard } from "@/components/project-inventory-card";
import { cn } from "@/lib/utils";

const STATUS_COLORS: Record<string, string> = {
  ok: "#10b981", // emerald-500
  active: "#3b82f6", // blue-500
  wip: "#f59e0b", // amber-500
  paused: "#f97316", // orange-500
  complete: "#6366f1", // indigo-500
  maintained: "#06b6d4", // cyan-500
  broken: "#ef4444", // red-500
  archived: "#71717a", // zinc-500
  "needs-review": "#a855f7", // purple-500
  "archive-candidate": "#64748b", // slate-500
  "duplicate-candidate": "#f43f5e", // rose-500
  unknown: "#a1a1aa", // zinc-400
};

export default function InventoryHealthPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [confidenceFilter, setConfidenceFilter] = useState<string>("all");
  const [view, setView] = useState<"grid" | "list">("grid");

  // Statistics
  const stats = useMemo(() => {
    const total = apps.length;
    const byStatus = apps.reduce((acc, app) => {
      acc[app.status] = (acc[app.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const byCategory = apps.reduce((acc, app) => {
      acc[app.category] = (acc[app.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const needsReview = apps.filter(app => 
      app.status === "needs-review" || 
      app.metadataConfidence === "needs-review"
    ).length;

    const missingRepo = apps.filter(app => !app.repoUrl && !app.urls.some(u => /github.com|gitlab.com/i.test(u.url))).length;
    const missingLive = apps.filter(app => !app.liveUrl && !app.primaryUrl).length;
    const missingPath = apps.filter(app => !app.localPath && !app.urls.some(u => u.label.toLowerCase().includes("local"))).length;
    
    const localOnly = apps.filter(app => app.availability === "local").length;
    const hybrid = apps.filter(app => app.availability === "hybrid").length;
    const multiDeployment = apps.filter(app => app.alternateLinks && app.alternateLinks.length > 0).length;

    // Simple duplicate detection (same name or same path)
    const nameMap = new Map<string, string[]>();
    const repoMap = new Map<string, string[]>();
    const liveMap = new Map<string, string[]>();

    apps.forEach(app => {
      const nameKey = app.name.toLowerCase();
      nameMap.set(nameKey, [...(nameMap.get(nameKey) || []), app.id]);
      
      if (app.repoUrl) {
        repoMap.set(app.repoUrl, [...(repoMap.get(app.repoUrl) || []), app.id]);
      }
      if (app.liveUrl) {
        liveMap.set(app.liveUrl, [...(liveMap.get(app.liveUrl) || []), app.id]);
      }
    });

    const duplicateNames = Array.from(nameMap.values()).filter(ids => ids.length > 1).length;
    const duplicateRepos = Array.from(repoMap.values()).filter(ids => ids.length > 1).length;
    const duplicateLives = Array.from(liveMap.values()).filter(ids => ids.length > 1).length;

    return {
      total,
      byStatus,
      byCategory,
      needsReview,
      missingRepo,
      missingLive,
      missingPath,
      duplicateNames,
      duplicateRepos,
      duplicateLives,
      localOnly,
      hybrid,
      multiDeployment,
      archiveCandidates: apps.filter(app => app.status === "archive-candidate").length,
    };
  }, []);

  const chartData = useMemo(() => {
    return Object.entries(stats.byStatus).map(([name, value]) => ({
      name,
      value,
      fill: STATUS_COLORS[name] || STATUS_COLORS.unknown
    })).sort((a, b) => b.value - a.value);
  }, [stats.byStatus]);

  const categoryData = useMemo(() => {
    return Object.entries(stats.byCategory).map(([name, value]) => ({
      name,
      value
    })).sort((a, b) => b.value - a.value).slice(0, 10);
  }, [stats.byCategory]);

  const filteredProjects = useMemo(() => {
    return apps.filter(project => {
      const matchesSearch = 
        project.name.toLowerCase().includes(search.toLowerCase()) ||
        project.tags.some(t => t.toLowerCase().includes(search.toLowerCase())) ||
        (project.notes?.toLowerCase() || "").includes(search.toLowerCase()) ||
        (project.localPath?.toLowerCase() || "").includes(search.toLowerCase());
      
      const matchesStatus = statusFilter === "all" || project.status === statusFilter;
      const matchesCategory = categoryFilter === "all" || project.category === categoryFilter;
      const matchesConfidence = confidenceFilter === "all" || project.metadataConfidence === confidenceFilter;

      return matchesSearch && matchesStatus && matchesCategory && matchesConfidence;
    });
  }, [search, statusFilter, categoryFilter, confidenceFilter]);

  const categories = useMemo(() => Array.from(new Set(apps.map(a => a.category))).sort(), []);
  const statuses = useMemo(() => Array.from(new Set(apps.map(a => a.status))).sort(), []);

  return (
    <div className="space-y-8 pb-12">
      <PageHeader
        kicker="Management"
        title="Project Inventory Health"
        subtitle="Monitor, validate, and clean up your project portfolio."
        tone="onDark"
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Projects</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Across {categories.length} categories
            </p>
          </CardContent>
        </Card>
        <Card className="border-purple-200 dark:border-purple-900/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-purple-600 dark:text-purple-400">Needs Review</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-700 dark:text-purple-300">{stats.needsReview}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Untrusted or flagged metadata
            </p>
          </CardContent>
        </Card>
        <Card className="border-rose-200 dark:border-rose-900/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-rose-600 dark:text-rose-400">Potential Duplicates</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-rose-700 dark:text-rose-300">{stats.duplicateNames}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Identified by name or path
            </p>
          </CardContent>
        </Card>
        <Card className="border-amber-200 dark:border-amber-900/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-amber-600 dark:text-amber-400">Archive Candidates</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-amber-700 dark:text-amber-300">{stats.archiveCandidates}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Ready for cleanup
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Projects by Status</CardTitle>
            <CardDescription>Distribution of project lifecycle states</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                <XAxis type="number" hide />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  tick={{ fontSize: 12 }}
                  width={120}
                />
                <Tooltip 
                  cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Health Indicators</CardTitle>
            <CardDescription>Missing metadata and validation flags</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm mb-1">
                <span className="flex items-center gap-2"><GitBranch className="h-4 w-4 text-muted-foreground" /> Missing Repo URL</span>
                <span className="font-semibold">{stats.missingRepo} / {stats.total}</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div className="bg-rose-500 h-2 rounded-full" style={{ width: `${(stats.missingRepo / stats.total) * 100}%` }}></div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm mb-1">
                <span className="flex items-center gap-2"><Globe className="h-4 w-4 text-muted-foreground" /> Missing Live URL</span>
                <span className="font-semibold">{stats.missingLive} / {stats.total}</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div className="bg-amber-500 h-2 rounded-full" style={{ width: `${(stats.missingLive / stats.total) * 100}%` }}></div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm mb-1">
                <span className="flex items-center gap-2"><Folder className="h-4 w-4 text-muted-foreground" /> Missing Local Path</span>
                <span className="font-semibold">{stats.missingPath} / {stats.total}</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${(stats.missingPath / stats.total) * 100}%` }}></div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2 text-xs">
              <div className="p-2 bg-muted/50 rounded-lg">
                <span className="text-muted-foreground block mb-1">Local Only</span>
                <span className="text-lg font-bold">{stats.localOnly}</span>
              </div>
              <div className="p-2 bg-muted/50 rounded-lg">
                <span className="text-muted-foreground block mb-1">Hybrid Access</span>
                <span className="text-lg font-bold">{stats.hybrid}</span>
              </div>
              <div className="p-2 bg-muted/50 rounded-lg">
                <span className="text-muted-foreground block mb-1">Multi-Deploy</span>
                <span className="text-lg font-bold">{stats.multiDeployment}</span>
              </div>
              <div className="p-2 bg-muted/50 rounded-lg">
                <span className="text-muted-foreground block mb-1">Duplicate Repos</span>
                <span className="text-lg font-bold text-rose-500">{stats.duplicateRepos}</span>
              </div>
            </div>

            <div className="pt-2">
              <Button variant="outline" className="w-full gap-2" asChild>
                <a href="/scripts/validate-apps.ts" target="_blank">
                  <FileSearch className="h-4 w-4" /> Run Full Validation Script
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Inventory Explorer */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
          <h2 className="text-2xl font-bold">Inventory Explorer</h2>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setView("grid")}
              className={cn(view === "grid" && "bg-muted")}
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setView("list")}
              className={cn(view === "list" && "bg-muted")}
            >
              <ListIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 p-4 bg-muted/30 rounded-lg border border-border">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search projects..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-10 rounded-md border border-input bg-background px-3 text-sm focus:ring-2 focus:ring-ring"
          >
            <option value="all">All Statuses</option>
            {statuses.map(s => <option key={s} value={s}>{s}</option>)}
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="h-10 rounded-md border border-input bg-background px-3 text-sm focus:ring-2 focus:ring-ring"
          >
            <option value="all">All Categories</option>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>

          <select
            value={confidenceFilter}
            onChange={(e) => setConfidenceFilter(e.target.value)}
            className="h-10 rounded-md border border-input bg-background px-3 text-sm focus:ring-2 focus:ring-ring"
          >
            <option value="all">All Confidence</option>
            <option value="verified">Verified</option>
            <option value="inferred">Inferred</option>
            <option value="needs-review">Needs Review</option>
          </select>
          
          <div className="flex-1"></div>
          
          <div className="text-sm text-muted-foreground flex items-center">
            Showing {filteredProjects.length} projects
          </div>
        </div>

        {filteredProjects.length === 0 ? (
          <div className="text-center py-12 bg-muted/20 rounded-xl border-2 border-dashed">
            <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium">No projects found</h3>
            <p className="text-muted-foreground">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className={cn(
            "grid gap-6",
            view === "grid" ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1"
          )}>
            {filteredProjects.map((project) => (
              <ProjectInventoryCard key={project.id} project={project} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
