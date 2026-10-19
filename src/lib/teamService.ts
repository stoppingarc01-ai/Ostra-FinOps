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

export interface TeamMember {
  id: string;
  user_id: string; // Foreign key / workspace owner ID
  userId: string; // Developer / client username e.g. usr_alex_24
  name: string;
  email: string;
  password?: string;
  team: string;
  role: 'Owner' | 'Admin' | 'Developer' | 'Viewer' | 'Billing' | 'Client';
  apiKeysCount: number;
  requests30d: string;
  spend30d: string;
  lastActive: string;
  avatarColor: string;
  monthlyLimit: number;
  currentSpend: number;
  created_at: string;
  updated_at: string;
}

export interface TeamGroup {
  id: string;
  user_id: string;
  name: string;
  isDefault?: boolean;
  description: string;
  membersCount: number;
  projectsCount: number;
  apiKeysCount: number;
  spend30d: string;
  budgetUsedPercent: number;
  color: string;
  created_at: string;
  updated_at: string;
}

const TEAMS_COL = 'teams';
const MEMBERS_COL = 'team_members';

const docId = (userId: string, id: string) =>
  id.startsWith(userId) ? id : `${userId}_${id}`;

/** Default starter teams seeded for new workspaces */
export const DEFAULT_STARTER_TEAMS: Omit<TeamGroup, 'id' | 'user_id' | 'created_at' | 'updated_at'>[] = [
  {
    name: 'Platform Engineering',
    isDefault: true,
    description: 'Core workspace engineering team managing AI models and proxy keys.',
    membersCount: 1,
    projectsCount: 1,
    apiKeysCount: 1,
    spend30d: '$0.00',
    budgetUsedPercent: 0,
    color: '#C59E5F',
  },
  {
    name: 'Product AI Team',
    isDefault: false,
    description: 'Product and feature squads integrating OpenAI, Anthropic, and Gemini models.',
    membersCount: 0,
    projectsCount: 1,
    apiKeysCount: 0,
    spend30d: '$0.00',
    budgetUsedPercent: 0,
    color: '#38BDF8',
  },
  {
    name: 'Data Science & ML',
    isDefault: false,
    description: 'Evals, fine-tuning datasets, synthetic benchmarks, and reasoning pipelines.',
    membersCount: 0,
    projectsCount: 1,
    apiKeysCount: 0,
    spend30d: '$0.00',
    budgetUsedPercent: 0,
    color: '#A855F7',
  },
  {
    name: 'Client Solutions',
    isDefault: false,
    description: 'Client-facing deployments, scoped client member credentials, and dedicated budgets.',
    membersCount: 0,
    projectsCount: 0,
    apiKeysCount: 0,
    spend30d: '$0.00',
    budgetUsedPercent: 0,
    color: '#10B981',
  },
];

/** Seed default teams for a newly registered workspace */
export async function seedInitialTeams(userId: string): Promise<TeamGroup[]> {
  const now = new Date().toISOString();
  const createdTeams: TeamGroup[] = [];

  for (let i = 0; i < DEFAULT_STARTER_TEAMS.length; i++) {
    const raw = DEFAULT_STARTER_TEAMS[i];
    const teamId = raw.isDefault ? 'platform' : `team_${Date.now()}_${i}`;
    const fullTeam: TeamGroup = {
      ...raw,
      id: teamId,
      user_id: userId,
      created_at: now,
      updated_at: now,
    };

    try {
      await setDoc(doc(db, TEAMS_COL, docId(userId, teamId)), fullTeam, { merge: true });
    } catch (e) {
      console.warn('Failed to save starter team to Firestore:', e);
    }
    createdTeams.push(fullTeam);
  }

  try {
    localStorage.setItem(`ostraops_teams_${userId}`, JSON.stringify(createdTeams));
  } catch {}

  return createdTeams;
}

/** Seed workspace owner member */
export async function seedInitialOwnerMember(
  userId: string,
  ownerName?: string,
  ownerEmail?: string
): Promise<TeamMember[]> {
  const now = new Date().toISOString();
  const cleanName = ownerName || 'Workspace Owner';
  const cleanEmail = ownerEmail || 'owner@workspace.internal';
  const prefix = cleanName.toLowerCase().replace(/[^a-z0-9]/g, '_').slice(0, 10);

  const initialOwner: TeamMember = {
    id: `mem_owner_${Date.now()}`,
    user_id: userId,
    userId: `usr_${prefix || 'owner'}`,
    name: cleanName,
    email: cleanEmail,
    password: 'Ost$MasterOwner2026!',
    team: 'Platform Engineering',
    role: 'Owner',
    apiKeysCount: 1,
    requests30d: '0',
    spend30d: '$0.00',
    lastActive: 'Active Now',
    avatarColor: '#C59E5F',
    monthlyLimit: 1000,
    currentSpend: 0,
    created_at: now,
    updated_at: now,
  };

  try {
    await setDoc(doc(db, MEMBERS_COL, docId(userId, initialOwner.id)), initialOwner, { merge: true });
  } catch (e) {
    console.warn('Failed to save starter owner member to Firestore:', e);
  }

  try {
    localStorage.setItem(`ostraops_team_members_${userId}`, JSON.stringify([initialOwner]));
  } catch {}

  return [initialOwner];
}

