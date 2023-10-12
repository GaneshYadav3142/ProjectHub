const express=require("express")
const db = require("../db")
const authMiddleware = require("../Midddleware/AuthenticationMiddelware")
const taskRouter=express.Router()

taskRouter.post("/create", async (req, res) => {
    const { title, description, dueDate, priority, status, projectID, assignedTeamMembers } = req.body;

    try {
        // Insert task into the database
        const insertTaskQuery = "INSERT INTO tasks (title, description, dueDate, priority, status, projectID) VALUES (?, ?, ?, ?, ?, ?)";
        const taskValues = [title, description, dueDate, priority, status, projectID];

        db.query(insertTaskQuery, taskValues, async (err, result) => {
            if (err) {
                return res.status(500).send("Internal Server Error");
            }

            // Insert assigned team members into the task_team_members table
            const taskID = result.insertId;
            const insertTeamMembersQuery = "INSERT INTO task_team_members (taskID, teamMemberID) VALUES ?";
            console.log(taskID,assignedTeamMembers)
            
            const teamMembersValues = assignedTeamMembers.map(memberID => [taskID, memberID]);
             console.log(teamMembersValues)
            db.query(insertTeamMembersQuery, [teamMembersValues], (err, teamMembersResult) => {
                if (err) {
                    return res.status(500).send("Internal Server Error 1");
                }

                // Fetch assigned team members' details
                const fetchTeamMembersQuery = "SELECT id, name, email FROM users WHERE id IN (?)";
                const teamMemberIDs = assignedTeamMembers.map(memberID => parseInt(memberID, 10));

                db.query(fetchTeamMembersQuery, [teamMemberIDs], (err, teamMembersDetails) => {
                    if (err) {
                        return res.status(500).send("Internal Server Error");
                    }

                    const assignedTeamMembersInfo = teamMembersDetails.map(member => ({
                        id: member.id.toString(),
                        name: member.name,
                        email: member.email
                    }));

                    // Prepare the response
                    const response = {
                        id: taskID.toString(),
                        title,
                        description,
                        dueDate,
                        priority,
                        status,
                        assignedTeamMembers: assignedTeamMembersInfo
                    };

                    res.status(201).json(response);
                });
            });
        });
    } catch (error) {
        // Handle errors here
        res.status(500).send("Internal Server Error");
    }
});

taskRouter.put("/:taskID", async (req, res) => {
    const taskID = parseInt(req.params.taskID, 10);
    const { title, description, dueDate, priority, status, projectID, assignedTeamMembers } = req.body;

    try {
        // Remove existing team member assignments for the current task
        const deleteAssignmentsQuery = "DELETE FROM task_team_members WHERE taskID = ?";
        db.query(deleteAssignmentsQuery, [taskID], (err, deleteResult) => {
            if (err) {
                return res.status(500).send("Internal Server Error 1");
            }

            // Insert new team member assignments
            const insertAssignmentsQuery = "INSERT INTO task_team_members (taskID, teamMemberID) VALUES ?";
            const teamMembersValues = assignedTeamMembers.map(memberID => [taskID, memberID]);
            db.query(insertAssignmentsQuery, [teamMembersValues], (err, insertResult) => {
                if (err) {
                    return res.status(500).send("Internal Server Error 2");
                }

                // Update task details in the database
                const updateTaskQuery = `
                    UPDATE tasks
                    SET title = ?, description = ?, dueDate = ?, priority = ?, status = ?, projectID = ?
                    WHERE taskID = ?;
                `;
                const taskValues = [title, description, dueDate, priority, status, projectID, taskID];
                db.query(updateTaskQuery, taskValues, (err, updateResult) => {
                    if (err) {
                        return res.status(500).send("Internal Server Error 3");
                    }

                    // Fetch team members' details based on their IDs
                    const fetchTeamMembersQuery = "SELECT id, name, email FROM users WHERE id IN (?)";
                    const teamMembersIDs = assignedTeamMembers.map(memberID => memberID);
                    db.query(fetchTeamMembersQuery, [teamMembersIDs], (err, teamMembers) => {
                        if (err) {
                            return res.status(500).send("Internal Server Error 4");
                        }

                        // Prepare the response
                        const response = {
                            id: taskID,
                            title,
                            description,
                            dueDate,
                            priority,
                            status,
                            assignedTeamMembers: teamMembers /* Fetched assigned team members' details */
                        };
                        res.status(200).json(response);
                    });
                });
            });
        });
    } catch (error) {
        // Handle other errors here
        res.status(500).send("Internal Server Error 5");
    }
});



taskRouter.delete("/:taskID", async (req, res) => {
    const taskID = req.params.taskID;

    try {
        // Start a database transaction
        db.beginTransaction(async (err) => {
            if (err) {
                return res.status(500).send("Internal Server Error");
            }

            try {
                // Delete team member assignments associated with the task
                const deleteAssignmentsQuery = "DELETE FROM task_team_members WHERE taskID = ?";
                 db.query(deleteAssignmentsQuery, [taskID]);

                // Delete the task
                const deleteTaskQuery = "DELETE FROM tasks WHERE taskID = ?";
                 db.query(deleteTaskQuery, [taskID]);

                // Commit the transaction
                db.commit((err) => {
                    if (err) {
                        return db.rollback(() => {
                            res.status(500).send("Internal Server Error 1");
                        });
                    }

                    // Send a success response
                    res.status(200).json({ msg: "Task deleted successfully" });
                });
            } catch (error) {
                // Rollback the transaction on error
                db.rollback(() => {
                    res.status(500).send("Internal Server Error");
                });
            }
        });
    } catch (error) {
        // Handle other errors here
        res.status(500).send("Internal Server Error");
    }
});























module.exports=taskRouter