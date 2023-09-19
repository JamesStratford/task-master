import mongoose from 'mongoose';
const { Schema, model } = mongoose;

const taskSchema = new mongoose.Schema({
    _id: ObjectId,
    userId: String,
    description: String,
    priority: String,
    due_date: Date
});

export const Task = mongoose.model('Task', taskSchema);