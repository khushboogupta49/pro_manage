
const Task = require('../model/taskModel');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const moment = require('moment');


const getTasks = catchAsync(async (req, res, next) => {
  try {
      const { range = 7 } = req.query;
      const today = moment.utc().endOf('day');
      const tasks = await Task.find({
        createdBy: req.user._id,
        createdAt: {
          $lte: today.toDate(),
          $gt: today.clone().subtract(range, 'days').toDate(),
        },
      });
  
      res.status(200).json({
        status: 'success',
        results: tasks.length,
        data: { tasks },
      });
    } catch (error) {
      throw new Error('Failed to fetch tasks');
    }
});

const getTask = catchAsync(async (req, res, next) => {
  try {
      const { taskId } = req.params;
      const task = await Task.findById(taskId);
  
      if (!task) {
        throw new Error('Task not found');
      }
  
      res.status(200).json({
        status: 'success',
        data: { task },
      });
    } catch (error) {
      throw new Error('Failed to fetch task');
    }
});

const createTask = catchAsync(async (req, res, next) => {
const { title, priority, checklists, dueDate, createdAt, status } = req.body;

const task = await Task.create({
  title,
  status,
  priority,
  checklists,
  dueDate,
  createdAt,
  createdBy: req.user._id,
});

res.status(201).json({
  status: 'success',
  data: { task },
});
});

const updateTask = catchAsync(async (req, res, next) => {
const { taskId } = req.params;
const { title, priority, checklists, dueDate, status } = req.body;

const updatedTask = await Task.findOneAndUpdate(
  { _id: taskId, createdBy: req.user._id },
  {
    title,
    priority,
    checklists,
    dueDate,
    status,
  },
  { new: true, runValidators: true }
);

if (!updatedTask) {
  return next(new AppError('Task not found', 404));
}

res.status(200).json({
  status: 'success',
  data: { task: updatedTask },
});
});

const deleteTask = catchAsync(async (req, res, next) => {
const { taskId } = req.params;

if (!taskId) {
  return next(new AppError('Please provide a taskId', 400));
}

const task = await Task.findOneAndDelete({
  _id: taskId,
  createdBy: req.user._id,
});

if (!task) {
  return next(new AppError('Task not found', 404));
}

res.status(204).json({
  status: 'success',
  data: null,
});
});

const analytics = catchAsync(async (req, res, next) => {
  try {
      const tasks = await Task.find({ createdBy: req.user._id });
  
      const status = {
        backlog: 0,
        todo: 0,
        inProgress: 0,
        done: 0,
      };
  
      const priorities = {
        low: 0,
        high: 0,
        moderate: 0,
        due: 0,
      };
  
      tasks.forEach((task) => {
        status[task.status]++;
        priorities[task.priority]++;
        if (task.isExpired) {
          priorities.due++;
        }
      });
  
      res.status(200).json({
        status: 'success',
        data: { status, priorities },
      });
    } catch (error) {
      throw new Error('Failed to fetch task');
    }
});

module.exports = {
getTasks,
getTask,
createTask,
updateTask,
deleteTask,
analytics,
};















