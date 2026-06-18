"use client";

import { useEffect, useState } from "react";

import Link from "next/link";

import { useRouter } from "next/navigation";

import { toast } from "sonner";

import { Button } from "@/components/ui/Button";

import { useAuth } from "@/contexts/AuthContext";

import type {
  PublicOrganizationInvite,
} from "@/lib/types";

import {
  acceptInvite,
  getInviteByToken,
} from "@/services/organizations";

type InviteState =
  | "loading"
  | "valid"
  | "expired"
  | "missing"
  | "accepted"
  | "accepting"
  | "error";

interface InviteAcceptanceClientProps {
  token: string;
}

function isExpired(invite: PublicOrganizationInvite) {
  return invite.expiresAt.toDate().getTime() <= Date.now();
}

export function InviteAcceptanceClient({
  token,
}: InviteAcceptanceClientProps) {
  const router = useRouter();

  const {
    user,
    loading: authLoading,
    refreshProfile,
  } = useAuth();

  const [invite, setInvite] =
    useState<PublicOrganizationInvite | null>(null);
  const [state, setState] =
    useState<InviteState>("loading");
  const [errorMessage, setErrorMessage] =
    useState("");

  useEffect(() => {
    async function loadInvite() {
      try {
        setState("loading");

        const result = await getInviteByToken(token);

        if (!result) {
          setState("missing");
          return;
        }

        setInvite(result);

        if (result.status === "accepted") {
          setState("accepted");
          return;
        }

        if (
          result.status === "expired" ||
          isExpired(result)
        ) {
          setState("expired");
          return;
        }

        setState("valid");
      } catch (error) {
        console.error(error);
        setErrorMessage("Erro ao carregar convite.");
        setState("error");
      }
    }

    loadInvite();
  }, [token]);

  useEffect(() => {
    async function handleAcceptInvite() {
      if (
        authLoading ||
        !user ||
        !invite ||
        state !== "valid"
      ) {
        return;
      }

      if (!user.email) {
        setErrorMessage(
          "Sua conta nao possui email para aceitar este convite."
        );
        setState("error");
        return;
      }

      try {
        setState("accepting");

        await acceptInvite(
          token,
          user.uid,
          user.email
        );

        await refreshProfile();

        toast.success("Convite aceito com sucesso");
        router.push("/dashboard");
      } catch (error) {
        console.error(error);
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Erro ao aceitar convite."
        );
        setState("error");
      }
    }

    handleAcceptInvite();
  }, [
    authLoading,
    invite,
    refreshProfile,
    router,
    state,
    token,
    user,
  ]);

  const loginHref =
    `/login?redirect=/convite/${token}`;

  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-950 p-4 text-white sm:p-6">
      <section className="w-full max-w-lg rounded-2xl border border-zinc-800 bg-zinc-900/90 p-6 shadow-2xl shadow-black/30 sm:p-8">
        <h1 className="mb-2 text-3xl font-bold">
          Convite StockPro
        </h1>

        {state === "loading" || authLoading ? (
          <p className="text-zinc-400">
            Carregando convite...
          </p>
        ) : state === "missing" ? (
          <p className="text-zinc-400">
            Convite inexistente.
          </p>
        ) : state === "expired" ? (
          <p className="text-zinc-400">
            Convite expirado.
          </p>
        ) : state === "accepted" ? (
          <p className="text-zinc-400">
            Convite ja utilizado.
          </p>
        ) : state === "accepting" ? (
          <p className="text-zinc-400">
            Aceitando convite...
          </p>
        ) : state === "error" ? (
          <p className="text-zinc-400">
            {errorMessage}
          </p>
        ) : (
          <div className="space-y-5">
            <p className="text-zinc-400">
              Voce foi convidado para entrar na organizacao
              como{" "}
              <span className="font-medium text-white">
                {invite?.role}
              </span>
              .
            </p>

            {!user && (

              <div className="space-y-3">

                <Link href={loginHref}>
                  <Button
                    type="button"
                    className="w-full"
                  >
                    Entrar para aceitar convite
                  </Button>
                </Link>

                <Link
                  href={`/cadastro?redirect=/convite/${token}`}
                >
                  <Button
                    type="button"
                    variant="secondary"
                    className="w-full"
                  >
                    Criar conta
                  </Button>
                </Link>

              </div>

            )}
          </div>
        )}
      </section>
    </main>
  );
}
