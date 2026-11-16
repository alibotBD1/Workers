// Donne (ou retire) les droits d'administration du back office à un compte existant.
//   FIREBASE_SERVICE_ACCOUNT="$(cat cle.json)" node scripts/definir-admin.mjs prenom.nom@exemple.com
//   … node scripts/definir-admin.mjs prenom.nom@exemple.com --retirer
import { initializeApp, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

const [email, option] = process.argv.slice(2);
if (!email || !process.env.FIREBASE_SERVICE_ACCOUNT) {
  console.error("Usage : FIREBASE_SERVICE_ACCOUNT=… node scripts/definir-admin.mjs <email> [--retirer]");
  process.exit(1);
}
initializeApp({ credential: cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)) });
const u = await getAuth().getUserByEmail(email);
const ref = getFirestore().doc(`admins/${u.uid}`);
if (option === "--retirer") {
  await ref.delete();
  console.log(`✓ ${email} n'est plus administrateur.`);
} else {
  await ref.set({ email, ajouteLe: new Date().toISOString() });
  console.log(`✓ ${email} est administrateur. Il doit se reconnecter pour voir le back office.`);
}
