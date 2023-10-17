import { Task } from "gantt-task-react";
import "gantt-task-react/dist/index.css";

let tasks: Task[] = [
    {
        id: "1",
        type:'task',
        name: "Project Kickoff",
        start: new Date("2023-10-17"),
        end: new Date("2023-10-18"),
        progress: 100,
        styles: { progressColor: '#ffbb54', progressSelectedColor: '#ff9e0d' }
    },
    {
        id: "2",
        type:'task',
        name: "Requirement Gathering",
        start: new Date("2023-10-19"),
        end: new Date("2023-10-25"),
        progress: 100,
        styles: { progressColor: '#ffbb54', progressSelectedColor: '#ff9e0d' }
    },
    {
        id: "3",
        type:'task',
        name: "Design Phase",
        start: new Date("2023-10-26"),
        end: new Date("2023-11-05"),
        progress: 90,
        styles: { progressColor: '#ffbb54', progressSelectedColor: '#ff9e0d' },
    },
    {
        id: "4",
        type:'task',
        name: "Development Phase 1",
        start: new Date("2023-11-06"),
        end: new Date("2023-11-20"),
        progress: 75,
        styles: { progressColor: '#ffbb54', progressSelectedColor: '#ff9e0d' },
    },
    {
        id: "5",
        type:'task',
        name: "Testing Phase 1",
        start: new Date("2023-11-21"),
        end: new Date("2023-11-30"),
        progress: 50,
        styles: { progressColor: '#ffbb54', progressSelectedColor: '#ff9e0d' },
    },
    {
        id: "6",
        type:'task',
        name: "Development Phase 2",
        start: new Date("2023-12-01"),
        end: new Date("2023-12-15"),
        progress: 40,
        styles: { progressColor: '#ffbb54', progressSelectedColor: '#ff9e0d' },
    },
    {
        id: "7",
        type:'task',
        name: "Testing Phase 2",
        start: new Date("2023-12-16"),
        end: new Date("2023-12-25"),
        progress: 30,
        styles: { progressColor: '#ffbb54', progressSelectedColor: '#ff9e0d' },
    },
    {
        id: "8",
        type:'task',
        name: "Final Review",
        start: new Date("2023-12-26"),
        end: new Date("2023-12-30"),
        progress: 20,
        styles: { progressColor: '#ffbb54', progressSelectedColor: '#ff9e0d' },
    },
    {
        id: "9",
        type:'task',
        name: "Project Closure",
        start: new Date("2023-12-31"),
        end: new Date("2024-01-02"),
        progress: 10,
        styles: { progressColor: '#ffbb54', progressSelectedColor: '#ff9e0d' },
    },
];

export default tasks;