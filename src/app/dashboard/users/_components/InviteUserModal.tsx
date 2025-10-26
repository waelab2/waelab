"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/trpc/react";
import { Loader2, Mail, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface InviteUserModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function InviteUserModal({ isOpen, onClose }: InviteUserModalProps) {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const utils = api.useUtils();

  const createInvitation = api.users.createInvitation.useMutation({
    onSuccess: () => {
      toast.success("Invitation sent successfully!");
      setEmail("");
      onClose();
      // Refetch invitations and stats
      void utils.users.getAllInvitations.invalidate();
      void utils.users.getInvitationStats.invalidate();
    },
    onError: (error) => {
      toast.error(`Failed to send invitation: ${error.message}`);
    },
    onSettled: () => {
      setIsSubmitting(false);
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsSubmitting(true);
    createInvitation.mutate({ emailAddress: email.trim() });
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setEmail("");
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/80" onClick={handleClose} />

      {/* Modal */}
      <div className="relative z-50 w-full max-w-md rounded-lg border border-gray-700 bg-gray-800 p-6 shadow-lg">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-white">
            <Mail className="h-5 w-5" />
            Invite User
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            disabled={isSubmitting}
            className="text-gray-400 hover:text-white"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <p className="mb-4 text-sm text-gray-400">
          Send an invitation to a new user. They will receive an email with a
          sign-up link.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-white">
              Email Address
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="user@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isSubmitting}
              className="border-gray-600 bg-gray-800/40 text-white placeholder:text-gray-400"
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
              className="border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !email.trim()}
              className="bg-blue-600 text-white hover:bg-blue-700"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Mail className="mr-2 h-4 w-4" />
                  Send Invitation
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
