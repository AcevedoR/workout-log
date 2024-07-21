'use client';

// import {Inter} from "next/font/google";
import "./globals.css";
import {AuthContextProvider} from "@/app/auth/auth-context";
import ConnexionWallPage from "@/app/connexion-wall-page";


export default function Page() {
    return (
        <AuthContextProvider>
            <ConnexionWallPage></ConnexionWallPage>
        </AuthContextProvider>
    );
}
