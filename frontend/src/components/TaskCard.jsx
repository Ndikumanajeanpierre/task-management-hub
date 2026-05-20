import { Draggable } from '@hello-pangea/dnd'

const priorityColors = {
  low:      'bg-gray-100 text-gray-600',
  medium:   'bg-blue-100 text-blue-600',
  high:     'bg-orange-100 text-orange-600',
  critical: 'bg-red-100 text-red-600',
}

const priorityIcons = {
  low: '↓',
  medium: '→',
  high: '↑',
  critical: '⚠',
}

export default function TaskCard({ task, index, onClick }) {
  const isOverdue = task.due_date && new Date(task.due_date) < new Date()

  return (
    <Draggable draggableId={String(task.id)} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={() => onClick(task)}
          className={`bg-white rounded-xl p-4 mb-3 shadow-sm border cursor-pointer
            transition-all duration-200 hover:shadow-md
            ${snapshot.isDragging
              ? 'shadow-lg border-blue-300 rotate-1 scale-105'
              : 'border-gray-100'
            }`}
        >
          {/* Priority Badge */}
          <div className="flex justify-between items-start mb-2">
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${priorityColors[task.priority]}`}>
              {priorityIcons[task.priority]} {task.priority}
            </span>
            {isOverdue && (
              <span className="text-xs text-red-500 font-medium">⏰ Overdue</span>
            )}
          </div>

          {/* Title */}
          <h4 className="text-sm font-semibold text-gray-800 mb-2 leading-snug">
            {task.title}
          </h4>

          {/* Description */}
          {task.description && (
            <p className="text-xs text-gray-400 mb-3 line-clamp-2">
              {task.description}
            </p>
          )}

          {/* Footer */}
          <div className="flex justify-between items-center mt-2">
            {task.assigned_to_name ? (
              <div className="flex items-center gap-1">
                <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
                  <span className="text-white text-xs font-bold">
                    {task.assigned_to_name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <span className="text-xs text-gray-400">{task.assigned_to_name}</span>
              </div>
            ) : (
              <span className="text-xs text-gray-300">Unassigned</span>
            )}

            {task.due_date && (
              <span className={`text-xs ${isOverdue ? 'text-red-400' : 'text-gray-400'}`}>
                📅 {new Date(task.due_date).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>
      )}
    </Draggable>
  )
}