import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faFile, faQuestion, faPencil, faIdCard } from '@fortawesome/free-solid-svg-icons';
import Dropdown from 'react-bootstrap/Dropdown';

function CreateDropdown() {
    return (
        <Dropdown>
            <Dropdown.Toggle variant="primary" id="dropdown-basic">
                <FontAwesomeIcon icon={faEdit} />
                <span className="ml-2">Create</span>
            </Dropdown.Toggle>

            <Dropdown.Menu style={{ marginTop: '0.125rem' }}>
                <Dropdown.Item href="/app/create/lesson">
                    <FontAwesomeIcon icon={faFile} className="mr-2" /> Lesson
                </Dropdown.Item>
                <Dropdown.Item href="/app/create/quiz">
                    <FontAwesomeIcon icon={faQuestion} className="mr-2" /> Quiz
                </Dropdown.Item>
                <Dropdown.Item href="/app/create/flashcard">
                    <FontAwesomeIcon icon={faEdit} className="mr-2" /> Flashcard
                </Dropdown.Item>
                {/* <Dropdown.Item href="/app/create/learn">
                    <FontAwesomeIcon icon={faPencil} className="mr-2" /> Learn
                </Dropdown.Item> */}
            </Dropdown.Menu>
        </Dropdown>
    );
}

export default CreateDropdown;