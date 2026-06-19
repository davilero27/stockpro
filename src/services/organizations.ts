import {
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  setDoc,
  Timestamp,
  writeBatch,
} from "firebase/firestore";

import { db } from "@/lib/firestore";

import type {
  Organization,
  OrganizationInvite,
  OrganizationMember,
  PublicOrganizationInvite,
  UserRole,
} from "@/lib/types";

export interface UserProfile {
  uid: string;
  email: string;
  organizationId: string | null;
  role: UserRole;
}

// ─── Refs ────────────────────────────────────────────────────────────────────

export function getUserProfileRef(uid: string) {
  return doc(db, "users", uid);
}

export function getOrganizationRef(organizationId: string) {
  return doc(db, "organizations", organizationId);
}

// ─── Leitura ─────────────────────────────────────────────────────────────────

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  // ✅ Lança o erro para o chamador tratar (AuthContext já tem try/catch)
  const snapshot = await getDoc(getUserProfileRef(uid));

  if (!snapshot.exists()) return null;

  return snapshot.data() as UserProfile;
}

export async function getOrganization(
  organizationId: string
): Promise<Organization | null> {
  const snapshot = await getDoc(getOrganizationRef(organizationId));

  if (!snapshot.exists()) return null;

  return { id: snapshot.id, ...snapshot.data() } as Organization;
}

// ─── Criação de organização ───────────────────────────────────────────────────

