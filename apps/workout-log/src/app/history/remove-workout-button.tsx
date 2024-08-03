import {noop} from '../noop';
import React, {useState} from 'react';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faBan, faTrashCan} from '@fortawesome/free-solid-svg-icons'

interface RemoveWorkoutButtonProps {
    onClick?: () => unknown;
}

export const RemoveWorkoutButton = (
    props: RemoveWorkoutButtonProps
) => {
    const {onClick = noop} = props;

    const [shouldConfirm, setShouldConfirm] = useState(true);

    const onButtonClick = () => {
        if (shouldConfirm) {
            setShouldConfirm(false);
        } else {
            onClick();
            setShouldConfirm(true);
        }
    };

    const deleteIconButton = <FontAwesomeIcon icon={faTrashCan}></FontAwesomeIcon>;

    const confirmButton = <div
        className="bg-rose-800 hover:bg-red-700 text-white font-bold py-1 px-2 rounded inline-flex items-center">{deleteIconButton}</div>;

    const cancelButton = shouldConfirm ? null : (
        <button onClick={() => setShouldConfirm(true)}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-1 px-2 rounded inline-flex items-center">
            <FontAwesomeIcon icon={faBan}></FontAwesomeIcon>
        </button>
    );

    const buttonLabel = shouldConfirm ? <div className="text-gray-400">{deleteIconButton}</div> : confirmButton;

    return (
        <>
            <button onClick={onButtonClick} className="button mr-2 has-text-danger">
                <span>
                    {buttonLabel}
                </span>
            </button>
            {cancelButton}
        </>
    );
};
