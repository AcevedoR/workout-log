'use client';

import "./globals.css";
import Login from "@/app/login";
import {UserAuth} from "@/app/auth/auth-context";
import Home from "@/app/home";
import {isDevModeEnabled} from "@/app/FeaturesConfiguration";

export interface ConnexionWallPageProps {
}

export default function ConnexionWallPage(props: ConnexionWallPageProps) {
    const {user} = UserAuth();
    let userID = user?.uid;

    if (isDevModeEnabled) {
        console.warn("running in dev mode")
        if (!userID) {
            userID = "dev-mode-fake-user"
        }
    }
    return (
        <>
            {userID ? (
                <>
                    <Home userID={userID}></Home>
                </>
            ) : (
                <>
                    <Login/>
                </>
            )}
        </>
    );
}
