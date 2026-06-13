"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import { useAuth } from "@/contexts/AuthContext";

import type {
  OrganizationInvite,
} from "@/lib/types";

import {
  listOrganizationInvites,
} from "@/services/organizations";

export function useInvites() {
  const { organizationId } = useAuth();

  const [invites, setInvites] =
    useState<OrganizationInvite[]>([]);

  const [loading, setLoading] =
    useState(true);

  const refreshInvites =
    useCallback(async () => {
      if (!organizationId) {
        setInvites([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        const result =
          await listOrganizationInvites(organizationId);

        setInvites(result);
      } catch (error) {
        console.error(
          "Erro ao carregar convites:",
          error
        );
      } finally {
        setLoading(false);
      }
    }, [organizationId]);

  useEffect(() => {
    queueMicrotask(() => {
      refreshInvites();
    });
  }, [refreshInvites]);

  return {
    invites,
    loading,
    refreshInvites,
  };
}
