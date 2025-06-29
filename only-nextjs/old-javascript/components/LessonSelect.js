const LessonOption = ({ lesson, depth = 0 }) => {
    return (
        <>
            <option value={lesson.id}>
                {'-'.repeat(depth)} {lesson.name}
            </option>
            {lesson.children?.map(child => (
                <LessonOption 
                    key={child.id} 
                    lesson={child} 
                    depth={depth + 1}
                />
            ))}
        </>
    );
};

export default function LessonSelect({ lessons, value, onChange }) {
    return (
        <select 
            className="form-control border border-black"
            value={value || ''}
            onChange={onChange}
        >
            <option value="">No Parent (Root Lesson)</option>
            {lessons?.map(lesson => (
                <LessonOption key={lesson.id} lesson={lesson} />
            ))}
        </select>
    );
}