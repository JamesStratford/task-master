import React from 'react';
import { useState, useEffect } from 'react';
import { Gantt } from 'gantt-task-react';
import axios from 'axios';
import "gantt-task-react/dist/index.css";


const GanttChart = () => {
    const [tasks, setTasks] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            const data = await axios.get(
                `${process.env.REACT_APP_BACKEND_URL}/api/gantt/get-tasks`
            );
            const taskDict = data.data;
            let taskList = [];

            // Change date format to be compatible with gantt chart

            for (let key in taskDict) {
                if (taskDict[key].startDate === null || taskDict[key].dueDate === null) {
                    continue;
                }

                let task = {};
                task.id = taskDict[key].content;
                task.name = taskDict[key].content;
                task.start = new Date(taskDict[key].startDate);
                task.end = new Date(taskDict[key].dueDate);
                task.progress = 0;
                task.styles = { progressColor: '#ffbb54', progressSelectedColor: '#ff9e0d' };

                taskList.push(task);
            }

            // Convert dict to list

            setTasks(taskList);
            console.log(taskList);
        };

        fetchData();
    }, []);

    return (
        <div className="gantt-container" style={{ height: "100vh", padding: "0 20px" }}>
            {tasks.length > 0 ? (
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
            ) : (<div>Loading...</div>)}
        </div>
    );
};

export default GanttChart;
