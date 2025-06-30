import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronRight, faChevronDown } from '@fortawesome/free-solid-svg-icons';

const TreeNode = ({ node, currentLessonId }) => {
    const [isExpanded, setIsExpanded] = useState(true);
    const hasChildren = node.children && node.children.length > 0;

    return (
        <div className="ml-4">
            <div className="flex items-center py-2">
                {hasChildren && (
                    <button 
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="mr-2 w-4"
                    >
                        <FontAwesomeIcon 
                            icon={isExpanded ? faChevronDown : faChevronRight} 
                            className="text-gray-500"
                        />
                    </button>
                )}
                {!hasChildren && <span className="w-4"></span>}
                <a 
                    href={`/lesson/${node.id}`}
                    className={`hover:text-blue-600 ${
                        currentLessonId === node.id ? 'font-bold text-blue-500' : ''
                    }`}
                >
                    {node.name}
                </a>
            </div>
            {hasChildren && isExpanded && (
                <div className="border-l border-gray-300">
                    {node.children.map((child) => (
                        <TreeNode 
                            key={child.id} 
                            node={child} 
                            currentLessonId={currentLessonId}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default function LessonTree({ hierarchy, currentLessonId }) {
    if (!hierarchy) return null;

    return (
        <div className="bg-white rounded-lg shadow p-4 max-w-md">
            <h3 className="font-bold mb-4">Lesson Structure</h3>
            <TreeNode node={hierarchy} currentLessonId={currentLessonId} />
        </div>
    );
}