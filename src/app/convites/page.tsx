"use client";

import {
  MailPlus,
} from "lucide-react";

import { useState } from "react";

import { toast } from "sonner";

import { AppLayout } from "@/components/AppLayout";

import { RoleGuard } from "@/components/RoleGuard";

import { Button } from "@/components/ui/Button";

import { Input } from "@/components/ui/Input";

import { useAuth } from "@/contexts/AuthContext";

import { useInvites } from "@/hooks/useInvites";

import type {
  UserRole,
} from "@/lib/types";

import {
  createOrganizationInvite,
} from "@/services/organizations";

import { formatDate } from "@/utils/formatDate";

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default function InvitesPage() {
  const { organizationId } = useAuth();

  const {
    invites,
    loading,
    refreshInvites,
  } = useInvites();

  const [email, setEmail] = useState("");
  const [role, setRole] =
    useState<UserRole>("employee");
  const [creating, setCreating] = useState(false);
  const [generatedLink, setGeneratedLink] =
    useState("");

  async function handleCreateInvite() {
    if (!organizationId) {
      return;
    }

    const normalizedEmail =
      email.trim().toLowerCase();

    if (!isValidEmail(normalizedEmail)) {
      toast.error("Informe um email valido");
      return;
    }

    try {
      setCreating(true);

      const token = await createOrganizationInvite({
        organizationId,
        email: normalizedEmail,
        role,
      });

      setGeneratedLink(`/convite/${token}`);
      setEmail("");
      setRole("employee");

      await refreshInvites();

      toast.success("Convite criado com sucesso");
    } catch (error) {
      console.error(error);
      toast.error("Erro ao criar convite");
    } finally {
      setCreating(false);
    }
  }

  return (
    <RoleGuard allowedRoles={["owner", "admin"]}>
      <AppLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">
              Convites
            </h1>

            <p className="text-zinc-400">
              Crie e acompanhe convites da organizacao
            </p>
          </div>

          <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
            <div className="mb-5 flex items-center gap-3">
              <div className="rounded-xl bg-blue-600 p-3">
                <MailPlus className="h-5 w-5 text-white" />
              </div>

              <div>
                <h2 className="font-semibold text-white">
                  Novo convite
                </h2>
                <p className="text-sm text-zinc-500">
                  O link gerado expira em 48 horas
                </p>
              </div>
            </div>

            <div className="grid gap-3 lg:grid-cols-[1fr_180px_auto]">
              <Input
                type="email"
                value={email}
                disabled={creating}
                placeholder="usuario@empresa.com"
                onChange={(event) =>
                  setEmail(event.target.value)
                }
              />

              <select
                value={role}
                disabled={creating}
                onChange={(event) =>
                  setRole(event.target.value as UserRole)
                }
                className="rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm outline-none transition focus:border-blue-500"
              >
                <option value="employee">Employee</option>
                <option value="admin">Admin</option>
                <option value="owner">Owner</option>
              </select>

              <Button
                type="button"
                disabled={creating}
                onClick={handleCreateInvite}
                className="whitespace-nowrap"
              >
                {creating ? "Criando..." : "Criar convite"}
              </Button>
            </div>

            {generatedLink && (
              <div className="mt-4 rounded-xl border border-blue-900/60 bg-blue-950/30 p-4 text-sm">
                <p className="mb-1 text-zinc-400">
                  Link gerado
                </p>
                <p className="break-all font-medium text-blue-300">
                  {generatedLink}
                </p>
              </div>
            )}
          </section>

          <section className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900">
            {loading ? (
              <div className="p-6">
                Carregando convites...
              </div>
            ) : invites.length === 0 ? (
              <div className="p-6">
                Nenhum convite encontrado.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[760px]">
                  <thead className="bg-zinc-800">
                    <tr>
                      <th className="p-4 text-left">
                        Email
                      </th>
                      <th className="p-4 text-left">
                        Role
                      </th>
                      <th className="p-4 text-left">
                        Status
                      </th>
                      <th className="p-4 text-left">
                        Criado em
                      </th>
                      <th className="p-4 text-left">
                        Expira em
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {invites.map((invite) => (
                      <tr
                        key={invite.id}
                        className="border-t border-zinc-800"
                      >
                        <td className="p-4">
                          {invite.email}
                        </td>
                        <td className="p-4 capitalize">
                          {invite.role}
                        </td>
                        <td className="p-4 capitalize">
                          {invite.status}
                        </td>
                        <td className="p-4">
                          {formatDate(invite.createdAt)}
                        </td>
                        <td className="p-4">
                          {formatDate(invite.expiresAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      </AppLayout>
    </RoleGuard>
  );
}