/** Subscribe in real-time to workspace teams */
export function subscribeToUserTeams(
  userId: string,
  onUpdate: (teams: TeamGroup[]) => void
): () => void {
  if (!userId) {
    onUpdate([]);
    return () => {};
  }

  const q = query(collection(db, TEAMS_COL), where('user_id', '==', userId));

  return onSnapshot(
    q,
    async (snap) => {
      if (snap.empty) {
        // Check local cache first
        const cached = localStorage.getItem(`ostraops_teams_${userId}`);
        if (cached) {
          try {
            const parsed = JSON.parse(cached);
            if (Array.isArray(parsed) && parsed.length > 0) {
              onUpdate(parsed);
              return;
            }
          } catch {}
        }
        const seeded = await seedInitialTeams(userId);
        onUpdate(seeded);
        return;
      }

      const list: TeamGroup[] = [];
      snap.forEach((d) => {
        list.push(d.data() as TeamGroup);
      });

      // Default team first, then alphabetically
      list.sort((a, b) => {
        if (a.isDefault && !b.isDefault) return -1;
        if (!a.isDefault && b.isDefault) return 1;
        return a.name.localeCompare(b.name);
      });

      try {
        localStorage.setItem(`ostraops_teams_${userId}`, JSON.stringify(list));
      } catch {}

      onUpdate(list);
    },
    (err) => {
      console.warn('Firestore teams subscription error, falling back to local cache:', err);
      const cached = localStorage.getItem(`ostraops_teams_${userId}`);
      if (cached) {
        try {
          onUpdate(JSON.parse(cached));
        } catch {}
      }
    }
  );
}

/** Subscribe in real-time to team members and developers */
export function subscribeToUserTeamMembers(
  userId: string,
  onUpdate: (members: TeamMember[]) => void,
  ownerInfo?: { name?: string; email?: string }
): () => void {
  if (!userId) {
    onUpdate([]);
    return () => {};
  }

  const q = query(collection(db, MEMBERS_COL), where('user_id', '==', userId));

  return onSnapshot(
    q,
    async (snap) => {
      if (snap.empty) {
        const cached = localStorage.getItem(`ostraops_team_members_${userId}`);
        if (cached) {
          try {
            const parsed = JSON.parse(cached);
            if (Array.isArray(parsed) && parsed.length > 0) {
              onUpdate(parsed);
              return;
            }
          } catch {}
        }
        const seeded = await seedInitialOwnerMember(userId, ownerInfo?.name, ownerInfo?.email);
        onUpdate(seeded);
        return;
      }

      const list: TeamMember[] = [];
      snap.forEach((d) => {
        list.push(d.data() as TeamMember);
      });

      // Sort: Owner first, then newest first
      list.sort((a, b) => {
        if (a.role === 'Owner') return -1;
        if (b.role === 'Owner') return 1;
        return (new Date(b.created_at).getTime() || 0) - (new Date(a.created_at).getTime() || 0);
      });

      try {
        localStorage.setItem(`ostraops_team_members_${userId}`, JSON.stringify(list));
      } catch {}

      onUpdate(list);
    },
    (err) => {
      console.warn('Firestore team members subscription error, falling back to local cache:', err);
      const cached = localStorage.getItem(`ostraops_team_members_${userId}`);
      if (cached) {
        try {
          onUpdate(JSON.parse(cached));
        } catch {}
      }
    }
  );
}

/** Create a new Team in Firestore */
export async function createTeam(
  userId: string,
  teamData: Omit<TeamGroup, 'id' | 'user_id' | 'created_at' | 'updated_at'>
): Promise<TeamGroup> {
  const now = new Date().toISOString();
  const id = `team_${Date.now()}`;
  const team: TeamGroup = {
    ...teamData,
    id,
    user_id: userId,
    created_at: now,
    updated_at: now,
  };

  try {
    await setDoc(doc(db, TEAMS_COL, docId(userId, id)), team, { merge: true });
  } catch (e) {
    console.warn('Firestore createTeam error, saving locally:', e);
  }

  // Update local cache
  try {
    const raw = localStorage.getItem(`ostraops_teams_${userId}`);
    const current: TeamGroup[] = raw ? JSON.parse(raw) : [];
    localStorage.setItem(`ostraops_teams_${userId}`, JSON.stringify([...current, team]));
  } catch {}

  return team;
}

