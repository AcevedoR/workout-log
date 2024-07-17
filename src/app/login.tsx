import {AuthContextProvider, UserAuth} from "@/app/auth/auth-context";
import GoogleButton from "react-google-button";

export default function Login() {
    const { user, googleSignIn, logOut } = UserAuth();

    const handleSignIn = async () => {
        try {
            await googleSignIn();
        } catch (error) {
            console.log(error);
        }
    };
    return (
        <>
            <AuthContextProvider>
            <div>
                <GoogleButton
                    onClick={handleSignIn}
                />
            </div>
            </AuthContextProvider>
        </>
    )
}