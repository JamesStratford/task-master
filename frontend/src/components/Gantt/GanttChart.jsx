import React from 'react';
import { Gantt } from 'gantt-task-react';

const GanttChart = ({ tasks }) => {
    return (
        <div className="gantt-container" style={{ height: "100vh", padding: "0 20px" }}>
            <Gantt
                tasks={tasks}
                viewMode={"Week"}
                onClickTask={(task) => console.log("Task Clicked: ", task)}
                onCompleteChange={(task) => console.log("Status Changed: ", task)}
                onDateChange={(task) => console.log("Date Changed: ", task)}
                TaskListHeader={({ style, className }) => {
                    return null;
                }}
                TaskListTable={({ style, className, tasks, selectedTaskIds, onRowClick }) => {
                    return null;
                }}
                columnWidth={150}
            />
        </div>
    );
};

export default GanttChart;
