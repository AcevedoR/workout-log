import {Bounce, toast} from "react-toastify";

export function displayError(text: string){
    console.log("display !")
    toast.error(JSON.stringify(text).toString(), {
        position: "bottom-center",
        autoClose: 20000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
        transition: Bounce,
    })
}
