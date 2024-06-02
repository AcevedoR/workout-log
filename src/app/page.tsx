'use client'

import LogForm from "@/app/form/log-form";

export default function Home() {
    return (
        <main className="flex min-h-screen flex-col items-center justify-between p-24 ">
            <div>
                <h1 className={"text-4xl text-center"}>Workout log</h1>
                <LogForm>

                </LogForm>
            </div>
        </main>
    );
}
