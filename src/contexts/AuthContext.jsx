import { createContext, useContext, useEffect, useState } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../firebase';

const AuthContext = createContext(null);

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  async function signup(email, password, name) {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(result.user, { displayName: name });
    // Create Firestore profile
    const defaultProfile = {
      uid: result.user.uid,
      name,
      email,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`,
      bio: '',
      skillsOffered: [],
      skillsWanted: [],
      level: 'Beginner',
      rating: 0,
      ratingCount: 0,
      location: '',
      availability: 'Weekends',
      joinedAt: serverTimestamp(),
      matchesCount: 0,
      sessionsCompleted: 0,
    };
    await setDoc(doc(db, 'users', result.user.uid), defaultProfile);
    setUserProfile(defaultProfile);
    return result;
  }

  async function login(email, password) {
    return signInWithEmailAndPassword(auth, email, password);
  }

  async function logout() {
    setUserProfile(null);
    return signOut(auth);
  }

  async function refreshProfile() {
    if (!currentUser) return;
    try {
      const snap = await getDoc(doc(db, 'users', currentUser.uid));
      if (snap.exists()) setUserProfile(snap.data());
    } catch (err) {
      console.error('Failed to refresh profile:', err);
    }
  }

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        try {
          const snap = await getDoc(doc(db, 'users', user.uid));
          if (snap.exists()) setUserProfile(snap.data());
        } catch (err) {
          console.error('Failed to load user profile:', err);
        }
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  const value = {
    currentUser,
    userProfile,
    signup,
    login,
    logout,
    refreshProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
