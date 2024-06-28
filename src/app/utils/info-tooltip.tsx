import React, {useState} from "react";
import {faInfo} from '@fortawesome/free-solid-svg-icons'
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";

interface InfoTooltipProps {
    textToShow: string;
}

export default function InfoTooltip(props: InfoTooltipProps) {
    const {textToShow} = props;

    const [tooltipDisplayed, setTooltipDisplayed] = useState(false);

    const handleClick = () => {
        setTooltipDisplayed(!tooltipDisplayed);
    }
    const handleMouseIn = (e: any) => {
        if (!tooltipDisplayed) {
            setTooltipDisplayed(true);
        }
    }

    const tooltip = <div
        className="inline-block px-3 py-2 text-sm font-medium text-white bg-gray-400 rounded-lg shadow-sm tooltip">{textToShow}</div>;

    return (
        <div>
            <button
                className="text-gray-800 font-bold py-1 px-2 rounded-full inline-flex items-center border border-gray-400 text-xs"
                onClick={handleClick} onMouseOver={handleMouseIn}>
                <FontAwesomeIcon icon={faInfo}></FontAwesomeIcon>
            </button>
            {(tooltipDisplayed) ? tooltip : <div></div>}
        </div>
    );
}