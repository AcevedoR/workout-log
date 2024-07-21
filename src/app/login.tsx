import {AuthContextProvider, UserAuth} from "@/app/auth/auth-context";
import GoogleButton from "react-google-button";
import InfoTooltip from "@/app/utils/info-tooltip";
import {appDevelopmentInformations, appShortDescription} from "@/app/FeaturesConfiguration";

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
                        textToShow={appDevelopmentInformations}></InfoTooltip>
                </div>
                <p className="mb-6 mt-2">{appShortDescription}</p>
                <div className="m-6">
                    <GoogleButton
                        onClick={handleSignIn}
                    />
                </div>
            </div>
        </AuthContextProvider>
    )
}