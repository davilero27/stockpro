"use client";

import Link from "next/link";
import { useState } from "react";

import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useAuth } from "@/contexts/AuthContext";

export default function RegisterPage() {
  const router = useRouter();

  const { register } = useAuth();

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  async function handleRegister() {

    if (
      !email ||
      !password ||
      !confirmPassword
    ) {
      toast.info(
        "Preencha todos os campos"
      );
      return;
    }

    if (
      password !== confirmPassword
    ) {
      toast.error(
        "As senhas não coincidem"
      );
      return;
    }

    if (
      password.length < 6
    ) {
      toast.error(
        "A senha deve ter pelo menos 6 caracteres"
      );
      return;
    }

    try {

      setLoading(true);

      await register(
        email,
        password
      );

      const redirectParam =
        new URLSearchParams(
          window.location.search
        ).get("redirect");

      const redirectTo =
        redirectParam?.startsWith("/") &&
          !redirectParam.startsWith("//")
          ? redirectParam
          : "/dashboard";

      router.push(
        redirectTo
      );

    } catch (error) {

      console.error(error);

      toast.error(
        "Erro ao criar conta"
      );

    } finally {

      setLoading(false);

    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-950 p-4 text-white sm:p-6">

      <section className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900/90 p-6 shadow-2xl shadow-black/30 sm:p-8">

        <h1 className="mb-2 text-3xl font-bold">
          Criar conta
        </h1>

        <p className="mb-6 text-zinc-400">
          Cadastre-se para acessar o sistema
        </p>

        <div className="flex flex-col gap-4">

          <Input
            type="email"
            placeholder="Seu email"
            value={email}
            disabled={loading}
            onChange={(event) =>
              setEmail(
                event.target.value
              )
            }
          />

          <Input
            type="password"
            placeholder="Sua senha"
            value={password}
            disabled={loading}
            onChange={(event) =>
              setPassword(
                event.target.value
              )
            }
          />

          <Input
            type="password"
            placeholder="Confirmar senha"
            value={confirmPassword}
            disabled={loading}
            onChange={(event) =>
              setConfirmPassword(
                event.target.value
              )
            }
          />

          <Button
            type="button"
            onClick={
              handleRegister
            }
            disabled={loading}
            className="w-full"
          >
            {loading
              ? "Criando conta..."
              : "Criar conta"}
          </Button>

          <Link
            href="/login"
            className="text-center text-sm text-blue-400"
          >
            Já possui conta? Entrar
          </Link>

        </div>

      </section>

    </main>
  );
}