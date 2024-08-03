'use client';

// import {Inter} from "next/font/google";
import "./globals.css";
import {AuthContextProvider} from "./auth/auth-context";
import ConnexionWallPage from "./connexion-wall-page";


export default function Page() {
    return (
        <AuthContextProvider>
            <ConnexionWallPage></ConnexionWallPage>
        </AuthContextProvider>
    );
}
