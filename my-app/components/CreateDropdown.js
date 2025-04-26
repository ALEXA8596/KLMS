import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faFile, faQuestion } from '@fortawesome/free-solid-svg-icons';
import Dropdown from 'react-bootstrap/Dropdown';

function CreateDropdown() {
    return (
        <Dropdown>
            <Dropdown.Toggle variant="primary" id="dropdown-basic">
                <FontAwesomeIcon icon={faEdit} />
                <span className="ml-2">Create</span>
            </Dropdown.Toggle>

            <Dropdown.Menu style={{ marginTop: '0.125rem' }}>
                <Dropdown.Item href="/create/lesson">
                    <FontAwesomeIcon icon={faFile} className="mr-2" /> Lesson
                </Dropdown.Item>
                <Dropdown.Item href="/create/unit">
                    <FontAwesomeIcon icon={faQuestion} className="mr-2" /> Quiz
                </Dropdown.Item>
            </Dropdown.Menu>
        </Dropdown>
    );
}

export default CreateDropdown;