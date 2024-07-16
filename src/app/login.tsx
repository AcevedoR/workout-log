import {UserAuth} from "@/app/auth/auth-context";

export default function Login() {
    const { user, googleSignIn, logOut } = UserAuth();

    const handleSignIn = async () => {
        try {
            await googleSignIn();
        } catch (error) {
            console.log(error);
        }
    };

    const handleSignOut = async () => {
        try {
            await logOut();
        } catch (error) {
            console.log(error);
        }
    };
    return (
        <>
            <div>
                <button onClick={handleSignIn}>Login</button>
            </div>
            <div>
                <button onClick={logOut}>Log out</button>
            </div>
        </>
    )
}