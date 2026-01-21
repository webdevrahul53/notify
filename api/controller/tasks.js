import Task from "../model/tasks.js";


const taskList = async (req, res) => {
    const tasks = await Task.find();
    res.json({ status: 200, message: "Task list route", data: tasks });
}

const createTask = async (req, res) => {
    const { title, description } = req.body;
    if(!title || !description) 
    return res.status(400).json({ status: 400, message: "Title and Description are required" });

    const result = await Task.create({ title, description });
    res.json({ status: 200, message: "Task created successfully", data: result });

}

const deleteTask = async (req, res) => {
    const { id } = req.params;
    const response = await Task.findByIdAndDelete(id);
    res.json({ status: 200, message: `Task with id ${id} deleted successfully`, data: response });
}

export { taskList, createTask, deleteTask };
