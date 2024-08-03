import React from "react";
import {faInfo} from '@fortawesome/free-solid-svg-icons'
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {Bounce, toast} from "react-toastify";

interface InfoTooltipProps {
    textToShow: string;
}

export default function InfoTooltip(props: InfoTooltipProps) {
    const {textToShow} = props;

    return (
        <div>
            <button
                className="text-gray-800 font-bold py-1 px-2 rounded-full inline-flex items-center border border-gray-400 text-xs"
                onClick={() => toast.info(textToShow, {
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
                }>
                <FontAwesomeIcon icon={faInfo}></FontAwesomeIcon>
            </button>
        </div>
    );
}