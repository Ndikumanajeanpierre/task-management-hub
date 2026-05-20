import { Droppable } from '@hello-pangea/dnd'
import TaskCard from './TaskCard'

const columnStyles = {
  todo:        { bg: 'bg-gray-50',   border: 'border-gray-200',  dot: 'bg-gray-400',   label: 'To Do' },
  in_progress: { bg: 'bg-blue-50',   border: 'border-blue-200',  dot: 'bg-blue-500',   label: 'In Progress' },
  review:      { bg: 'bg-yellow-50', border: 'border-yellow-200',dot: 'bg-yellow-500', label: 'Review' },
  done:        { bg: 'bg-green-50',  border: 'border-green-200', dot: 'bg-green-500',  label: 'Done' },
}

export default function KanbanColumn({ columnId, tasks, onTaskClick, onAddTask, canAdd }) {
  const style = columnStyles[columnId]

  return (
    <div className={`rounded-2xl border ${style.border} ${style.bg} p-4 min-h-96 flex flex-col`}>

      {/* Column Header */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${style.dot}`}></div>
          <h3 className="font-semibold text-gray-700 text-sm">{style.label}</h3>
          <span className="bg-white text-gray-500 text-xs font-medium px-2 py-0.5 rounded-full border border-gray-200">
            {tasks.length}
          </span>
        </div>
        {canAdd && (
          <button
            onClick={() => onAddTask(columnId)}
            className="w-7 h-7 rounded-lg bg-white border border-gray-200 text-gray-400
              hover:bg-blue-50 hover:border-blue-300 hover:text-blue-500
              flex items-center justify-center text-lg transition"
          >
            +
          </button>
        )}
      </div>

      {/* Droppable Area */}
      <Droppable droppableId={columnId}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`flex-1 min-h-24 rounded-xl transition-colors duration-200
              ${snapshot.isDraggingOver ? 'bg-blue-100 border-2 border-dashed border-blue-300' : ''}`}
          >
            {tasks.length === 0 && !snapshot.isDraggingOver && (
              <div className="flex items-center justify-center h-24 text-gray-300 text-sm">
                Drop tasks here
              </div>
            )}
            {tasks.map((task, index) => (
              <TaskCard
                key={task.id}
                task={task}
                index={index}
                onClick={onTaskClick}
              />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  )
}