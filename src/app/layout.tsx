'use client';

import {Inter} from "next/font/google";
import "./globals.css";
import {AuthContextProvider} from "@/app/auth/auth-context";
import ConnexionWallPage from "@/app/connexion-wall-page";
import InfoTooltip from "@/app/utils/info-tooltip";
import LogoutButton from "@/app/auth/logout-button";
import {ClockWatch} from "@/app/clockwatch/clock-watch";
import {getLastWorkoutInputInLocalStorage} from "@/app/local-storage.service";
import LogForm from "@/app/form/log-form";
import WorkoutHistory from "@/app/history/workout-history";

const inter = Inter({subsets: ["latin"]});

export default function RootLayout({children}: Readonly<{ children: React.ReactNode }>) {
    return (
        <html lang="en">
        <body className={inter.className}>
        <main className="flex flex-col items-center justify-between p-10 pt-6">
            <div>
                <div className="text-4xl flex justify-center">
                    <h1>
                        Workout log
                    </h1>
                    <InfoTooltip
                        textToShow={"Hey, this minimalistic app is still in early development, the code source is open source and available here: https://github.com/AcevedoR/workout-log"}></InfoTooltip>
                </div>
                <p>A simple app to help you log your workout sessions</p>
            </div>
        </main>
        <AuthContextProvider>
            <ConnexionWallPage></ConnexionWallPage>
        </AuthContextProvider>
        </body>
        </html>
    );
}
