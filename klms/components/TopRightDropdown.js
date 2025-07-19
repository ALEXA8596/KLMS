import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faCog, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import Dropdown from 'react-bootstrap/Dropdown';

function DropDown({
    signOut
}) {
    return (
        <Dropdown>
            <Dropdown.Toggle variant="primary" id="dropdown-basic">
                <FontAwesomeIcon icon={faUser} />
            </Dropdown.Toggle>

            <Dropdown.Menu style={{ marginTop: '0.125rem' }}>
                <Dropdown.Item href="/app/profile">
                    <FontAwesomeIcon icon={faUser} className="mr-2" /> My Profile
                </Dropdown.Item>
                <Dropdown.Item href="/app/settings">
                    <FontAwesomeIcon icon={faCog} className="mr-2" /> Settings
                </Dropdown.Item>
                <Dropdown.Item onClick={signOut}>
                    <FontAwesomeIcon icon={faSignOutAlt} className="mr-2" /> Sign Out
                </Dropdown.Item>
            </Dropdown.Menu>
        </Dropdown>
    );
}

export default DropDown;