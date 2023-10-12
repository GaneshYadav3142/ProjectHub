const express = require('express');
const db = require('../db'); // Assuming you have a database connection module

const teamRouter = express.Router();

teamRouter.post('/create', async (req, res) => {
    const { name, members } = req.body;

    // Validate the request
    if (!name || name.trim() === '') {
        return res.status(400).json({ error: 'Team name is required.' });
    }

    try {
        // Create team record in the database
        const createTeamQuery = 'INSERT INTO teams (name) VALUES (?)';
        const [teamResult] = await db.query(createTeamQuery, [name]);

        const teamID = teamResult.insertId;

        // Add team members if provided
        if (members && members.length > 0) {
            const addMembersQuery = 'INSERT INTO teammembers (teamID, memberID) VALUES (?, ?)';
            for (const memberID of members) {
                // Check if memberID exists in users table (perform validation)
                // ... (perform validation logic, if necessary)

                // Insert team member record
                await db.query(addMembersQuery, [teamID, memberID]);
            }
        }

        // Prepare response
        const teamResponse = {
            id: teamID.toString(),
            name,
            members: members
                ? members.map(memberID => {
                      return {
                          id: memberID,
                          name: 'Sample Name', // Retrieve member details from users table
                          email: 'sample@example.com' // Retrieve member details from users table
                      };
                  })
                : []
        };

        res.status(201).json(teamResponse);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});



teamRouter.put('/:teamID/members', async (req, res) => {
    const teamID = req.params.teamID;
    const { members } = req.body;

    // Validate the request
    if (!members || !Array.isArray(members) || members.length === 0) {
        return res.status(400).json({ error: 'Invalid or empty members array.' });
    }

    try {
        // Remove existing team members
        const removeMembersQuery = 'DELETE FROM team_members WHERE teamID = ?';
        await db.query(removeMembersQuery, [teamID]);

        // Add new team members
        const addMembersQuery = 'INSERT INTO team_members (teamID, memberID) VALUES (?, ?)';
        for (const memberID of members) {
            // Check if memberID exists in users table (perform validation)
            // ... (perform validation logic, if necessary)

            // Insert team member record
            await db.query(addMembersQuery, [teamID, memberID]);
        }

        // Retrieve updated team details with members
        const getTeamDetailsQuery =
            'SELECT teams.id AS teamID, teams.name AS teamName, users.id AS memberID, users.name AS memberName, users.email AS memberEmail FROM teams LEFT JOIN team_members ON teams.id = team_members.teamID LEFT JOIN users ON team_members.memberID = users.id WHERE teams.id = ?';
        const [teamDetailsResult] = await db.query(getTeamDetailsQuery, [teamID]);

        // Prepare response
        const teamResponse = {
            id: teamID.toString(),
            name: teamDetailsResult[0].teamName,
            members: teamDetailsResult.map(member => {
                return {
                    id: member.memberID.toString(),
                    name: member.memberName,
                    email: member.memberEmail
                };
            })
        };

        res.status(200).json(teamResponse);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

teamRouter.delete('/:teamID', async (req, res) => {
    const teamID = req.params.teamID;

    try {
        // Delete team members associated with the team
        const deleteTeamMembersQuery = 'DELETE FROM team_members WHERE teamID = ?';
        await db.query(deleteTeamMembersQuery, [teamID]);

        // Delete the team from the teams table
        const deleteTeamQuery = 'DELETE FROM teams WHERE id = ?';
        await db.query(deleteTeamQuery, [teamID]);

        // Send a success response
        res.status(200).send('Team deleted successfully.');
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
module.exports = teamRouter;
