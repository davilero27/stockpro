"use client";

import { AppLayout } from "@/components/AppLayout";
import { RoleGuard } from "@/components/RoleGuard";

import { useMembers } from "@/hooks/useMembers";

import { useAuth } from "@/contexts/AuthContext";

import {
  updateMemberRole,
} from "@/services/organizations";

export default function MembersPage() {
  const {
    members,
    loading,
    refreshMembers,
  } = useMembers();

  const {
    user,
    organizationId,
  } = useAuth();

  async function handleRoleChange(
    memberUid: string,
    role: "owner" | "admin" | "employee"
  ) {

    if (!organizationId) {
      return;
    }

    if (user?.uid === memberUid) {

      alert(
        "Você não pode alterar seu próprio cargo."
      );

      return;
    }

    try {

      await updateMemberRole(
        organizationId,
        memberUid,
        role
      );

      await refreshMembers();

      alert(
        "Cargo atualizado com sucesso."
      );

    } catch (error) {

      console.error(error);

      alert(
        "Erro ao atualizar cargo."
      );
    }
  }

  return (
    <RoleGuard allowedRoles={["owner", "admin"]}>
      <AppLayout>

        <div className="space-y-6">

          <div>
            <h1 className="text-3xl font-bold">
              Membros
            </h1>

            <p className="text-zinc-400">
              Gerencie os membros da organização
            </p>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">

            {loading ? (

              <div className="p-6">
                Carregando membros...
              </div>

            ) : members.length === 0 ? (

              <div className="p-6">
                Nenhum membro encontrado.
              </div>

            ) : (

              <table className="w-full">

                <thead className="bg-zinc-800">

                  <tr>

                    <th className="text-left p-4">
                      Email
                    </th>

                    <th className="text-left p-4">
                      Cargo
                    </th>

                    <th className="text-left p-4">
                      Status
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {members.map((member) => (

                    <tr
                      key={member.uid}
                      className="border-t border-zinc-800"
                    >

                      <td className="p-4">
                        {member.email}
                      </td>

                      <td className="p-4">

                        <select
                          value={member.role}
                          disabled={
                            user?.uid === member.uid
                          }
                          onChange={(e) =>
                            handleRoleChange(
                              member.uid,
                              e.target.value as
                              | "owner"
                              | "admin"
                              | "employee"
                            )
                          }
                          className="bg-zinc-800
                                  border
                                  border-zinc-700
                                  rounded-lg
                                  px-3
                                  py-2"
                        >
                          <option value="owner">
                            Owner
                          </option>

                          <option value="admin">
                            Admin
                          </option>

                          <option value="employee">
                            Employee
                          </option>

                        </select>

                      </td>

                      <td className="p-4 capitalize">
                        {member.status}
                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            )}

          </div>

        </div>

      </AppLayout>
    </RoleGuard>
  );
}