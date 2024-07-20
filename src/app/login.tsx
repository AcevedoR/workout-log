import {AuthContextProvider, UserAuth} from "@/app/auth/auth-context";
import GoogleButton from "react-google-button";
import InfoTooltip from "@/app/utils/info-tooltip";

export default function Login() {
    const {user, googleSignIn, logOut} = UserAuth();

    const handleSignIn = async () => {
        try {
            await googleSignIn();
        } catch (error) {
            console.log(error);
        }
    };
    return (
        <AuthContextProvider>
            <div className="flex min-h-screen flex-col items-center justify-center">
                    <div className="text-4xl flex justify-center">
                        <h1>
                            Workout log
                        </h1>
                        <InfoTooltip
                            textToShow={"Hey, this minimalistic app is still in early development, the code source is open source and available here: https://github.com/AcevedoR/workout-log"}></InfoTooltip>
                    </div>
                    <p className="mb-6 mt-2">A simple app to help you log your workout sessions</p>
                <div className="m-6">
                    <GoogleButton
                    onClick={handleSignIn}
                />
                </div>
            </div>
        </AuthContextProvider>
    )
}