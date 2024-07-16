'use client';

import {createContext, useContext, useEffect, useState} from "react";
import {GoogleAuthProvider, onAuthStateChanged, signInWithPopup, signOut, User,} from "firebase/auth";
import {auth} from "../firebase";

interface UserAuth {
    user: User|null,
    googleSignIn: () => Promise<void>;
    logOut: () => Promise<void>;
}
export const AuthContext = createContext<UserAuth>({user: null, googleSignIn: () => new Promise(resolve => resolve()), logOut: () => new Promise(resolve => resolve())});

interface AuthContextProviderProps{
    children: React.ReactNode
}
export const AuthContextProvider = ({children}) => {
    const [user, setUser] = useState<User | null>(null);

    const googleSignIn = () => {
        const provider = new GoogleAuthProvider();
        signInWithPopup(auth, provider);
    };

    const logOut = () => {
        signOut(auth);
    };

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser: User | null) => {
            setUser(currentUser);
            console.log('user', user);
        });
        return () => unsubscribe();
    }, [user]);

    return (
        <AuthContext.Provider value={{user, googleSignIn, logOut}}>
            {children}
        </AuthContext.Provider>
    );
};

export const UserAuth = () => {
    return useContext(AuthContext);
};