import type {Metadata} from "next";
import {Inter} from "next/font/google";
import "./globals.css";
import {ToastContainer} from "react-toastify";
import 'react-toastify/dist/ReactToastify.min.css';
import React from "react";
import Script from "next/script";

const inter = Inter({subsets: ["latin"]});

export const metadata: Metadata = {
    title: "Workout log",
    description: "Generated by create next app",
};


export default function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode;
}>) {
    return (

        <html lang="en">
        <body className={inter.className + " bg-secondary-beige/70"}>
        <main>
            {children}
            <ToastContainer/>
        </main>
        </body>
        </html>
    );
}