/** Update Team Group in Firestore */
export async function updateTeam(
  userId: string,
  teamId: string,
  updates: Partial<TeamGroup>
): Promise<void> {
  const fullDocId = docId(userId, teamId);
  const now = new Date().toISOString();

  try {
    await updateDoc(doc(db, TEAMS_COL, fullDocId), {
      ...updates,
      updated_at: now,
    });
  } catch (e) {
    console.warn('Firestore updateTeam error:', e);
  }

  try {
    const raw = localStorage.getItem(`ostraops_teams_${userId}`);
    if (raw) {
      const current: TeamGroup[] = JSON.parse(raw);
      const updated = current.map((t) =>
        t.id === teamId ? { ...t, ...updates, updated_at: now } : t
      );
      localStorage.setItem(`ostraops_teams_${userId}`, JSON.stringify(updated));
    }
  } catch {}
}

/** Delete Team from Firestore */
export async function deleteTeam(userId: string, teamId: string): Promise<void> {
  const fullDocId = docId(userId, teamId);

  try {
    await deleteDoc(doc(db, TEAMS_COL, fullDocId));
  } catch (e) {
    console.warn('Firestore deleteTeam error:', e);
  }

  try {
    const raw = localStorage.getItem(`ostraops_teams_${userId}`);
    if (raw) {
      const current: TeamGroup[] = JSON.parse(raw);
      localStorage.setItem(
        `ostraops_teams_${userId}`,
        JSON.stringify(current.filter((t) => t.id !== teamId))
      );
    }
  } catch {}
}

/** Create a new Team Member or Developer in Firestore */
export async function createTeamMember(
  userId: string,
  memberData: Omit<TeamMember, 'id' | 'user_id' | 'created_at' | 'updated_at'>
): Promise<TeamMember> {
  const now = new Date().toISOString();
  const id = `mem_${Date.now()}`;
  const member: TeamMember = {
    ...memberData,
    id,
    user_id: userId,
    created_at: now,
    updated_at: now,
  };

  try {
    await setDoc(doc(db, MEMBERS_COL, docId(userId, id)), member, { merge: true });
  } catch (e) {
    console.warn('Firestore createTeamMember error, saving locally:', e);
  }

  // Update local cache
  try {
    const raw = localStorage.getItem(`ostraops_team_members_${userId}`);
    const current: TeamMember[] = raw ? JSON.parse(raw) : [];
    localStorage.setItem(`ostraops_team_members_${userId}`, JSON.stringify([member, ...current]));
  } catch {}

  // Automatically increment member count on the assigned team
  if (member.team) {
    try {
      const rawTeams = localStorage.getItem(`ostraops_teams_${userId}`);
      if (rawTeams) {
        const teamsList: TeamGroup[] = JSON.parse(rawTeams);
        const match = teamsList.find(
          (t) => t.name.toLowerCase() === member.team.toLowerCase()
        );
        if (match) {
          await updateTeam(userId, match.id, {
            membersCount: (match.membersCount || 0) + 1,
          });
        }
      }
    } catch {}
  }

  return member;
}

/** Update Team Member credentials, spend limits, or role in Firestore */
export async function updateTeamMember(
  userId: string,
  memberId: string,
  updates: Partial<TeamMember>
): Promise<void> {
  const fullDocId = docId(userId, memberId);
  const now = new Date().toISOString();

  try {
    await updateDoc(doc(db, MEMBERS_COL, fullDocId), {
      ...updates,
      updated_at: now,
    });
  } catch (e) {
    console.warn('Firestore updateTeamMember error:', e);
  }

  try {
    const raw = localStorage.getItem(`ostraops_team_members_${userId}`);
    if (raw) {
      const current: TeamMember[] = JSON.parse(raw);
      const updated = current.map((m) =>
        m.id === memberId ? { ...m, ...updates, updated_at: now } : m
      );
      localStorage.setItem(`ostraops_team_members_${userId}`, JSON.stringify(updated));
    }
  } catch {}
}

/** Delete / Revoke access for a team member */
export async function deleteTeamMember(
  userId: string,
  memberId: string,
  teamName?: string
): Promise<void> {
  const fullDocId = docId(userId, memberId);

  try {
    await deleteDoc(doc(db, MEMBERS_COL, fullDocId));
  } catch (e) {
    console.warn('Firestore deleteTeamMember error:', e);
  }

  try {
    const raw = localStorage.getItem(`ostraops_team_members_${userId}`);
    if (raw) {
      const current: TeamMember[] = JSON.parse(raw);
      localStorage.setItem(
        `ostraops_team_members_${userId}`,
        JSON.stringify(current.filter((m) => m.id !== memberId))
      );
    }
  } catch {}

  // Decrement team member count if applicable
  if (teamName) {
    try {
      const rawTeams = localStorage.getItem(`ostraops_teams_${userId}`);
      if (rawTeams) {
        const teamsList: TeamGroup[] = JSON.parse(rawTeams);
        const match = teamsList.find(
          (t) => t.name.toLowerCase() === teamName.toLowerCase()
        );
        if (match && match.membersCount > 0) {
          await updateTeam(userId, match.id, {
            membersCount: Math.max(0, match.membersCount - 1),
          });
        }
      }
    } catch {}
  }
}
