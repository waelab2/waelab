"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useUserAnalytics } from "@/hooks/use-analytics";
import { useUserSubscription } from "@/hooks/use-subscription";
import { formatNumber } from "@/lib/utils";
import { api } from "@/trpc/react";
import {
  Activity,
  Calendar,
  CreditCard,
  Filter,
  LifeBuoy,
  Mail,
  Search,
  SlidersHorizontal,
  Sparkles,
  X,
  Zap,
} from "lucide-react";
import { memo, useMemo, useState } from "react";
import { toast } from "sonner";

export interface UserWithStats {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: string;
  status: "active" | "inactive";
  joinDate: string;
  totalGenerations?: number;
  totalCredits?: number;
  lastActivity?: string;
}

interface UsersTableWithStatsProps {
  users?: UserWithStats[];
  isLoading?: boolean;
}

type SortValue = "newest" | "oldest" | "name_asc" | "name_desc";

export const UsersTableWithStats = memo(
  ({ users = [], isLoading = false }: UsersTableWithStatsProps) => {
    const [searchQuery, setSearchQuery] = useState("");
    const [roleFilter, setRoleFilter] = useState("all");
    const [statusFilter, setStatusFilter] = useState("all");
    const [sortBy, setSortBy] = useState<SortValue>("newest");

    const roleOptions = useMemo(() => {
      return ["all", ...Array.from(new Set(users.map((user) => user.role)))];
    }, [users]);

    const hasActiveFilters =
      searchQuery.trim().length > 0 ||
      roleFilter !== "all" ||
      statusFilter !== "all";

    const filteredUsers = useMemo(() => {
      const query = searchQuery.trim().toLowerCase();

      const filtered = users.filter((user) => {
        const matchesQuery =
          query.length === 0 ||
          user.name.toLowerCase().includes(query) ||
          user.email.toLowerCase().includes(query);
        const matchesRole = roleFilter === "all" || user.role === roleFilter;
        const matchesStatus =
          statusFilter === "all" || user.status === statusFilter;
        return matchesQuery && matchesRole && matchesStatus;
      });

      filtered.sort((a, b) => {
        if (sortBy === "name_asc") return a.name.localeCompare(b.name);
        if (sortBy === "name_desc") return b.name.localeCompare(a.name);

        const aDate = new Date(a.joinDate).getTime();
        const bDate = new Date(b.joinDate).getTime();
        return sortBy === "oldest" ? aDate - bDate : bDate - aDate;
      });

      return filtered;
    }, [users, roleFilter, searchQuery, sortBy, statusFilter]);

    const clearFilters = () => {
      setSearchQuery("");
      setRoleFilter("all");
      setStatusFilter("all");
      setSortBy("newest");
    };

    if (isLoading) {
      return (
        <div className="overflow-hidden rounded-2xl border border-slate-700/60 bg-slate-900/40">
          <Table className="min-w-[980px]">
            <TableHeader>
              <TableRow className="border-slate-700/60 bg-slate-800/40">
                <TableHead className="h-11 text-xs font-semibold tracking-wide text-slate-300 uppercase">
                  User
                </TableHead>
                <TableHead className="h-11 text-xs font-semibold tracking-wide text-slate-300 uppercase">
                  Access
                </TableHead>
                <TableHead className="h-11 text-xs font-semibold tracking-wide text-slate-300 uppercase">
                  Usage
                </TableHead>
                <TableHead className="h-11 text-xs font-semibold tracking-wide text-slate-300 uppercase">
                  Subscription
                </TableHead>
                <TableHead className="h-11 text-xs font-semibold tracking-wide text-slate-300 uppercase">
                  Support
                </TableHead>
                <TableHead className="h-11 text-xs font-semibold tracking-wide text-slate-300 uppercase">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: 4 }).map((_, index) => (
                <TableRow key={index} className="border-slate-700/50">
                  <TableCell className="py-4">
                    <div className="h-12 animate-pulse rounded-md bg-slate-700/40" />
                  </TableCell>
                  <TableCell className="py-4">
                    <div className="h-12 animate-pulse rounded-md bg-slate-700/30" />
                  </TableCell>
                  <TableCell className="py-4">
                    <div className="h-12 animate-pulse rounded-md bg-slate-700/30" />
                  </TableCell>
                  <TableCell className="py-4">
                    <div className="h-12 animate-pulse rounded-md bg-slate-700/30" />
                  </TableCell>
                  <TableCell className="py-4">
                    <div className="h-12 animate-pulse rounded-md bg-slate-700/30" />
                  </TableCell>
                  <TableCell className="py-4">
                    <div className="h-12 animate-pulse rounded-md bg-slate-700/30" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <div className="relative overflow-hidden rounded-2xl border border-cyan-900/45 bg-gradient-to-br from-slate-900/90 via-slate-900/80 to-slate-950 p-3 sm:p-4">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.2),transparent_40%),radial-gradient(circle_at_bottom_left,rgba(59,130,246,0.12),transparent_45%)]" />
          <div className="relative grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <div className="relative md:col-span-2">
              <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-cyan-200/60" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name or email"
                className="h-10 border-slate-700/80 bg-slate-900/65 pr-3 pl-9 text-slate-100 placeholder:text-slate-400 focus-visible:border-cyan-500/60"
              />
            </div>

            <div className="relative">
              <Filter className="pointer-events-none absolute top-1/2 left-3 z-10 h-4 w-4 -translate-y-1/2 text-cyan-200/60" />
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="h-10 w-full border-slate-700/80 bg-slate-900/65 pl-9 text-slate-100">
                  <SelectValue placeholder="All roles" />
                </SelectTrigger>
                <SelectContent className="border-slate-700 bg-slate-900/95">
                  {roleOptions.map((role) => (
                    <SelectItem key={role} value={role}>
                      {role === "all" ? "All roles" : role}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="relative">
              <SlidersHorizontal className="pointer-events-none absolute top-1/2 left-3 z-10 h-4 w-4 -translate-y-1/2 text-cyan-200/60" />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="h-10 w-full border-slate-700/80 bg-slate-900/65 pl-9 text-slate-100">
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent className="border-slate-700 bg-slate-900/95">
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="relative mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-cyan-100/80">
              Showing {filteredUsers.length} of {users.length} users
            </p>
            <div className="flex items-center gap-2">
              <Select
                value={sortBy}
                onValueChange={(value) => setSortBy(value as SortValue)}
              >
                <SelectTrigger className="h-8 w-[140px] border-slate-700/80 bg-slate-900/65 text-xs text-slate-100">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="border-slate-700 bg-slate-900/95">
                  <SelectItem value="newest">Newest first</SelectItem>
                  <SelectItem value="oldest">Oldest first</SelectItem>
                  <SelectItem value="name_asc">Name A-Z</SelectItem>
                  <SelectItem value="name_desc">Name Z-A</SelectItem>
                </SelectContent>
              </Select>
              {hasActiveFilters ? (
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 border-slate-600 text-slate-200 hover:bg-slate-800"
                  onClick={clearFilters}
                >
                  Reset
                </Button>
              ) : null}
            </div>
          </div>
        </div>

        {filteredUsers.length === 0 ? (
          <div className="rounded-2xl border border-slate-700/60 bg-slate-900/50 px-6 py-12 text-center">
            <Sparkles className="mx-auto mb-3 h-5 w-5 text-cyan-300/75" />
            <p className="text-sm font-medium text-slate-200">
              No users match your filters
            </p>
            <p className="mt-1 text-xs text-slate-400">
              Try changing the search, role, or status filters.
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-slate-700/60 bg-slate-900/45 shadow-[0_0_0_1px_rgba(30,41,59,0.4),0_18px_32px_-28px_rgba(34,211,238,0.5)]">
            <Table className="min-w-[1080px]">
              <TableHeader>
                <TableRow className="border-slate-700/70 bg-slate-900/90 hover:bg-slate-900/90">
                  <TableHead className="h-12 px-4 text-[11px] font-semibold tracking-[0.18em] text-slate-300 uppercase">
                    User
                  </TableHead>
                  <TableHead className="h-12 px-4 text-[11px] font-semibold tracking-[0.18em] text-slate-300 uppercase">
                    Access
                  </TableHead>
                  <TableHead className="h-12 px-4 text-[11px] font-semibold tracking-[0.18em] text-slate-300 uppercase">
                    Usage
                  </TableHead>
                  <TableHead className="h-12 px-4 text-[11px] font-semibold tracking-[0.18em] text-slate-300 uppercase">
                    Subscription
                  </TableHead>
                  <TableHead className="h-12 px-4 text-[11px] font-semibold tracking-[0.18em] text-slate-300 uppercase">
                    Support
                  </TableHead>
                  <TableHead className="h-12 px-4 text-[11px] font-semibold tracking-[0.18em] text-slate-300 uppercase">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <UserRowWithStats key={user.id} user={user} />
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    );
  },
);

UsersTableWithStats.displayName = "UsersTableWithStats";

const getInitials = (name: string) =>
  name
    .split(" ")
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join("")
    .toUpperCase();

const getRoleClass = (role: string) => {
  if (role === "Admin") {
    return "border-violet-500/35 bg-violet-500/15 text-violet-100";
  }
  if (role === "Moderator") {
    return "border-cyan-500/35 bg-cyan-500/15 text-cyan-100";
  }
  return "border-slate-500/40 bg-slate-500/15 text-slate-200";
};

const getStatusClass = (status: UserWithStats["status"]) =>
  status === "active"
    ? "border-emerald-500/40 bg-emerald-500/15 text-emerald-100"
    : "border-rose-500/40 bg-rose-500/15 text-rose-100";

const getSubscriptionBadgeClass = (status: string) => {
  if (status === "active") {
    return "border-emerald-500/40 bg-emerald-500/15 text-emerald-100";
  }
  if (status === "cancelled") {
    return "border-rose-500/35 bg-rose-500/15 text-rose-100";
  }
  if (status === "failed") {
    return "border-amber-500/35 bg-amber-500/15 text-amber-100";
  }
  return "border-slate-500/40 bg-slate-500/15 text-slate-200";
};

const formatAmount = (amount: number, currency: string) =>
  `${amount.toFixed(2)} ${currency}`;

const UserRowWithStats = memo(({ user }: { user: UserWithStats }) => {
  const userAnalytics = useUserAnalytics(user.id);
  const subscription = useUserSubscription(user.id);
  const [isRevoking, setIsRevoking] = useState(false);
  const [grantPlan, setGrantPlan] = useState<"starter" | "pro" | "premium">(
    "starter",
  );

  const revokeMutation = api.plans.revokeSubscription.useMutation({
    onSuccess: () => {
      toast.success("Subscription revoked successfully");
      setIsRevoking(false);
    },
    onError: (error) => {
      toast.error(error.message ?? "Failed to revoke subscription");
      setIsRevoking(false);
    },
  });

  const releaseReservedCreditsMutation =
    api.users.releaseReservedCreditsForUser.useMutation({
      onSuccess: (result) => {
        toast.success(
          `Support action completed: released ${result.released_credits} credits across ${result.released_reservations} reservations.`,
        );
      },
      onError: (error) => {
        toast.error(error.message ?? "Failed to release reserved credits");
      },
    });

  const grantPlanCreditsMutation = api.users.grantPlanCreditsForUser.useMutation(
    {
      onSuccess: (result) => {
        toast.success(
          `Support action completed: granted ${result.granted_credits} credits.`,
        );
      },
      onError: (error) => {
        toast.error(error.message ?? "Failed to grant plan credits");
      },
    },
  );

  const handleRevokeSubscription = async () => {
    if (
      subscription?.status !== "active" ||
      !window.confirm(
        `Are you sure you want to revoke ${user.name}'s subscription? This action cannot be undone.`,
      )
    ) {
      return;
    }

    setIsRevoking(true);
    try {
      await revokeMutation.mutateAsync({ userId: user.id });
    } catch {
      // Error handled in mutation onError callback.
    }
  };

  const handleReleaseReservedCredits = async () => {
    const reason = window.prompt(
      "Support function: release reserved credits for this user.\nEnter a short reason/audit note:",
    );

    if (!reason || reason.trim().length < 3) {
      toast.error("Reason is required (minimum 3 characters).");
      return;
    }

    const confirmed = window.confirm(
      `Support confirmation:\nRelease reserved credits for ${user.name} (${user.email})?\nReason: ${reason.trim()}`,
    );

    if (!confirmed) return;

    await releaseReservedCreditsMutation.mutateAsync({
      userId: user.id,
      reason: reason.trim(),
      confirmed: true,
    });
  };

  const handleGrantPlanCredits = async () => {
    const reason = window.prompt(
      `Support function: grant plan credits (${grantPlan}) to this user.\nEnter a short reason/audit note:`,
    );

    if (!reason || reason.trim().length < 3) {
      toast.error("Reason is required (minimum 3 characters).");
      return;
    }

    const confirmed = window.confirm(
      `Support confirmation:\nGrant ${grantPlan.toUpperCase()} plan credits to ${user.name} (${user.email})?\nReason: ${reason.trim()}`,
    );

    if (!confirmed) return;

    await grantPlanCreditsMutation.mutateAsync({
      userId: user.id,
      planId: grantPlan,
      reason: reason.trim(),
      confirmed: true,
    });
  };

  const totalRequests = userAnalytics?.total_requests ?? 0;
  const completedRequests = userAnalytics?.completed_requests ?? 0;
  const successRate =
    totalRequests > 0 ? `${Math.round((completedRequests / totalRequests) * 100)}%` : "0%";

  const planLabel = subscription
    ? `${subscription.plan_id.charAt(0).toUpperCase()}${subscription.plan_id.slice(1)}`
    : "No subscription";

  return (
    <TableRow className="border-slate-700/60 bg-slate-900/35 align-top hover:bg-slate-800/35">
      <TableCell className="px-4 py-4">
        <div className="flex items-start gap-3">
          <Avatar className="mt-0.5 h-11 w-11 ring-2 ring-slate-700/70">
            <AvatarImage src={user.avatar} alt={user.name} />
            <AvatarFallback className="bg-slate-700 text-xs font-semibold text-slate-200">
              {getInitials(user.name)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-slate-100">
              {user.name}
            </p>
            <p className="mt-1 flex items-center gap-1 truncate text-xs text-slate-400">
              <Mail className="h-3 w-3" />
              {user.email}
            </p>
            <p className="mt-1 flex items-center gap-1 text-xs text-slate-400">
              <Calendar className="h-3 w-3" />
              Joined {new Date(user.joinDate).toLocaleDateString()}
            </p>
          </div>
        </div>
      </TableCell>

      <TableCell className="px-4 py-4">
        <div className="flex flex-col gap-2">
          <Badge
            variant="outline"
            className={`${getRoleClass(user.role)} rounded-full border px-2.5 py-1 text-[11px]`}
          >
            {user.role}
          </Badge>
          <Badge
            variant="outline"
            className={`${getStatusClass(user.status)} rounded-full border px-2.5 py-1 text-[11px]`}
          >
            {user.status === "active" ? "Active" : "Inactive"}
          </Badge>
        </div>
      </TableCell>

      <TableCell className="px-4 py-4">
        <div className="grid min-w-[200px] grid-cols-3 gap-2">
          <div className="rounded-lg border border-violet-500/20 bg-violet-500/10 px-2 py-2">
            <p className="flex items-center gap-1 text-[10px] tracking-wide text-violet-200 uppercase">
              <Activity className="h-3 w-3" />
              Gen
            </p>
            <p className="mt-1 text-sm font-semibold text-violet-50">
              {formatNumber(totalRequests)}
            </p>
          </div>
          <div className="rounded-lg border border-orange-500/20 bg-orange-500/10 px-2 py-2">
            <p className="flex items-center gap-1 text-[10px] tracking-wide text-orange-200 uppercase">
              <Zap className="h-3 w-3" />
              Credits
            </p>
            <p className="mt-1 text-sm font-semibold text-orange-50">
              {formatNumber(userAnalytics?.total_credits_used ?? 0)}
            </p>
          </div>
          <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-2 py-2">
            <p className="text-[10px] tracking-wide text-emerald-200 uppercase">
              Success
            </p>
            <p className="mt-1 text-sm font-semibold text-emerald-50">
              {successRate}
            </p>
          </div>
        </div>
      </TableCell>

      <TableCell className="px-4 py-4">
        <div className="min-w-[190px] rounded-xl border border-slate-700/60 bg-slate-800/55 p-3">
          <div className="mb-2 flex items-center gap-2">
            <CreditCard className="h-3.5 w-3.5 text-cyan-300" />
            <p className="text-xs font-semibold text-slate-100">{planLabel}</p>
          </div>
          {subscription ? (
            <>
              <Badge
                variant="outline"
                className={`${getSubscriptionBadgeClass(subscription.status)} rounded-full border px-2 py-0.5 text-[10px]`}
              >
                {subscription.status}
              </Badge>
              <p className="mt-2 text-xs text-slate-300">
                {formatAmount(subscription.amount, subscription.currency)}/month
              </p>
              {subscription.status === "active" ? (
                <p className="mt-1 text-[11px] text-slate-400">
                  Next billing{" "}
                  {new Date(subscription.next_billing_date).toLocaleDateString()}
                </p>
              ) : null}
              {subscription.cancelled_at ? (
                <p className="mt-1 text-[11px] text-slate-400">
                  Cancelled{" "}
                  {new Date(subscription.cancelled_at).toLocaleDateString()}
                </p>
              ) : null}
            </>
          ) : (
            <p className="text-xs text-slate-400">No active subscription</p>
          )}
        </div>
      </TableCell>

      <TableCell className="px-4 py-4">
        <div className="min-w-[220px] rounded-xl border border-amber-500/25 bg-amber-500/10 p-3">
          <p className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold tracking-wide text-amber-200 uppercase">
            <LifeBuoy className="h-3.5 w-3.5" />
            Support Controls
          </p>
          <div className="space-y-2">
            <Button
              variant="outline"
              size="sm"
              className="h-8 w-full border-amber-400/35 bg-slate-900/30 text-amber-100 hover:bg-amber-500/15"
              onClick={() => void handleReleaseReservedCredits()}
              disabled={releaseReservedCreditsMutation.isPending}
            >
              {releaseReservedCreditsMutation.isPending
                ? "Releasing..."
                : "Release Reserved Credits"}
            </Button>
            <div className="flex items-center gap-2">
              <Select
                value={grantPlan}
                onValueChange={(value) =>
                  setGrantPlan(value as "starter" | "pro" | "premium")
                }
              >
                <SelectTrigger className="h-8 w-[132px] border-amber-400/30 bg-slate-900/25 text-xs text-amber-50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="border-slate-700 bg-slate-900/95">
                  <SelectItem value="starter">Starter</SelectItem>
                  <SelectItem value="pro">Pro</SelectItem>
                  <SelectItem value="premium">Premium</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="sm"
                className="h-8 border-amber-400/35 bg-slate-900/30 px-3 text-amber-100 hover:bg-amber-500/15"
                onClick={() => void handleGrantPlanCredits()}
                disabled={grantPlanCreditsMutation.isPending}
              >
                {grantPlanCreditsMutation.isPending ? "Granting..." : "Grant"}
              </Button>
            </div>
          </div>
        </div>
      </TableCell>

      <TableCell className="px-4 py-4">
        {subscription?.status === "active" ? (
          <Button
            variant="destructive"
            size="sm"
            className="h-8 whitespace-nowrap"
            onClick={() => void handleRevokeSubscription()}
            disabled={isRevoking}
          >
            <X className="mr-1.5 h-3.5 w-3.5" />
            {isRevoking ? "Revoking..." : "Revoke"}
          </Button>
        ) : (
          <span className="text-xs text-slate-500">No action required</span>
        )}
      </TableCell>
    </TableRow>
  );
});

UserRowWithStats.displayName = "UserRowWithStats";
