'use client';

import "./globals.css";
import Login from "./login";
import {UserAuth} from "./auth/auth-context";
import Home from "./home";
import {isDevModeEnabled} from "./FeaturesConfiguration";

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
