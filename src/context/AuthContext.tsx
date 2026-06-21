import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut,
  sendPasswordResetEmail,
  User as FirebaseUser,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  setDoc, 
  onSnapshot, 
  serverTimestamp 
} from 'firebase/firestore';
import { auth, db } from '../firebase/config';
import { AppUser } from '../types';

interface AuthContextType {
  user: FirebaseUser | null;
  profile: AppUser | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<any>;
  register: (name: string, email: string, pass: string, phone: string) => Promise<any>;
  loginWithGoogle: () => Promise<any>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateProfileCoins: (amount: number) => Promise<void>;
  elevateToAdmin: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      
      if (!firebaseUser) {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  // Listen to profile updates when user is authenticated
  useEffect(() => {
    if (!user) return;

    const userDocRef = doc(db, 'users', user.uid);
    
    // Set up a real-time listener for the user's profile
    const unsubscribeSnapshot = onSnapshot(userDocRef, async (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        const userEmail = user.email || data.email || '';
        const isAdminEmail = userEmail === 'admin@gmail.com' || userEmail === 'vishu@gmail.com' || userEmail === 'shrivastavavishu890@gmail.com';
        const updatedRole = isAdminEmail ? 'admin' : (data.role || 'user');
        
        // If they are admin but role in db is not updated yet, auto update it
        if (isAdminEmail && data.role !== 'admin') {
          await setDoc(userDocRef, { role: 'admin' }, { merge: true });
        }

        setProfile({
          uid: docSnap.id,
          name: data.name || 'Anonymous',
          email: userEmail,
          phone: data.phone || '',
          coins: typeof data.coins === 'number' ? data.coins : 0,
          totalWins: typeof data.totalWins === 'number' ? data.totalWins : 0,
          totalGames: typeof data.totalGames === 'number' ? data.totalGames : 0,
          blocked: !!data.blocked,
          role: updatedRole as 'user' | 'admin',
          createdAt: data.createdAt,
        });
      } else {
        // Fallback or create if not present (for social logins or async issues)
        const userEmail = user.email || '';
        const isAdminEmail = userEmail === 'admin@gmail.com' || userEmail === 'vishu@gmail.com' || userEmail === 'shrivastavavishu890@gmail.com';
        const newProfile: Partial<AppUser> = {
          uid: user.uid,
          name: user.displayName || 'No Name',
          email: userEmail,
          phone: '',
          coins: 0, // Gift 0 starting coins as per specification
          totalWins: 0,
          totalGames: 0,
          blocked: false,
          role: isAdminEmail ? 'admin' : 'user',
          createdAt: serverTimestamp(),
        };
        await setDoc(userDocRef, newProfile, { merge: true });
      }
      setLoading(false);
    }, (error) => {
      console.error("Error listening to user profile:", error);
      setLoading(false);
    });

    return () => unsubscribeSnapshot();
  }, [user]);

  const login = async (email: string, pass: string) => {
    return signInWithEmailAndPassword(auth, email, pass);
  };

  const register = async (name: string, email: string, pass: string, phone: string) => {
    const cred = await createUserWithEmailAndPassword(auth, email, pass);
    const userDocRef = doc(db, 'users', cred.user.uid);
    const isAdminEmail = email === 'admin@gmail.com' || email === 'vishu@gmail.com' || email === 'shrivastavavishu890@gmail.com';
    const newProfile: AppUser = {
      uid: cred.user.uid,
      name,
      email,
      phone,
      coins: 0, // 0 starting coins
      totalWins: 0,
      totalGames: 0,
      blocked: false,
      role: isAdminEmail ? 'admin' : 'user',
      createdAt: serverTimestamp() as any, // casting for typescript
    };
    await setDoc(userDocRef, newProfile);
    return cred;
  };

  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    return signInWithPopup(auth, provider);
  };

  const logout = async () => {
    await signOut(auth);
  };

  const resetPassword = async (email: string) => {
    await sendPasswordResetEmail(auth, email);
  };

  const updateProfileCoins = async (amount: number) => {
    if (!user || !profile) return;
    const userDocRef = doc(db, 'users', user.uid);
    await setDoc(userDocRef, { coins: profile.coins + amount }, { merge: true });
  };

  const elevateToAdmin = async () => {
    if (!user) return;
    const userDocRef = doc(db, 'users', user.uid);
    await setDoc(userDocRef, { role: 'admin' }, { merge: true });
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      profile, 
      loading, 
      login, 
      register, 
      loginWithGoogle,
      logout, 
      resetPassword, 
      updateProfileCoins,
      elevateToAdmin
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
