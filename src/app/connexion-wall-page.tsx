'use client';

import "./globals.css";
import Login from "@/app/login";
import {UserAuth} from "@/app/auth/auth-context";
import Page from "@/app/page";


export default function ConnexionWallPage() {
    const {user} = UserAuth();
    return (
        <>
            {!user ? (
                <>
                    <Login/>
                </>
            ) : (
                <>
                    <Page></Page>
                </>

            )}
        </>
    );
}
