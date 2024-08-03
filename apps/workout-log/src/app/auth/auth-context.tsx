'use client';

import {createContext, useContext, useEffect, useState} from "react";
import {GoogleAuthProvider, onAuthStateChanged, signInWithPopup, signOut, User,} from "firebase/auth";
import {getWorkoutLogAuth} from "../firebase";

interface UserAuth {
    user: User | null,
    googleSignIn: () => void;
    logOut: () => void;
}

export const AuthContext = createContext<UserAuth>({
    user: null,
    googleSignIn: () => {
    },
    logOut: () => {
    }
});

interface AuthContextProviderProps {
    children: React.ReactNode
}

export const AuthContextProvider = ({children}: Readonly<{ children: React.ReactNode }>) => {
    const [user, setUser] = useState<User | null>(null);

    const googleSignIn = () => {
        const provider = new GoogleAuthProvider();
        signInWithPopup(getWorkoutLogAuth(), provider);
    };

    const logOut = () => {
        signOut(getWorkoutLogAuth());
    };

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(getWorkoutLogAuth(), (currentUser: User | null) => {
            setUser(currentUser);
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