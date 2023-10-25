import React from 'react';
import { useState, useEffect } from 'react';
import { Gantt } from 'gantt-task-react';
import axios from 'axios';
import "gantt-task-react/dist/index.css";
import "./GanttChart.css";


const GanttChart = () => {
    const [state, setState] = useState({
        taskDict: {},
        tasks: []
    });

    const [viewMode, setViewMode] = useState("Week");


    const transformDataToTasks = (data) => {
        const taskList = [];
        for (let key in data) {
            const isValidDate = (dateString) => {
                if (dateString == null) return false;
                const date = new Date(dateString);
                return !isNaN(date.getTime());
            };
            if (!isValidDate(data[key].startDate) || !isValidDate(data[key].dueDate)) {
                continue;
            }
            let task = {};
            task.id = data[key].taskId;
            task.name = data[key].content;
            task.start = new Date(data[key].startDate);
            task.end = new Date(data[key].dueDate);
            task.progress = 0;
            // Nice orange colour :)
            task.styles = { backgroundColor: '#ffbb54', backgroundSelectedColor: '#ff9e0d' };
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
        const taskToUpdate = { ...state.taskDict[task.id] }
        // Convert date object to '%Y-%m-%d' string
        const startDate = task.start.toISOString().slice(0, 10);
        const dueDate = task.end.toISOString().slice(0, 10);
        taskToUpdate.startDate = startDate;
        taskToUpdate.dueDate = dueDate;

        const updatedTasks = state.tasks.map(t => {
            if (t.id === task.id) {
                return {
                    ...t,
                    start: new Date(startDate),
                    end: new Date(dueDate)
                };
            }
            return t;
        });

        setState(prevState => ({
            ...prevState,
            taskDict: {
                ...prevState.taskDict,
                [task.id]: taskToUpdate
            },
            tasks: updatedTasks
        }));

        await axios.put(
            `${process.env.REACT_APP_BACKEND_URL}/api/gantt/update-task-date`,
            taskToUpdate
        );
    }

    return (
        <div className="gantt-container">
            <button className="toggle-button" onClick={() => {
                setViewMode(viewMode === "Week" ? "Day" : "Week")
            }}>
                {viewMode === "Week" ? "Switch to Day View" : "Switch to Week View"}
            </button>
            {state.tasks.length > 0 ? (
                <Gantt
                    tasks={state.tasks}
                    viewMode={viewMode}
                    viewDate={new Date()}
                    onDateChange={onDateChange}
                    columnWidth={viewMode === "Week" ? 150 : 75}
                    barCornerRadius={7}
                    handleWidth={20}
                />
            ) : (<div>Loading...</div>)}
        </div>
    );
};

export default GanttChart;
