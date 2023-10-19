import React from 'react';
import { useState, useEffect } from 'react';
import { Gantt } from 'gantt-task-react';
import axios from 'axios';
import "gantt-task-react/dist/index.css";


const GanttChart = () => {
    const [state, setState] = useState({
        taskDict: {},
        tasks: []
    });
    

    const transformDataToTasks = (data) => {
        const taskList = [];
        for (let key in data) {
            if (data[key].startDate == null || data[key].dueDate == null) {
                continue;
            }
            let task = {};
            task.id = data[key].taskId;
            task.name = data[key].content;
            task.start = new Date(data[key].startDate);
            task.end = new Date(data[key].dueDate);
            task.progress = 0;
            task.styles = { progressColor: '#ffbb54', progressSelectedColor: '#ff9e0d' };
            taskList.push(task);
        }
        return taskList;
    };

    useEffect(() => {
        const fetchData = async () => {
            const data = await axios.get(
                `${process.env.REACT_APP_BACKEND_URL}/api/gantt/get-tasks`
            );
            const taskList = transformDataToTasks(data.data);
            setState(prevState => ({
                ...prevState,
                taskDict: data.data,
                tasks: taskList
            }));
        };
        fetchData();
    }, []);
    

    const onDateChange = async (task) => {
        // Update task in taskDict with new dates, then put in db
        const taskToUpdate = state.taskDict[task.id];
        taskToUpdate.startDate = task.start;
        taskToUpdate.dueDate = task.end;

        await axios.put(
            `${process.env.REACT_APP_BACKEND_URL}/api/gantt/update-task-date`,
            taskToUpdate
        );
    }


    return (
        <div className="gantt-container" style={{ height: "100vh", padding: "0 20px" }}>
            {state.tasks.length > 0 ? (
                <Gantt
                    tasks={state.tasks}
                    viewMode={"Week"}
                    onClickTask={(task) => console.log("Task Clicked: ", task)}
                    onCompleteChange={(task) => console.log("Status Changed: ", task)}
                    onDateChange={onDateChange}
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
