'use client';

import {Inter} from "next/font/google";
import "./globals.css";
import {AuthContextProvider} from "@/app/auth/auth-context";
import ConnexionWallPage from "@/app/connexion-wall-page";

const inter = Inter({subsets: ["latin"]});

export default function RootLayout({children}: Readonly<{ children: React.ReactNode }>) {
    return (
        <html lang="en">
        <body className={inter.className}>
        <AuthContextProvider>
            <ConnexionWallPage></ConnexionWallPage>
        </AuthContextProvider>
        </body>
        </html>
    );
}
