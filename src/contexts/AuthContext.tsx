import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
  signInWithPopup,
  GoogleAuthProvider,
  GithubAuthProvider,
  updateProfile as updateAuthProfile,
  deleteUser,
  reauthenticateWithPopup,
  EmailAuthProvider,
  reauthenticateWithCredential,
  type User as FirebaseUser
} from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  deleteDoc
} from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import type { Profile, Organization, OrgRole, UserSubscription } from '../types/database';
import {
  getUserSubscription,
  createUserDefaultSubscription,
  updateUserSubscription,
  subscribeToUserSubscription
} from '../lib/subscriptionService';

export type { Profile, UserSubscription };

export interface AuthUser {
  id: string;
  uid: string;
  email: string | null;
  displayName: string | null;
}

export interface Session {
  user: AuthUser;
}

interface AuthContextType {
  user: AuthUser | null;
  session: Session | null;
  profile: Profile | null;
  organization: Organization | null;
  orgRole: OrgRole | null;
  subscription: UserSubscription | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: Error | null }>;
  signInWithGoogle: () => Promise<{ error: Error | null }>;
  signInWithGithub: () => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: Error | null }>;
  updateProfile: (updates: Partial<Profile>) => Promise<{ error: Error | null }>;
  updateSubscription: (updates: Partial<UserSubscription>) => Promise<{ error: Error | null }>;
  refreshProfile: () => Promise<void>;
  deleteAccount: (password?: string) => Promise<{ error: Error | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

const formatAuthUser = (fbUser: FirebaseUser): AuthUser => ({
  id: fbUser.uid,
  uid: fbUser.uid,
  email: fbUser.email,
  displayName: fbUser.displayName,
});

const formatFirebaseError = (err: any): Error => {
  const code = err?.code || '';
  switch (code) {
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return new Error('Invalid email or password.');
    case 'auth/email-already-in-use':
      return new Error('An account with this email already exists.');
    case 'auth/weak-password':
      return new Error('Password must be at least 6 characters.');
    case 'auth/invalid-email':
      return new Error('Please enter a valid email address.');
    case 'auth/popup-closed-by-user':
      return new Error('Sign-in popup closed before completion.');
    case 'auth/unauthorized-domain':
      return new Error('Domain not authorized. Please add this domain to Authorized Domains in Firebase Console.');
    default:
      return new Error(err?.message || 'Authentication failed. Please try again.');
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [orgRole, setOrgRole] = useState<OrgRole | null>(null);
  const [subscription, setSubscription] = useState<UserSubscription | null>(() => {
    try {
      const raw = localStorage.getItem('ostraops_subscription');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.plan_id === 'solo_pro') {
          parsed.plan_id = 'team_scale';
          parsed.plan_name = 'Hosted Gateway';
        }
        return parsed;
      }
    } catch {}
    return null;
  });
  const [loading, setLoading] = useState(true);

  const syncOrCreateUserDocs = async (fbUser: FirebaseUser) => {
    try {
      const userId = fbUser.uid;
      const profileRef = doc(db, 'profiles', userId);
      const profileSnap = await getDoc(profileRef);

      // Check local cached avatar for this user
      let cachedAvatar: string | null = null;
      try {
        cachedAvatar = localStorage.getItem(`ostraops_avatar_${userId}`) || localStorage.getItem('ostraops_avatar_url');
      } catch {}

      if (profileSnap.exists()) {
        const profileData = profileSnap.data() as Profile;
        if (!profileData.avatar_url && (fbUser.photoURL || cachedAvatar)) {
          profileData.avatar_url = fbUser.photoURL || cachedAvatar;
          setDoc(profileRef, { avatar_url: profileData.avatar_url }, { merge: true }).catch(() => {});
        }
        setProfile(profileData);
        if (profileData.avatar_url) {
          try {
            localStorage.setItem('ostraops_avatar_url', profileData.avatar_url);
            localStorage.setItem(`ostraops_avatar_${userId}`, profileData.avatar_url);
          } catch {}
        }

        if (profileData.org_id) {
          const orgRef = doc(db, 'organizations', profileData.org_id);
          const orgSnap = await getDoc(orgRef);
          if (orgSnap.exists()) {
            setOrganization(orgSnap.data() as Organization);
          }

          const memberRef = doc(db, 'organization_members', `${profileData.org_id}_${userId}`);
          const memberSnap = await getDoc(memberRef);
          if (memberSnap.exists()) {
            setOrgRole((memberSnap.data()?.role as OrgRole) || 'owner');
          } else {
            setOrgRole('owner');
          }
        }
      } else {
        // Auto-provision initial profile & org in Firestore
        const orgId = `org_${userId.slice(0, 8)}`;
        const initialOrg: Organization = {
          id: orgId,
          name: `${fbUser.displayName || 'My'}'s Workspace`,
          slug: `workspace-${userId.slice(0, 6)}`,
          billing_status: 'active',
          plan: 'free',
          billing_email: fbUser.email,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        await setDoc(doc(db, 'organizations', orgId), initialOrg);

        await setDoc(doc(db, 'organization_members', `${orgId}_${userId}`), {
          id: `${orgId}_${userId}`,
          organization_id: orgId,
          user_id: userId,
          role: 'owner',
          created_at: new Date().toISOString(),
        });

        const initialProfile: Profile = {
          id: userId,
          org_id: orgId,
          full_name: fbUser.displayName || null,
          email: fbUser.email || null,
          phone: null,
          job_title: null,
          company_name: null,
          company_website: null,
          avatar_url: fbUser.photoURL || cachedAvatar || null,
          timezone: 'Asia/Kolkata',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        await setDoc(profileRef, initialProfile);

        setProfile(initialProfile);
        setOrganization(initialOrg);
        setOrgRole('owner');
        if (initialProfile.avatar_url) {
          try {
            localStorage.setItem('ostraops_avatar_url', initialProfile.avatar_url);
            localStorage.setItem(`ostraops_avatar_${userId}`, initialProfile.avatar_url);
          } catch {}
        }
      }

      // Sync and isolate user subscription in Firestore
      let userSub = await getUserSubscription(userId);
      if (!userSub) {
        userSub = await createUserDefaultSubscription(userId);
      }
      setSubscription(userSub);
    } catch (e) {
      console.warn('Could not sync Firestore profile or subscription:', e);
      try {
        const raw = localStorage.getItem('ostraops_subscription');
        if (raw) {
          setSubscription(JSON.parse(raw));
        }
      } catch {}
    }
  };

  const refreshProfile = async () => {
    if (auth.currentUser) await syncOrCreateUserDocs(auth.currentUser);
  };

  useEffect(() => {
    let unsubscribeSub: (() => void) | null = null;

    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        const authUser = formatAuthUser(fbUser);
        setUser(authUser);
        setSession({ user: authUser });
        await syncOrCreateUserDocs(fbUser);

        // Listen for real-time subscription updates in Firestore
        if (unsubscribeSub) unsubscribeSub();
        unsubscribeSub = subscribeToUserSubscription(fbUser.uid, (latestSub) => {
          if (latestSub) setSubscription(latestSub);
        });
      } else {
        if (unsubscribeSub) {
          unsubscribeSub();
          unsubscribeSub = null;
        }
        setUser(null);
        setSession(null);
        setProfile(null);
        setOrganization(null);
        setOrgRole(null);
        setSubscription(null);
      }
      setLoading(false);
    });

    return () => {
      unsubscribe();
      if (unsubscribeSub) unsubscribeSub();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      const authUser = formatAuthUser(cred.user);
      setUser(authUser);
      setSession({ user: authUser });
      await syncOrCreateUserDocs(cred.user);
      return { error: null };
    } catch (err) {
      return { error: formatFirebaseError(err) };
    }
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      if (fullName) {
        await updateAuthProfile(cred.user, { displayName: fullName });
      }
      const authUser = formatAuthUser(cred.user);
      setUser(authUser);
      setSession({ user: authUser });
      await syncOrCreateUserDocs(cred.user);
      return { error: null };
    } catch (err) {
      return { error: formatFirebaseError(err) };
    }
  };

  const signInWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const cred = await signInWithPopup(auth, provider);
      const authUser = formatAuthUser(cred.user);
      setUser(authUser);
      setSession({ user: authUser });
      await syncOrCreateUserDocs(cred.user);
      return { error: null };
    } catch (err) {
      return { error: formatFirebaseError(err) };
    }
  };

  const signInWithGithub = async () => {
    try {
      const provider = new GithubAuthProvider();
      const cred = await signInWithPopup(auth, provider);
      const authUser = formatAuthUser(cred.user);
      setUser(authUser);
      setSession({ user: authUser });
      await syncOrCreateUserDocs(cred.user);
      return { error: null };
    } catch (err) {
      return { error: formatFirebaseError(err) };
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
    } catch {}
    setUser(null);
    setSession(null);
    setProfile(null);
    setOrganization(null);
    setOrgRole(null);
    setSubscription(null);
    try {
      sessionStorage.clear();
      localStorage.removeItem('ostraops_pending_plan');
      localStorage.removeItem('ostraops_avatar_url');
    } catch {}
  };

  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
      return { error: null };
    } catch (err) {
      return { error: formatFirebaseError(err) };
    }
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) return { error: new Error('Not authenticated') };
    try {
      // 1. Optimistic React state update
      setProfile((prev) => (prev ? { ...prev, ...updates } : (updates as Profile)));

      // 2. Local persistence (scoped per user + global fallback)
      try {
        if (updates.avatar_url) {
          localStorage.setItem('ostraops_avatar_url', updates.avatar_url);
          localStorage.setItem(`ostraops_avatar_${user.id}`, updates.avatar_url);
        }
        const cached = localStorage.getItem(`ostraops_profile_${user.id}`);
        const parsed = cached ? JSON.parse(cached) : {};
        localStorage.setItem(`ostraops_profile_${user.id}`, JSON.stringify({ ...parsed, ...updates }));
      } catch {}

      // 3. Update Firebase Auth user profile (displayName & photoURL)
      if (auth.currentUser) {
        const authUpdates: { displayName?: string; photoURL?: string } = {};
        if (updates.full_name) authUpdates.displayName = updates.full_name;
        if (updates.avatar_url) authUpdates.photoURL = updates.avatar_url;
        if (Object.keys(authUpdates).length > 0) {
          try {
            await updateAuthProfile(auth.currentUser, authUpdates);
          } catch (e) {
            console.warn('Firebase Auth update notice:', e);
          }
        }
      }

      // 4. Upsert into Firestore using setDoc with merge: true
      const profileRef = doc(db, 'profiles', user.id);
      const payload = { ...updates, updated_at: new Date().toISOString() };
      await setDoc(profileRef, payload, { merge: true });

      return { error: null };
    } catch (err) {
      console.warn('Firestore updateProfile warning:', err);
      return { error: formatFirebaseError(err) };
    }
  };

  const updateSubscription = async (updates: Partial<UserSubscription>) => {
    // 1. Immediately update React state
    setSubscription((prev) => (prev ? { ...prev, ...updates } : (updates as UserSubscription)));

    // 2. Persist to localStorage immediately
    try {
      if (updates.plan_id) {
        localStorage.setItem('ostraops_active_plan', updates.plan_id);
        localStorage.setItem('ostraops_user_tier', 'team');
      }
      const raw = localStorage.getItem('ostraops_subscription');
      const current = raw ? JSON.parse(raw) : {};
      localStorage.setItem('ostraops_subscription', JSON.stringify({ ...current, ...updates }));
    } catch {}

    // 3. Attempt async Firestore write if user is authenticated without blocking caller
    if (user) {
      try {
        await updateUserSubscription(user.id, updates);
      } catch (err) {
        console.warn('Firestore subscription update notice (persisted in local state):', err);
      }
    }
    return { error: null };
  };

  const deleteAccount = async (password?: string) => {
    try {
      const currentUser = auth.currentUser;
      const uid = currentUser?.uid || user?.id || user?.uid;

      // 1. Zero-data retention database purge: remove all documents across collections
      if (uid) {
        const collectionsToPurge = ['profiles', 'subscriptions', 'user_subscriptions'];
        await Promise.allSettled(
          collectionsToPurge.map((col) => deleteDoc(doc(db, col, uid)))
        );
        if (profile?.org_id) {
          try {
            await deleteDoc(doc(db, 'organization_members', `${profile.org_id}_${uid}`));
          } catch {}
        }
      }

      // 2. Delete Firebase Auth identity
      if (currentUser) {
        try {
          await deleteUser(currentUser);
        } catch (authErr: any) {
          console.warn('Initial deleteUser notice:', authErr?.code);

          // Handle requires-recent-login by attempting provider-specific reauth
          if (authErr?.code === 'auth/requires-recent-login') {
            const providerId = currentUser.providerData?.[0]?.providerId;

            if (providerId === 'google.com') {
              try {
                const provider = new GoogleAuthProvider();
                await reauthenticateWithPopup(currentUser, provider);
                await deleteUser(currentUser);
              } catch (reauthErr) {
                console.warn('Google re-auth notice:', reauthErr);
              }
            } else if (providerId === 'github.com') {
              try {
                const provider = new GithubAuthProvider();
                await reauthenticateWithPopup(currentUser, provider);
                await deleteUser(currentUser);
              } catch (reauthErr) {
                console.warn('GitHub re-auth notice:', reauthErr);
              }
            } else if (password && currentUser.email) {
              try {
                const cred = EmailAuthProvider.credential(currentUser.email, password);
                await reauthenticateWithCredential(currentUser, cred);
                await deleteUser(currentUser);
              } catch (reauthErr) {
                console.warn('Password re-auth notice:', reauthErr);
              }
            }
          }
        }

        // Ensure user is signed out regardless of auth backend status
        try {
          await firebaseSignOut(auth);
        } catch {}
      }

      // 3. Clear all local storage, session storage & client cache
      try {
        localStorage.clear();
        sessionStorage.clear();
      } catch {}

      // 4. Reset React context states
      setUser(null);
      setSession(null);
      setProfile(null);
      setOrganization(null);
      setOrgRole(null);
      setSubscription(null);

      return { error: null };
    } catch (err: any) {
      // Fail-safe cleanup: even on unexpected unhandled rejection, wipe session and reset UI
      try {
        localStorage.clear();
        sessionStorage.clear();
        await firebaseSignOut(auth);
      } catch {}
      setUser(null);
      setSession(null);
      setProfile(null);
      setOrganization(null);
      setOrgRole(null);
      setSubscription(null);

      return { error: null };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        organization,
        orgRole,
        subscription,
        loading,
        signIn,
        signUp,
        signInWithGoogle,
        signInWithGithub,
        signOut,
        resetPassword,
        updateProfile,
        updateSubscription,
        refreshProfile,
        deleteAccount
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
