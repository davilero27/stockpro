const admin = require("firebase-admin");
const fs = require("fs");
const path = require("path");

function parseArgs() {
  const argv = process.argv.slice(2);
  const result = {};

  argv.forEach((arg) => {
    if (arg.startsWith("--")) {
      const [key, value] = arg.slice(2).split("=");
      result[key] = value ?? "";
    }
  });

  return result;
}

function formatValue(value) {
  return value == null ? "<missing>" : String(value);
}

async function main() {
  const args = parseArgs();
  const orgId =
    args.organizationId ||
    args.orgId ||
    process.env.ORGANIZATION_ID ||
    process.env.ORG_ID;
  const userUid = args.userUid || process.env.USER_UID;

  if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    const serviceAccountPath = path.join(
      __dirname,
      "..",
      "serviceAccountKey.json",
    );

    if (fs.existsSync(serviceAccountPath)) {
      const serviceAccount = require(serviceAccountPath);
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
    }
  }

  if (!admin.apps.length) {
    try {
      admin.initializeApp();
    } catch (error) {
      console.error(
        "Não foi possível inicializar o Firebase Admin. Use GOOGLE_APPLICATION_CREDENTIALS ou adicione serviceAccountKey.json ao workspace.",
      );
      console.error(error);
      process.exit(1);
    }
  }

  const db = admin.firestore();

  let organizationId = orgId;

  if (!organizationId) {
    if (!userUid) {
      console.error(
        "Uso: node scripts/auditMemberRoles.js --organizationId=<ORG_ID>\n" +
          "Opcional: --userUid=<USER_UID> para inferir a organização a partir de users/{uid}.",
      );
      process.exit(1);
    }

    const userSnapshot = await db.collection("users").doc(userUid).get();
    if (!userSnapshot.exists) {
      console.error(`Usuário não encontrado: ${userUid}`);
      process.exit(1);
    }

    const userData = userSnapshot.data();
    if (!userData || !userData.organizationId) {
      console.error(
        `Usuário ${userUid} não possui organizationId em users/${userUid}.`,
      );
      process.exit(1);
    }

    organizationId = userData.organizationId;
  }

  console.log(`Auditando organização: ${organizationId}`);
  console.log("Apenas leitura | Nenhuma alteração de dados será feita.\n");

  const membersSnapshot = await db
    .collection("organizations")
    .doc(organizationId)
    .collection("members")
    .get();

  if (membersSnapshot.empty) {
    console.log(
      `Nenhum membro encontrado em organizations/${organizationId}/members.`,
    );
    process.exit(0);
  }

  const rows = [];

  for (const memberDoc of membersSnapshot.docs) {
    const member = memberDoc.data();
    const uid = member.uid || memberDoc.id;
    const email = member.email || "<unknown>";
    const membersRole = member.role || "<missing>";

    const userSnapshot = await db.collection("users").doc(uid).get();
    const usersRole = userSnapshot.exists
      ? userSnapshot.data().role || "<missing>"
      : null;

    rows.push({
      uid,
      email,
      usersRole,
      membersRole,
      inconsistent: usersRole !== membersRole,
    });
  }

  const header = ["UID", "Email", "users.role", "members.role", "Divergência"];

  const columnWidths = [36, 32, 14, 14, 12];

  function pad(value, width) {
    const text = String(value);
    return text + " ".repeat(Math.max(0, width - text.length));
  }

  console.log(
    header.map((value, index) => pad(value, columnWidths[index])).join(" | "),
  );
  console.log(columnWidths.map((width) => "-".repeat(width)).join("-|-"));

  rows.forEach((row) => {
    console.log(
      [
        pad(row.uid, columnWidths[0]),
        pad(row.email, columnWidths[1]),
        pad(formatValue(row.usersRole), columnWidths[2]),
        pad(formatValue(row.membersRole), columnWidths[3]),
        pad(row.inconsistent ? "SIM" : "NÃO", columnWidths[4]),
      ].join(" | "),
    );
  });

  const inconsistentRows = rows.filter((row) => row.inconsistent);

  console.log("\nResumo:");
  console.log(`Total de membros auditados: ${rows.length}`);
  console.log(`Total de inconsistências: ${inconsistentRows.length}`);

  if (inconsistentRows.length > 0) {
    console.log("\nUsuários inconsistentes:");
    inconsistentRows.forEach((row) => {
      console.log(
        `- UID=${row.uid} | email=${row.email} | users.role=${formatValue(
          row.usersRole,
        )} | members.role=${formatValue(row.membersRole)}`,
      );
    });
  } else {
    console.log(
      "Nenhuma divergência encontrada entre users.role e members.role.",
    );
  }
}

main().catch((error) => {
  console.error("Erro ao executar auditoria:", error);
  process.exit(1);
});
