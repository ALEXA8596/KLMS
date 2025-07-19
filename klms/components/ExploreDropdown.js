import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faFile, faFileZipper, faSuitcase } from '@fortawesome/free-solid-svg-icons';
import Dropdown from 'react-bootstrap/Dropdown';

function ExploreDropdown() {
    return (
        <Dropdown>
            <Dropdown.Toggle variant="primary" id="dropdown-basic">
                <FontAwesomeIcon icon={faEdit} />
                <span className="ml-2">Explore</span>
            </Dropdown.Toggle>

            <Dropdown.Menu style={{ marginTop: '0.125rem' }}>
                <Dropdown.Item href="/create/lesson">
                    <FontAwesomeIcon icon={faFile} className="mr-2" /> Lessons
                </Dropdown.Item>
                <Dropdown.Item href="/create/unit">
                    <FontAwesomeIcon icon={faFileZipper} className="mr-2" /> Units
                </Dropdown.Item>
                <Dropdown.Item href="/create/course">
                    <FontAwesomeIcon icon={faSuitcase} className="mr-2" /> Courses
                </Dropdown.Item>
            </Dropdown.Menu>
        </Dropdown>
    );
}

export default ExploreDropdown;