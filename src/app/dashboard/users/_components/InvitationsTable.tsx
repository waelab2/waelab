"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { api } from "@/trpc/react";
import {
  CheckCircle,
  Clock,
  Filter,
  Mail,
  Search,
  Sparkles,
  Trash2,
  XCircle,
} from "lucide-react";
import { memo, useMemo, useState } from "react";
import { toast } from "sonner";

interface InvitationsTableProps {
  isLoading?: boolean;
}

const statusConfig = {
  pending: {
    icon: Clock,
    label: "Pending",
    className: "border-amber-500/35 bg-amber-500/15 text-amber-100",
  },
  accepted: {
    icon: CheckCircle,
    label: "Accepted",
    className: "border-emerald-500/35 bg-emerald-500/15 text-emerald-100",
  },
  revoked: {
    icon: XCircle,
    label: "Revoked",
    className: "border-rose-500/35 bg-rose-500/15 text-rose-100",
  },
};

const getInitialLetter = (email: string) => email.trim().charAt(0).toUpperCase();

export const InvitationsTable = memo(
  ({ isLoading = false }: InvitationsTableProps) => {
    const [revokeDialogOpen, setRevokeDialogOpen] = useState(false);
    const [invitationToRevoke, setInvitationToRevoke] = useState<string | null>(
      null,
    );
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState<
      "all" | "pending" | "accepted" | "revoked"
    >("all");

    const { data: invitations, isLoading: invitationsLoading } =
      api.users.getAllInvitations.useQuery();
    const utils = api.useUtils();

    const revokeInvitation = api.users.revokeInvitation.useMutation({
      onSuccess: () => {
        toast.success("Invitation revoked successfully!");
        void utils.users.getAllInvitations.invalidate();
        void utils.users.getInvitationStats.invalidate();
        setRevokeDialogOpen(false);
        setInvitationToRevoke(null);
      },
      onError: (error) => {
        toast.error(`Failed to revoke invitation: ${error.message}`);
      },
    });

    const handleRevokeClick = (invitationId: string) => {
      setInvitationToRevoke(invitationId);
      setRevokeDialogOpen(true);
    };

    const handleConfirmRevoke = () => {
      if (invitationToRevoke) {
        revokeInvitation.mutate({ invitationId: invitationToRevoke });
      }
    };

    const handleCancelRevoke = () => {
      setRevokeDialogOpen(false);
      setInvitationToRevoke(null);
    };

    const filteredInvitations = useMemo(() => {
      if (!invitations) return [];

      const query = searchQuery.trim().toLowerCase();

      return invitations.filter((invitation) => {
        const matchesSearch =
          query.length === 0 ||
          invitation.emailAddress.toLowerCase().includes(query);
        const matchesStatus =
          statusFilter === "all" || invitation.status === statusFilter;
        return matchesSearch && matchesStatus;
      });
    }, [invitations, searchQuery, statusFilter]);

    if (isLoading || invitationsLoading) {
      return (
        <div className="overflow-hidden rounded-2xl border border-slate-700/60 bg-slate-900/45">
          <Table className="min-w-[760px]">
            <TableHeader>
              <TableRow className="border-slate-700/70 bg-slate-800/40">
                <TableHead className="h-11 text-xs font-semibold tracking-wide text-slate-300 uppercase">
                  Invitee
                </TableHead>
                <TableHead className="h-11 text-xs font-semibold tracking-wide text-slate-300 uppercase">
                  Status
                </TableHead>
                <TableHead className="h-11 text-xs font-semibold tracking-wide text-slate-300 uppercase">
                  Created
                </TableHead>
                <TableHead className="h-11 text-xs font-semibold tracking-wide text-slate-300 uppercase">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: 3 }).map((_, index) => (
                <TableRow key={index} className="border-slate-700/50">
                  <TableCell className="py-4">
                    <div className="h-10 animate-pulse rounded-md bg-slate-700/35" />
                  </TableCell>
                  <TableCell className="py-4">
                    <div className="h-10 animate-pulse rounded-md bg-slate-700/35" />
                  </TableCell>
                  <TableCell className="py-4">
                    <div className="h-10 animate-pulse rounded-md bg-slate-700/35" />
                  </TableCell>
                  <TableCell className="py-4">
                    <div className="h-10 animate-pulse rounded-md bg-slate-700/35" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      );
    }

    return (
      <>
        <div className="relative mb-4 overflow-hidden rounded-2xl border border-indigo-900/45 bg-gradient-to-br from-slate-900/90 via-slate-900/80 to-slate-950 p-3 sm:p-4">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(99,102,241,0.22),transparent_40%),radial-gradient(circle_at_bottom_right,rgba(14,165,233,0.12),transparent_45%)]" />
          <div className="relative grid gap-3 md:grid-cols-2">
            <div className="relative">
              <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-indigo-200/65" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by email"
                className="h-10 border-slate-700/80 bg-slate-900/65 pr-3 pl-9 text-slate-100 placeholder:text-slate-400 focus-visible:border-indigo-500/60"
              />
            </div>
            <div className="relative">
              <Filter className="pointer-events-none absolute top-1/2 left-3 z-10 h-4 w-4 -translate-y-1/2 text-indigo-200/65" />
              <Select
                value={statusFilter}
                onValueChange={(value) =>
                  setStatusFilter(
                    value as "all" | "pending" | "accepted" | "revoked",
                  )
                }
              >
                <SelectTrigger className="h-10 w-full border-slate-700/80 bg-slate-900/65 pl-9 text-slate-100">
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent className="border-slate-700 bg-slate-900/95">
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="accepted">Accepted</SelectItem>
                  <SelectItem value="revoked">Revoked</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <p className="relative mt-3 text-xs text-indigo-100/80">
            Showing {filteredInvitations.length} of {invitations?.length ?? 0}{" "}
            invitations
          </p>
        </div>

        {!invitations || filteredInvitations.length === 0 ? (
          <div className="rounded-2xl border border-slate-700/60 bg-slate-900/50 px-6 py-12 text-center">
            <Sparkles className="mx-auto mb-3 h-5 w-5 text-indigo-300/75" />
            <p className="text-sm font-medium text-slate-200">
              No invitations match your filters
            </p>
            <p className="mt-1 text-xs text-slate-400">
              Try changing the email search or status filter.
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-slate-700/60 bg-slate-900/45 shadow-[0_0_0_1px_rgba(30,41,59,0.4),0_18px_32px_-28px_rgba(99,102,241,0.45)]">
            <Table className="min-w-[760px]">
              <TableHeader>
                <TableRow className="border-slate-700/70 bg-slate-900/90 hover:bg-slate-900/90">
                  <TableHead className="h-12 px-4 text-[11px] font-semibold tracking-[0.18em] text-slate-300 uppercase">
                    Invitee
                  </TableHead>
                  <TableHead className="h-12 px-4 text-[11px] font-semibold tracking-[0.18em] text-slate-300 uppercase">
                    Status
                  </TableHead>
                  <TableHead className="h-12 px-4 text-[11px] font-semibold tracking-[0.18em] text-slate-300 uppercase">
                    Created
                  </TableHead>
                  <TableHead className="h-12 px-4 text-right text-[11px] font-semibold tracking-[0.18em] text-slate-300 uppercase">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInvitations.map((invitation) => {
                  const statusInfo =
                    statusConfig[invitation.status as keyof typeof statusConfig];
                  const StatusIcon = statusInfo.icon;

                  return (
                    <TableRow
                      key={invitation.id}
                      className="border-slate-700/60 bg-slate-900/35 hover:bg-slate-800/35"
                    >
                      <TableCell className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10 ring-2 ring-slate-700/70">
                            <AvatarFallback className="bg-slate-700 text-xs font-semibold text-slate-200">
                              {getInitialLetter(invitation.emailAddress)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-slate-100">
                              {invitation.emailAddress}
                            </p>
                            <p className="mt-1 flex items-center gap-1 text-xs text-slate-400">
                              <Mail className="h-3 w-3" />
                              Invitation email
                            </p>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell className="px-4 py-4">
                        <Badge
                          variant="outline"
                          className={`${statusInfo.className} rounded-full border px-2.5 py-1 text-[11px]`}
                        >
                          <StatusIcon className="h-3 w-3" />
                          {statusInfo.label}
                        </Badge>
                      </TableCell>

                      <TableCell className="px-4 py-4">
                        <p className="text-sm text-slate-200">
                          {new Date(invitation.createdAt).toLocaleDateString()}
                        </p>
                      </TableCell>

                      <TableCell className="px-4 py-4 text-right">
                        {invitation.status === "pending" ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRevokeClick(invitation.id)}
                            className="border-rose-500/35 bg-rose-500/10 text-rose-100 hover:bg-rose-500/20"
                          >
                            <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                            Revoke
                          </Button>
                        ) : (
                          <span className="text-xs text-slate-500">
                            No action
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}

        <Dialog open={revokeDialogOpen} onOpenChange={setRevokeDialogOpen}>
          <DialogContent className="border-slate-700 bg-slate-900 sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-slate-100">
                <Trash2 className="h-5 w-5 text-rose-400" />
                Revoke Invitation
              </DialogTitle>
              <DialogDescription className="text-slate-400">
                Are you sure you want to revoke this invitation? The recipient
                will no longer be able to use the invite link.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                variant="outline"
                onClick={handleCancelRevoke}
                disabled={revokeInvitation.isPending}
                className="border-slate-600 text-slate-300 hover:bg-slate-800 hover:text-slate-100"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleConfirmRevoke}
                disabled={revokeInvitation.isPending}
              >
                {revokeInvitation.isPending ? "Revoking..." : "Revoke Invitation"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </>
    );
  },
);

InvitationsTable.displayName = "InvitationsTable";
