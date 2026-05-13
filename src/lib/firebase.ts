import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
console.log("Firebase initialized. Project:", firebaseConfig.projectId);
// Try default instance first
export const db = getFirestore(app);
export const auth = getAuth();

// Initialize anonymous auth for "no login" functionality
export const initAuth = async () => {
  // We'll skip this for now as it requires manual enablement in the console
};

// Validate connection
async function testConnection() {
  try {
    const testDoc = doc(db, 'test', 'connection');
    console.log("Testing connection to path:", testDoc.path);
    await getDocFromServer(testDoc);
    console.log("Firebase connection successful");
  } catch (error) {
    console.error("Firebase connection test failed:", error);
    // Try to see if hardcoding the named dbId works if default fails
    try {
      console.log("Retrying with named dbId...");
      const namedDb = getFirestore(app, "ai-studio-orbitaiaudit-b977e85f-e93c-4b86-a400-2fd454eaa699");
      await getDocFromServer(doc(namedDb, 'test', 'connection'));
      console.log("Named db connection successful!");
    } catch (err2) {
      console.error("Named db connection also failed:", err2);
    }
  }
}
testConnection();

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}
