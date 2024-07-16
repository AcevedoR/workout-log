import {AuthContextProvider, UserAuth} from "@/app/auth/auth-context";

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
                <button onClick={handleSignIn}>Login</button>
            </div>
            </AuthContextProvider>
        </>
    )
}