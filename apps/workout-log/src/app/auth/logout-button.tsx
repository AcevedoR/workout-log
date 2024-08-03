import {AuthContextProvider, UserAuth} from "./auth-context";

export default function LogoutButton() {
    const {logOut} = UserAuth();

    const handleSignOut = async () => {
        try {
            await logOut();
        } catch (error) {
            console.log(error);
        }
    };
    return (
        <>
            <AuthContextProvider>
                <div>
                    <button onClick={handleSignOut}>Log out</button>
                </div>
            </AuthContextProvider>
        </>
    )
}