import React from 'react';
import { Badge } from 'react-bootstrap';

interface TaskBadgesProps {
  tasks: string;
  variant?: string;
  className?: string;
}

/**
 * Renders comma-separated tasks as individual Bootstrap badges.
 * Splits the tasks string by commas and displays each task as a badge.
 */
const TaskBadges: React.FC<TaskBadgesProps> = ({ 
  tasks, 
  variant = 'secondary', 
  className = '' 
}) => {
  // Splits tasks by comma and trims whitespace
  const taskList = tasks
    .split(',')
    .map(task => task.trim())
    .filter(task => task.length > 0);

  // Returns nothing if no valid tasks exist
  if (taskList.length === 0) {
    return <span className="text-muted">No tasks</span>;
  }

  // Renders each task as a badge with small spacing between them
  return (
    <div className={`d-flex flex-wrap gap-1 ${className}`}>
      {taskList.map((task, index) => (
        <Badge 
          key={index} 
          bg={variant}
          className="px-2 py-1"
        >
          {task}
        </Badge>
      ))}
    </div>
  );
};

export default TaskBadges;
