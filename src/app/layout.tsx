'use client';

import {Inter} from "next/font/google";
import "./globals.css";
import Login from "@/app/login";
import {AuthContextProvider, UserAuth} from "@/app/auth/auth-context";
import {useEffect} from "react";

const inter = Inter({subsets: ["latin"]});

// export const metadata: Metadata = {
//     title: "Workout log",
//     description: "A simple app to log your workouts, still in development",
// }; TODO

export default function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode;
}>) {
    const { user, googleSignIn, logOut } = UserAuth();

    useEffect(() => {
        const checkAuthentication = async () => {
            console.log("check auth for user: ", user );
            await new Promise((resolve) => {setTimeout(resolve, 2000) ; checkAuthentication() });
        };
        checkAuthentication();
    }, [user]);

    return (
        <html lang="en">
        <body className={inter.className}>
        <AuthContextProvider>
            {!user ? (
                <Login/>
                // TODO find how to use children
            ): (
                // <Home/>
                <div>toto </div>
            )}
        </AuthContextProvider>
        </body>
        </html>
    );
}
