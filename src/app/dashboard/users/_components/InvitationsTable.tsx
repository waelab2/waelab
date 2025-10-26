"use client";

import { Avatar } from "@/components/ui/avatar";
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
import { api } from "@/trpc/react";
import { CheckCircle, Clock, Mail, Trash2, XCircle } from "lucide-react";
import { memo, useState } from "react";
import { toast } from "sonner";

interface InvitationsTableProps {
  isLoading?: boolean;
}

const statusConfig = {
  pending: {
    icon: Clock,
    label: "Pending",
    className: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  },
  accepted: {
    icon: CheckCircle,
    label: "Accepted",
    className: "bg-green-500/20 text-green-400 border-green-500/30",
  },
  revoked: {
    icon: XCircle,
    label: "Revoked",
    className: "bg-red-500/20 text-red-400 border-red-500/30",
  },
};

export const InvitationsTable = memo(
  ({ isLoading = false }: InvitationsTableProps) => {
    const [revokeDialogOpen, setRevokeDialogOpen] = useState(false);
    const [invitationToRevoke, setInvitationToRevoke] = useState<string | null>(
      null,
    );

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

    if (isLoading || invitationsLoading) {
      return (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="animate-pulse">
              <div className="flex items-center gap-4 rounded-lg bg-gray-700/30 p-4">
                <div className="h-10 w-10 rounded-full bg-gray-600"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-32 rounded bg-gray-600"></div>
                  <div className="h-3 w-48 rounded bg-gray-600"></div>
                </div>
                <div className="space-y-2">
                  <div className="h-4 w-16 rounded bg-gray-600"></div>
                  <div className="h-3 w-12 rounded bg-gray-600"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      );
    }

    return (
      <>
        <div className="space-y-2">
          {!invitations || invitations.length === 0 ? (
            <div className="py-8 text-center">
              <Mail className="mx-auto mb-4 h-12 w-12 text-gray-500" />
              <p className="text-gray-400">No invitations found</p>
              <p className="mt-1 text-sm text-gray-500">
                Invite users to get started
              </p>
            </div>
          ) : (
            invitations.map((invitation) => {
              const statusInfo =
                statusConfig[invitation.status as keyof typeof statusConfig];
              const StatusIcon = statusInfo.icon;

              return (
                <div
                  key={invitation.id}
                  className="flex items-center gap-4 rounded-lg bg-gray-700/30 p-4 transition-colors hover:bg-gray-700/50"
                >
                  <Avatar className="h-10 w-10">
                    <div className="flex h-full w-full items-center justify-center bg-gray-600 text-gray-300">
                      <Mail className="h-5 w-5" />
                    </div>
                  </Avatar>

                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex items-center gap-2">
                      <p className="truncate text-sm font-medium text-white">
                        {invitation.emailAddress}
                      </p>
                      <Badge
                        variant="outline"
                        className={`${statusInfo.className} text-xs`}
                      >
                        <StatusIcon className="mr-1 h-3 w-3" />
                        {statusInfo.label}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-400">
                      Invited{" "}
                      {new Date(invitation.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {invitation.status === "pending" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRevokeClick(invitation.id)}
                        className="text-gray-400 hover:bg-red-500/10 hover:text-red-400"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Revoke Confirmation Dialog */}
        <Dialog open={revokeDialogOpen} onOpenChange={setRevokeDialogOpen}>
          <DialogContent className="border-gray-700 bg-gray-800 sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-white">
                <Trash2 className="h-5 w-5 text-red-500" />
                Revoke Invitation
              </DialogTitle>
              <DialogDescription className="text-gray-400">
                Are you sure you want to revoke this invitation? This action
                cannot be undone. The user will no longer be able to use the
                invitation link to sign up.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                variant="outline"
                onClick={handleCancelRevoke}
                disabled={revokeInvitation.isPending}
                className="border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleConfirmRevoke}
                disabled={revokeInvitation.isPending}
                className="bg-red-600 text-white hover:bg-red-700"
              >
                {revokeInvitation.isPending ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Revoking...
                  </>
                ) : (
                  <>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Revoke Invitation
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </>
    );
  },
);

InvitationsTable.displayName = "InvitationsTable";