export async function createOrganizationForUser({
  uid,
  email,
  name,
}: {
  uid: string;
  email: string;
  name: string;
}) {
  const organizationId = uid;
  const batch = writeBatch(db);

  const organizationRef = getOrganizationRef(organizationId);
  const userRef = getUserProfileRef(uid);
  const memberRef = doc(db, "organizations", organizationId, "members", uid);

  // Organização
  batch.set(organizationRef, {
    name,
    ownerId: uid,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  // Usuário
  batch.set(userRef, {
    uid,
    email,
    organizationId,
    role: "owner",
    updatedAt: serverTimestamp(),
  });

  // Membro
  batch.set(memberRef, {
    uid,
    email,
    role: "owner",
    status: "active",
    createdAt: serverTimestamp(),
  });

  await batch.commit();

  return organizationId;
}

// ─── Atualização ─────────────────────────────────────────────────────────────

export async function updateOrganizationName(
  organizationId: string,
  name: string
) {
  await setDoc(
    getOrganizationRef(organizationId),
    { name, updatedAt: serverTimestamp() },
    { merge: true }
  );
}

// ─── Convites ─────────────────────────────────────────────────────────────────

export async function createOrganizationInvite({
  organizationId,
  email,
  role,
}: {
  organizationId: string;
  email: string;
  role: UserRole;
}) {
  const token = crypto.randomUUID();
  const normalizedEmail = email.trim().toLowerCase();
  const now = Timestamp.now();
  const expiresAt = Timestamp.fromMillis(
    now.toMillis() + 48 * 60 * 60 * 1000
  );

  const inviteRef = doc(
    db,
    "organizations",
    organizationId,
    "invites",
    token
  );

  const publicInviteRef = doc(db, "inviteTokens", token);
  const batch = writeBatch(db);

  batch.set(inviteRef, {
    email: normalizedEmail,
    role,
    token,
    status: "pending",
    createdAt: now,
    expiresAt,
  });

  batch.set(publicInviteRef, {
    organizationId,
    role,
    token,
    status: "pending",
    createdAt: now,
    expiresAt,
  });

  await batch.commit();

  return token;
}

export async function listOrganizationInvites(
  organizationId: string
): Promise<OrganizationInvite[]> {
  const invitesQuery = query(
    collection(db, "organizations", organizationId, "invites"),
    orderBy("createdAt", "desc")
  );

  const snapshot = await getDocs(invitesQuery);

  return snapshot.docs.map((inviteDoc) => ({
    id: inviteDoc.id,
    organizationId,
    ...inviteDoc.data(),
  })) as OrganizationInvite[];
}

export async function getInviteByToken(
  token: string
): Promise<PublicOrganizationInvite | null> {
  const inviteRef = doc(db, "inviteTokens", token);
  const inviteSnapshot = await getDoc(inviteRef);

  if (!inviteSnapshot.exists()) {
    return null;
  }

  return {
    id: inviteSnapshot.id,
    ...inviteSnapshot.data(),
  } as PublicOrganizationInvite;
}

export async function acceptInvite(
  token: string,
  uid: string,
  email: string
) {
  const invite = await getInviteByToken(token);

  if (!invite) {
    throw new Error("Convite inexistente.");
  }

  const normalizedEmail = email.trim().toLowerCase();

  const inviteRef = doc(
    db,
    "organizations",
    invite.organizationId,
    "invites",
    token
  );
  const publicInviteRef = doc(db, "inviteTokens", token);

  let expired = false;

  await runTransaction(db, async (transaction) => {
    const publicInviteSnapshot =
      await transaction.get(publicInviteRef);
    const inviteSnapshot = await transaction.get(inviteRef);

    if (!publicInviteSnapshot.exists()) {
      throw new Error("Convite inexistente.");
    }

    if (!inviteSnapshot.exists()) {
      throw new Error("Convite inexistente.");
    }

    const publicInviteData =
      publicInviteSnapshot.data() as PublicOrganizationInvite;
    const inviteData = inviteSnapshot.data() as OrganizationInvite;

    if (inviteData.email !== normalizedEmail) {
      throw new Error("Este convite pertence a outro email.");
    }

    if (
      publicInviteData.status !== "pending" ||
      inviteData.status !== "pending"
    ) {
      throw new Error("Convite ja utilizado.");
    }

    const expiresAt = inviteData.expiresAt.toDate();

    if (expiresAt.getTime() <= Date.now()) {
      transaction.update(inviteRef, {
        status: "expired",
        updatedAt: serverTimestamp(),
      });

      transaction.update(publicInviteRef, {
        status: "expired",
        updatedAt: serverTimestamp(),
      });

      expired = true;
      return;
    }

    const userRef = getUserProfileRef(uid);
    const memberRef = doc(
      db,
      "organizations",
      invite.organizationId,
      "members",
      uid
    );

    transaction.set(
      userRef,
      {
        uid,
        email: normalizedEmail,
        organizationId: invite.organizationId,
        role: inviteData.role,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );

    transaction.set(
      memberRef,
      {
        uid,
        email: normalizedEmail,
        role: inviteData.role,
        status: "active",
        acceptedInviteToken: token,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );

    transaction.update(inviteRef, {
      status: "accepted",
      acceptedAt: serverTimestamp(),
      acceptedBy: uid,
      updatedAt: serverTimestamp(),
    });

    transaction.update(publicInviteRef, {
      status: "accepted",
      acceptedAt: serverTimestamp(),
      acceptedBy: uid,
      updatedAt: serverTimestamp(),
    });
  });

  if (expired) {
    throw new Error("Convite expirado.");
  }
}

// ─── Migração legado ──────────────────────────────────────────────────────────
export async function migrateLegacyData(
  _organizationId: string
): Promise<{ products: number; sales: number }> {
  void _organizationId;

  console.warn(
    "[migrateLegacyData] Função desabilitada para evitar erros de permissão. " +
    "Use Cloud Function ou Firebase CLI com credenciais de admin."
  );

  return {
    products: 0,
    sales: 0,
  };
}

// ─── Members ─────────────────────────────────────────────────────────────────

export async function listOrganizationMembers(
  organizationId: string
): Promise<OrganizationMember[]> {
  const membersRef = collection(
    db,
    "organizations",
    organizationId,
    "members"
  );

  const snapshot = await getDocs(membersRef);

  return snapshot.docs.map((memberDoc) => {
    const data = memberDoc.data();

    return {
      uid: data.uid ?? memberDoc.id,
      email: data.email ?? "",
      role: data.role ?? "employee",
      status: data.status ?? "pending",
    };
  });
}

export async function updateMemberRole(
  organizationId: string,
  uid: string,
  role: UserRole
) {

  const batch = writeBatch(db);

  const memberRef = doc(
    db,
    "organizations",
    organizationId,
    "members",
    uid
  );

  const userRef = doc(
    db,
    "users",
    uid
  );

  console.log(
    "[updateMemberRole] service payload",
    {
      organizationId,
      uid,
      role,
      writes: {
        memberPath: memberRef.path,
        userPath: userRef.path,
      },
    }
  );

  batch.update(
    memberRef,
    {
      role,
      updatedAt: serverTimestamp(),
    }
  );

  batch.update(
    userRef,
    {
      role,
      updatedAt: serverTimestamp(),
    }
  );

  await batch.commit();
}
