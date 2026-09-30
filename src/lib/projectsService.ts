import {
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  onSnapshot,
} from 'firebase/firestore';
import { db } from './firebase';

/** Firestore shape for a user project endpoint */
export interface UserProject {
  id: string;
  user_id: string;
  name: string;
  slug: string;
  endpoint?: string;
  env: 'Production' | 'Staging' | 'Development';
  spend: number;
  budgetLimit: number;
  tokens: string;
  requests: number;
  avgLatency: string;
  primaryModel: string;
  failoverModel: string;
  paused: boolean;
  lastActive: string;
  created_at: string;
  updated_at: string;
}

const DEMO_PROJECTS: Omit<UserProject, 'id' | 'user_id' | 'created_at' | 'updated_at'>[] = [
  {
    name: 'Main Web Platform',
    slug: 'web-platform',
    env: 'Production',
    spend: 2450.21,
    budgetLimit: 3500,
    tokens: '142.8M',
    requests: 48920,
    avgLatency: '320ms',
    primaryModel: 'GPT-4o',
    failoverModel: 'Claude 3.5 Sonnet',
    paused: false,
    lastActive: 'Just now',
  },
  {
    name: 'Customer Support Copilot',
    slug: 'support-copilot',
    env: 'Production',
    spend: 1210.43,
    budgetLimit: 1500,
    tokens: '94.2M',
    requests: 26410,
    avgLatency: '410ms',
    primaryModel: 'Claude 3.5 Sonnet',
    failoverModel: 'Claude 3.5 Haiku',
    paused: false,
    lastActive: '2m ago',
  },
  {
    name: 'Analytics SQL Generator',
    slug: 'sql-generator',
    env: 'Staging',
    spend: 54.12,
    budgetLimit: 300,
    tokens: '6.2M',
    requests: 840,
    avgLatency: '390ms',
    primaryModel: 'GPT-4o-mini',
    failoverModel: 'Gemini 1.5 Flash',
    paused: false,
    lastActive: '1h ago',
  },
  {
    name: 'R&D Synthetic Data Lab',
    slug: 'rnd-synthetic',
    env: 'Development',
    spend: 6.0,
    budgetLimit: 100,
    tokens: '0.9M',
    requests: 70,
    avgLatency: '620ms',
    primaryModel: 'DeepSeek-V3',
    failoverModel: 'GPT-4o-mini',
    paused: true,
    lastActive: '3d ago',
  },
];

const COL = 'projects';
const docId = (userId: string, id: string) =>
  id.startsWith(userId) ? id : `${userId}_${id}`;

/** Seed demo projects once and return them */
async function seedProjects(userId: string): Promise<UserProject[]> {
  const now = new Date().toISOString();
  const seeded: UserProject[] = [];
  for (let i = 0; i < DEMO_PROJECTS.length; i++) {
    const id = `proj_${100 + i}`;
    const p: UserProject = { ...DEMO_PROJECTS[i], id, user_id: userId, created_at: now, updated_at: now };
    try {
      await setDoc(doc(db, COL, docId(userId, id)), p, { merge: true });
    } catch { /* graceful */ }
    seeded.push(p);
  }
  return seeded;
}

/** Real-time listener for user projects */
export function subscribeToUserProjects(
  userId: string,
  onUpdate: (projects: UserProject[]) => void
): () => void {
  const q = query(collection(db, COL), where('user_id', '==', userId));
  return onSnapshot(q, async (snap) => {
    if (snap.empty) {
      onUpdate(await seedProjects(userId));
    } else {
      onUpdate(snap.docs.map((d) => d.data() as UserProject));
    }
  }, async (err) => {
    console.warn('Projects snapshot error:', err);
    onUpdate(await seedProjects(userId).catch(() =>
      DEMO_PROJECTS.map((p, i) => ({
        ...p,
        id: `proj_${100 + i}`,
        user_id: userId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }))
    ));
  });
}

/** One-time fetch */
export async function fetchUserProjects(userId: string): Promise<UserProject[]> {
  try {
    const snap = await getDocs(query(collection(db, COL), where('user_id', '==', userId)));
    if (snap.empty) return seedProjects(userId);
    return snap.docs.map((d) => d.data() as UserProject);
  } catch {
    return DEMO_PROJECTS.map((p, i) => ({
      ...p,
      id: `proj_${100 + i}`,
      user_id: userId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }));
  }
}

/** Create new project */
export async function createProject(
  userId: string,
  project: Omit<UserProject, 'id' | 'user_id' | 'created_at' | 'updated_at'>
): Promise<UserProject> {
  const id = `proj_${Math.floor(1000 + Math.random() * 9000)}`;
  const now = new Date().toISOString();
  const p: UserProject = { ...project, id, user_id: userId, created_at: now, updated_at: now };
  await setDoc(doc(db, COL, docId(userId, id)), p);
  return p;
}

/** Toggle paused state */
export async function toggleProjectPause(userId: string, projectId: string, paused: boolean): Promise<void> {
  await updateDoc(doc(db, COL, docId(userId, projectId)), {
    paused,
    updated_at: new Date().toISOString(),
  });
}

/** Delete a project */
export async function deleteProject(userId: string, projectId: string): Promise<void> {
  await deleteDoc(doc(db, COL, docId(userId, projectId)));
}
