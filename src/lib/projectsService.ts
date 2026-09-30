import {
  collection,
  doc,
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

const COL = 'projects';
const docId = (userId: string, id: string) =>
  id.startsWith(userId) ? id : `${userId}_${id}`;

/** Seed a single real starter project for a fresh user */
async function seedInitialStarterProject(userId: string): Promise<UserProject[]> {
  const now = new Date().toISOString();
  const id = `proj_${Date.now()}`;
  const initialProject: UserProject = {
    id,
    user_id: userId,
    name: 'Production Gateway',
    slug: 'production-gateway',
    endpoint: `https://gateway.ostraops.com/v1/projects/${id}`,
    env: 'Production',
    spend: 0,
    budgetLimit: 100,
    tokens: '0',
    requests: 0,
    avgLatency: '<5ms',
    primaryModel: 'GPT-4o',
    failoverModel: 'Claude 3.7 Sonnet',
    paused: false,
    lastActive: 'Just now',
    created_at: now,
    updated_at: now,
  };

  try {
    await setDoc(doc(db, COL, docId(userId, id)), initialProject, { merge: true });
  } catch {}

  try {
    localStorage.setItem(`ostraops_projects_${userId}`, JSON.stringify([initialProject]));
  } catch {}

  return [initialProject];
}

/** Subscribe in real-time to the current user's projects */
export function subscribeToUserProjects(
  userId: string,
  onUpdate: (projects: UserProject[]) => void
): () => void {
  const q = query(collection(db, COL), where('user_id', '==', userId));

  return onSnapshot(
    q,
    async (snap) => {
      if (snap.empty) {
        // Check local cache
        const cached = localStorage.getItem(`ostraops_projects_${userId}`);
        if (cached) {
          try {
            onUpdate(JSON.parse(cached));
            return;
          } catch {}
        }
        const created = await seedInitialStarterProject(userId);
        onUpdate(created);
        return;
      }

      const list: UserProject[] = [];
      snap.forEach((d) => {
        list.push(d.data() as UserProject);
      });
      list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      try {
        localStorage.setItem(`ostraops_projects_${userId}`, JSON.stringify(list));
      } catch {}
      onUpdate(list);
    },
    async (err) => {
      console.warn('Projects listener note (using local cache):', err);
      const cached = localStorage.getItem(`ostraops_projects_${userId}`);
      if (cached) {
        try {
          onUpdate(JSON.parse(cached));
          return;
        } catch {}
      }
      const starter = await seedInitialStarterProject(userId);
      onUpdate(starter);
    }
  );
}

/** Create a new project endpoint */
export async function createProject(
  userId: string,
  data: {
    name: string;
    env: 'Production' | 'Staging' | 'Development';
    primaryModel: string;
    failoverModel: string;
    budgetLimit: number;
  }
): Promise<UserProject> {
  const id = `proj_${Date.now()}`;
  const slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  const now = new Date().toISOString();

  const project: UserProject = {
    id,
    user_id: userId,
    name: data.name,
    slug,
    endpoint: `https://gateway.ostraops.com/v1/projects/${slug}`,
    env: data.env,
    spend: 0,
    budgetLimit: data.budgetLimit,
    tokens: '0',
    requests: 0,
    avgLatency: '<5ms',
    primaryModel: data.primaryModel,
    failoverModel: data.failoverModel,
    paused: false,
    lastActive: 'Just now',
    created_at: now,
    updated_at: now,
  };

  try {
    await setDoc(doc(db, COL, docId(userId, id)), project);
  } catch {}

  try {
    const raw = localStorage.getItem(`ostraops_projects_${userId}`);
    const list = raw ? JSON.parse(raw) : [];
    list.unshift(project);
    localStorage.setItem(`ostraops_projects_${userId}`, JSON.stringify(list));
  } catch {}

  return project;
}

/** Toggle pause / active state */
export async function toggleProjectPause(userId: string, projectId: string, currentPaused: boolean): Promise<void> {
  try {
    await updateDoc(doc(db, COL, docId(userId, projectId)), {
      paused: !currentPaused,
      updated_at: new Date().toISOString(),
    });
  } catch {}

  try {
    const raw = localStorage.getItem(`ostraops_projects_${userId}`);
    if (raw) {
      const list = JSON.parse(raw) as UserProject[];
      const updated = list.map((p) => (p.id === projectId ? { ...p, paused: !currentPaused } : p));
      localStorage.setItem(`ostraops_projects_${userId}`, JSON.stringify(updated));
    }
  } catch {}
}

/** Delete a project */
export async function deleteProject(userId: string, projectId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, COL, docId(userId, projectId)));
  } catch {}

  try {
    const raw = localStorage.getItem(`ostraops_projects_${userId}`);
    if (raw) {
      const list = JSON.parse(raw) as UserProject[];
      const filtered = list.filter((p) => p.id !== projectId);
      localStorage.setItem(`ostraops_projects_${userId}`, JSON.stringify(filtered));
    }
  } catch {}
}
