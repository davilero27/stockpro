"use client";

import {
  useEffect,
  useState,
  useCallback,
} from "react";

import { useAuth } from "@/contexts/AuthContext";

import type {
  OrganizationMember,
} from "@/lib/types";

import {
  listOrganizationMembers,
} from "@/services/organizations";

export function useMembers() {

  const { organizationId } = useAuth();

  const [members, setMembers] =
    useState<OrganizationMember[]>([]);

  const [loading, setLoading] =
    useState(true);

  const refreshMembers =
    useCallback(async () => {

      if (!organizationId) {
        return;
      }

      try {

        setLoading(true);

        const result =
          await listOrganizationMembers(
            organizationId
          );

        setMembers(result);

      } catch (error) {

        console.error(
          "Erro ao carregar membros:",
          error
        );

      } finally {

        setLoading(false);

      }

    }, [organizationId]);

  useEffect(() => {

    queueMicrotask(() => {
      refreshMembers();
    });

  }, [refreshMembers]);

  return {
    members,
    loading,
    refreshMembers,
  };
}
