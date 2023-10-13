const express = require('express');
const db = require('../db'); // Assuming you have a database connection module
const authMiddleware = require('../Midddleware/AuthenticationMiddelware'); // Assuming you have an authentication middleware

const dashboardRouter = express.Router();

// Middleware to ensure authentication before accessing the dashboard
dashboardRouter.use(authMiddleware);

dashboardRouter.get('/', (req, res) => {
    const userID = req.body.userID; // Assuming the authenticated user's ID is available in the request body

    // Fetch user's tasks from the database
    const tasksQuery = 'SELECT taskID, title, dueDate, status FROM tasks WHERE assignedTeamMembers LIKE ?';
    db.query(tasksQuery, [`%${userID}%`], (tasksError, tasks) => {
        if (tasksError) {
            console.error(tasksError);
            return res.status(500).json({ error: 'Internal Server Error 1' });
        }

        // Fetch user's projects from the database
        const projectsQuery = 'SELECT projectID, proName,description FROM projects WHERE managerID = ?';
        db.query(projectsQuery, [userID], (projectsError, projects) => {
            if (projectsError) {
                console.error(projectsError);
                return res.status(500).json({ error: 'Internal Server Error 2' });
            }

            // Fetch user's teams from the database
            const teamsQuery = 'SELECT id, name FROM teams WHERE members LIKE ?';
            db.query(teamsQuery, [`%${userID}%`], (teamsError, teams) => {
                if (teamsError) {
                    console.error(teamsError);
                    return res.status(500).json({ error: 'Internal Server Error 3' });
                }

                // Prepare the response
                const dashboardData = {
                    tasks: tasks,
                    projects: projects,
                    teams: teams
                };

                // Send the dashboard data as a JSON response
                res.status(200).json(dashboardData);
            });
        });
    });
});

dashboardRouter.get('/team-member/:userID', (req, res) => {
    const userID = req.params.userID;

    // Fetch tasks assigned to the team member
    const tasksQuery1 = 'SELECT tasks.taskID AS taskID, tasks.title, tasks.dueDate, tasks.status FROM tasks JOIN task_team_members ON tasks.taskID = task_team_members.taskID WHERE task_team_members.teamMemberID = ?;';
    db.query(tasksQuery1, [userID], (tasksError, tasks) => {
        if (tasksError) {
            console.error(tasksError);
            res.status(500).json({ error: 'Internal Server Error' });
        } else {
          
            const tasksQuery2 = 'SELECT tasks.taskID AS taskID, tasks.title, tasks.dueDate, tasks.status FROM tasks JOIN task_team_members ON tasks.taskID = task_team_members.taskID WHERE task_team_members.teamMemberID = ?;';
            db.query(tasksQuery1, [userID], (tasksError, tasks) => {
                if (tasksError) {
                    console.error(tasksError);
                    res.status(500).json({ error: 'Internal Server Error' });
                }

            res.status(200).json({ tasks: tasks });
        }
    });
});

module.exports = dashboardRouter;
