const express = require('express');
const db = require('../db'); // Assuming you have a database connection module
const authMiddleware = require('../Midddleware/AuthenticationMiddelware'); // Assuming you have an authentication middleware

const dashboardRouter = express.Router();

// Middleware to ensure authentication before accessing the dashboard
dashboardRouter.use(authMiddleware);

dashboardRouter.get('/', async (req, res) => {
    const userID = req.body.userID; // Assuming the authenticated user's ID is available in the request body

    try {
        // Fetch user's tasks from the database
        const tasksQuery = 'SELECT id, title, dueDate, status FROM tasks WHERE assignedTeamMembers LIKE ?';
        const tasks = await db.query(tasksQuery, [`%${userID}%`]);

        // Fetch user's projects from the database
        const projectsQuery = 'SELECT id, name, status FROM projects WHERE managerID = ?';
        const projects = await db.query(projectsQuery, [userID]);

        // Fetch user's teams from the database
        const teamsQuery = 'SELECT id, name FROM teams WHERE members LIKE ?';
        const teams = await db.query(teamsQuery, [`%${userID}%`]);

        // Prepare the response
        const dashboardData = {
            tasks: tasks,
            projects: projects,
            teams: teams
        };

        // Send the dashboard data as a JSON response
        res.status(200).json(dashboardData);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = dashboardRouter;
