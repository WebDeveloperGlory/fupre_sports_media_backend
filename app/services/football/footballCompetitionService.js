const mongoose = require('mongoose');
const db = require('../../config/db');
const { logActionManually } = require('../../middlewares/auditMiddleware');
// const { addToFront, calculatePercentage } = require('../../utils/functionUtils');
// const { processStatUpdate, updatePlayerGeneralRecord, processAppearanceUpdate } = require('../../utils/football/footballPlayerStatUtils');

exports.getAllCompetitions = async ({ status, sportType, limit = 10, page = 1, sort = '-createdAt' }) => {
    const skip = (page - 1) * limit;
    const filter = {};
    
    if (status) filter.status = status;
    if (sportType) filter.sportType = sportType;

    const [totalCompetitions, competitions] = await Promise.all([
        db.FootballCompetition.countDocuments(filter),
        db.FootballCompetition.find(filter)
            .select('-admin')
            .sort(sort)
            .skip(skip)
            .limit(limit)
            .lean()
            .cache({ key: `competitions:${status}:${sportType}:${page}` })
    ]);

    return { 
        success: true, 
        message: 'All Competitions Acquired', 
        data: {
            competitions,
            pagination: {
                total: totalCompetitions,
                page,
                limit,
                pages: Math.ceil(totalCompetitions / limit),
            }
        }
    };
}

exports.getSingleCompetition = async ({ competitionId }) => {
    const foundCompetition = await db.FootballCompetition.findById(competitionId)
        .populate([
            {
                path: 'teams.team',
                select: 'name shorthand logo colors'
            },
            {
                path: 'teams.squadList',
                select: 'name position number department'
            },
            {
                path: 'admin',
                select: 'firstName lastName email'
            }
        ])
        .lean();

    if (!foundCompetition) return { success: false, message: 'Invalid Competition' };

    return { 
        success: true, 
        message: 'Competition Acquired', 
        data: foundCompetition 
    };
}

exports.getCompetitionFixtures = async ({ competitionId }, { limit = 10, page = 1, fromDate, toDate }) => {
    const skip = (page - 1) * limit;
    const filter = { competition: competitionId };

    if (fromDate || toDate) {
        filter.date = {};
        if (fromDate) filter.date.$gte = new Date(fromDate);
        if (toDate) filter.date.$lte = new Date(toDate);
    }

    const [totalFixtures, fixtures] = await Promise.all([
        db.FootballFixture.countDocuments(filter),
        db.FootballFixture.find(filter)
            .populate('homeTeam awayTeam', 'name shorthand logo')
            .sort({ date: 1 })
            .skip(skip)
            .limit(limit)
            .lean()
    ]);

    return {
        success: true,
        message: 'Competition Fixtures Acquired',
        data: {
            fixtures,
            pagination: {
                total: totalFixtures,
                page,
                limit,
                pages: Math.ceil(totalFixtures / limit),
            }
        }
    };
}

exports.getCompetitionTeams = async ({ competitionId }) => {
    // Check if competition exists
    const foundCompetition = await db.FootballCompetition.findById( competitionId )
        .populate([
            {
                path: 'teams.team',
                select: 'name shorthand'
            },
            {
                path: 'teams.squadList',
                select: 'name position name'
            },
        ]);
    if( !foundCompetition ) return { success: false, message: 'Invalid Competition' };

    // Return success
    return {
        success: true,
        message: 'Competition Teams Aquired',
        data: foundCompetition.teams
    }
}

exports.getCompetitionTeamSquadList = async ({ competitionId, teamId }) => {
    const foundCompetition = await db.FootballCompetition.findById(competitionId)
        .populate({
            path: 'teams',
            match: { 'team': teamId },
            populate: [
                {
                    path: 'team',
                    select: 'name shorthand logo colors'
                },
                {
                    path: 'squadList',
                    select: 'name position number department stats.careerTotals'
                }
            ]
        });

    if (!foundCompetition) return { success: false, message: 'Invalid Competition' };
    if (!foundCompetition.teams.length) return { success: false, message: 'Team not in competition' };

    const teamData = foundCompetition.teams[0];
    
    return {
        success: true,
        message: 'Competition Team Squad Acquired',
        data: {
            team: teamData.team,
            squad: teamData.squadList.sort((a, b) => a.number - b.number)
        }
    };
}

exports.getCompetitionStandings = async ({ competitionId }) => {
    const competition = await db.FootballCompetition.findById(competitionId)
        .populate({
            path: 'leagueTable.team',
            select: 'name shorthand logo'
        });

    if (!competition) return { success: false, message: 'Invalid Competition' };

    const table = competition.leagueTable
        .sort((a, b) => {
            // Sort by points, then GD, then GF
            if (b.points !== a.points) return b.points - a.points;
            if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
            return b.goalsFor - a.goalsFor;
        })
        .map((team, index) => ({
            ...team.toObject(),
            position: index + 1
        }));

    return { 
        success: true, 
        message: 'League Table Acquired', 
        data: table 
    };
}

exports.getCompetitionKnockouts = async ({ competitionId }) => {
    const competition = await db.FootballCompetition.findById(competitionId)
        .populate([
            {
                path: 'knockoutRounds.fixtures',
                select: 'homeTeam awayTeam date result status',
                populate: [
                    {
                        path: 'homeTeam',
                        select: 'name shorthand logo'
                    },
                    {
                        path: 'awayTeam',
                        select: 'name shorthand logo'
                    }
                ]
            }
        ]);

    if (!competition) return { success: false, message: 'Invalid Competition' };

    // Add bracket visualization data
    const roundsWithBrackets = competition.knockoutRounds.map(round => ({
        ...round.toObject(),
        bracket: generateBracketData(round.fixtures)
    }));

    return { 
        success: true, 
        message: 'Knockout Rounds Acquired', 
        data: roundsWithBrackets 
    };
}

// Helper function for bracket generation
function generateBracketData( fixtures ) {
    return fixtures.map(f => ({
        id: f._id,
        teams: [f.homeTeam, f.awayTeam],
        score: f.result ? [f.result.homeScore, f.result.awayScore] : null,
        penaltyScore: f.result && f.result.isPenaltyShootout ? [f.result.homePenalty, f.result.awayPenalty] : null,
        winner: f.result?.winner,
        date: f.date
    }));
}

exports.getCompetitionGroups = async ({ competitionId }) => {
    const competition = await db.FootballCompetition.findById(competitionId)
        .populate([
            {
                path: 'groupStage.standings.team',
                select: 'name shorthand logo'
            }
        ]);

    if (!competition) return { success: false, message: 'Invalid Competition' };

    // Sort each group's standings
    const sortedGroups = competition.groupStage.map(group => ({
        ...group.toObject(),
        standings: group.standings.sort((a, b) => {
            if (b.points !== a.points) return b.points - a.points;
            if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
            return b.goalsFor - a.goalsFor;
        }).map((team, index) => ({
            ...team.toObject(),
            position: index + 1
        }))
    }));

    return { 
        success: true, 
        message: 'All Groups Acquired', 
        data: sortedGroups 
    };
}

exports.getCompetitionSingleGroup = async ({ competitionId, groupName }) => {
    const competition = await db.FootballCompetition.findById(competitionId)
        .populate([
            {
                path: 'groupStage.standings.team',
                select: 'name shorthand logo stats'
            },
            {
                path: 'groupStage.fixtures',
                select: 'homeTeam awayTeam date result status',
                populate: [
                    {
                        path: 'homeTeam',
                        select: 'name shorthand logo'
                    },
                    {
                        path: 'awayTeam',
                        select: 'name shorthand logo'
                    }
                ]
            }
        ]);

    if (!competition) return { success: false, message: 'Invalid Competition' };

    const group = competition.groupStage.find(g => g.name === groupName);
    if (!group) return { success: false, message: 'Group not found' };

    // Sort standings
    const sortedStandings = group.standings.sort((a, b) => {
        if (b.points !== a.points) return b.points - a.points;
        if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
        return b.goalsFor - a.goalsFor;
    }).map((team, index) => ({
        ...team.toObject(),
        position: index + 1
    }));

    return { 
        success: true, 
        message: 'Single Group Acquired', 
        data: {
            ...group.toObject(),
            standings: sortedStandings,
            fixtures: group.fixtures.sort((a, b) => a.date - b.date)
        } 
    };
}

exports.createCompetition = async ({ name, sportType, description, rounds, startDate, endDate, format, rules }, { userId, auditInfo }) => {
    // Validate dates
    if (new Date(startDate) >= new Date(endDate)) {
        return { success: false, message: 'End date must be after start date' };
    }

    // Create competition with additional validation
    const competition = await db.FootballCompetition.create({
        name,
        sportType,
        description,
        rounds,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        format,
        rules,
        createdBy: userId,
        admin: userId
    });

    // Log action with more details
    logActionManually({
        userId,
        auditInfo,
        action: 'CREATE',
        entity: 'FootballCompetition',
        entityId: competition._id,
        details: {
            message: `Created competition: ${name}`,
            competitionType: format,
            duration: `${competition.startDate.toDateString()} to ${competition.endDate.toDateString()}`
        }
    });
    
    return { 
        success: true, 
        message: 'Competition created successfully', 
        data: competition 
    };
};

exports.updateCompetition = async ({ competitionId }, updates, { userId, auditInfo }) => {
    const allowedUpdates = ['name', 'description', 'rounds', 'startDate', 'endDate', 'format', 'rules'];
    const updatesToApply = Object.keys(updates)
        .filter(key => allowedUpdates.includes(key))
        .reduce((obj, key) => {
            obj[key] = updates[key];
            return obj;
        }, {});

    if (Object.keys(updatesToApply).length === 0) {
        return { success: false, message: 'No valid updates provided' };
    }

    // Check date validity if being updated
    if (updatesToApply.startDate && updatesToApply.endDate && 
        new Date(updatesToApply.startDate) >= new Date(updatesToApply.endDate)) {
        return { success: false, message: 'End date must be after start date' };
    }

    const foundCompetition = await db.FootballCompetition.findById(competitionId);
    if (!foundCompetition) return { success: false, message: 'Competition not found' };

    // Check if competition has started
    if (foundCompetition.status !== 'upcoming') {
        return { success: false, message: 'Cannot update ongoing or completed competition' };
    }

    const updatedCompetition = await db.FootballCompetition.findByIdAndUpdate(
        competitionId,
        updatesToApply,
        { new: true, runValidators: true }
    );

    // Get changed fields
    const changedFields = Object.keys(updatesToApply).filter(key => 
        JSON.stringify(foundCompetition[key]) !== JSON.stringify(updatedCompetition[key])
    );

    if (changedFields.length > 0) {
        logActionManually({
            userId,
            auditInfo,
            action: 'UPDATE',
            entity: 'FootballCompetition',
            entityId: competitionId,
            details: {
                message: `Updated competition details`,
                changedFields,
                previousValues: foundCompetition.toObject(),
                newValues: updatedCompetition.toObject()
            }
        });
    }

    return { 
        success: true, 
        message: 'Competition updated successfully', 
        data: updatedCompetition 
    };
};

exports.updateCompetitionStatus = async ({ competitionId }, { status }, { userId, auditInfo }) => {
    const validTransitions = {
        upcoming: ['ongoing', 'cancelled'],
        ongoing: ['completed', 'cancelled'],
        completed: [],
        cancelled: []
    };

    const foundCompetition = await db.FootballCompetition.findById(competitionId);
    if (!foundCompetition) return { success: false, message: 'Competition not found' };

    // Validate status transition
    if (!validTransitions[foundCompetition.status].includes(status)) {
        return { success: false, message: `Invalid status transition from ${foundCompetition.status} to ${status}` };
    }

    const updatedCompetition = await db.FootballCompetition.findByIdAndUpdate(
        competitionId,
        { status },
        { new: true }
    );

    logActionManually({
        userId,
        auditInfo,
        action: 'STATUS_CHANGE',
        entity: 'FootballCompetition',
        entityId: competitionId,
        details: {
            message: `Competition status changed from ${foundCompetition.status} to ${status}`,
            previousStatus: foundCompetition.status,
            newStatus: status
        }
    });

    return { 
        success: true, 
        message: 'Competition status updated', 
        data: updatedCompetition 
    };
};

exports.inviteTeamsToCompetition = async ({ competitionId }, { teamIds }, { userId, auditInfo }) => {
    if (!Array.isArray(teamIds) || teamIds.length === 0) {
        return { success: false, message: 'No team IDs provided' };
    }

    const [competition, existingTeams] = await Promise.all([
        db.FootballCompetition.findById(competitionId),
        db.FootballTeam.find({ _id: { $in: teamIds } })
    ]);

    if (!competition) return { success: false, message: 'Competition not found' };

    const validTeamIds = existingTeams.map(team => team._id);
    const invalidTeamIds = teamIds.filter(id => !validTeamIds.includes(id));

    // Bulk update teams with new invitations
    const bulkOps = validTeamIds.map(teamId => ({
        updateOne: {
            filter: { 
                _id: teamId,
                'competitionInvitations.competition': { $ne: competitionId }
            },
            update: {
                $addToSet: {
                    competitionInvitations: {
                        competition: competitionId,
                        status: 'pending',
                        registrationDate: new Date()
                    }
                }
            }
        }
    }));

    if (bulkOps.length > 0) {
        await db.FootballTeam.bulkWrite(bulkOps);
    }

    // Log action for each team
    await Promise.all(existingTeams.map(async team => {
        logActionManually({
            userId,
            auditInfo,
            action: 'INVITE',
            entity: 'FootballTeam',
            entityId: team._id,
            details: {
                message: `Invited to competition: ${competition.name}`,
                competitionId,
                competitionName: competition.name
            }
        });
    }));

    return {
        success: true,
        message: 'Team invitations processed',
        data: {
            invitedTeams: validTeamIds.length,
            invalidTeamIds,
            duplicateInvites: teamIds.length - validTeamIds.length - invalidTeamIds.length
        }
    };
};

exports.addTeamsToCompetition = async ({ competitionId }, { teamIds }, { userId, auditInfo }) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        if (!Array.isArray(teamIds)) {
            throw new Error('Invalid team IDs format');
        }

        const competition = await db.FootballCompetition.findById(competitionId).session(session);
        if (!competition) {
            throw new Error('Competition not found');
        }

        const teams = await db.FootballTeam.find({ _id: { $in: teamIds } }).session(session);
        const validTeamIds = teams.map(team => team._id);
        const invalidTeamIds = teamIds.filter(id => !validTeamIds.includes(id));

        // Update team invitations and add to competition
        await Promise.all(teams.map(async team => {
            await db.FootballTeam.updateOne(
                { _id: team._id },
                {
                    $set: {
                        'competitionInvitations.$[elem].status': 'accepted'
                    }
                },
                {
                    arrayFilters: [{ 'elem.competition': competitionId }],
                    session
                }
            );
        }));

        await db.FootballCompetition.updateOne(
            { _id: competitionId },
            {
                $addToSet: {
                    teams: { $each: validTeamIds.map(teamId => ({ team: teamId })) }
                }
            },
            { session }
        );

        await session.commitTransaction();

        // Log actions
        await Promise.all(teams.map(team => {
            logActionManually({
                userId,
                auditInfo,
                action: 'TEAM_ADD',
                entity: 'FootballTeam',
                entityId: team._id,
                details: {
                    message: `Added to competition: ${competition.name}`,
                    competitionId
                }
            });
        }));

        logActionManually({
            userId,
            auditInfo,
            action: 'UPDATE',
            entity: 'FootballCompetition',
            entityId: competitionId,
            details: {
                message: `Added ${validTeamIds.length} teams to competition`,
                addedTeams: validTeamIds
            }
        });

        const updatedCompetition = await db.FootballCompetition.findById(competitionId)
            .populate('teams.team', 'name shorthand');

        return {
            success: true,
            message: 'Teams added to competition',
            data: {
                competition: updatedCompetition,
                invalidTeamIds
            }
        };
    } catch (error) {
        await session.abortTransaction();
        return { success: false, message: error.message };
    } finally {
        session.endSession();
    }
};

exports.removeTeamFromCompetition = async ({ competitionId, teamId }, { userId, auditInfo }) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const [competition, team] = await Promise.all([
            db.FootballCompetition.findById(competitionId).session(session),
            db.FootballTeam.findById(teamId).session(session)
        ]);

        if (!competition) throw new Error('Competition not found');
        if (!team) throw new Error('Team not found');
        if (competition.status !== 'upcoming') throw new Error('Cannot remove teams from ongoing/completed competition');

        const isTeamInCompetition = competition.teams.some(t => t.team.equals(teamId));
        if (!isTeamInCompetition) throw new Error('Team not in competition');

        // Update team invitation status
        await db.FootballTeam.updateOne(
            { _id: teamId, 'competitionInvitations.competition': competitionId },
            { $set: { 'competitionInvitations.$.status': 'rejected' } },
            { session }
        );

        // Remove from competition
        await db.FootballCompetition.updateOne(
            { _id: competitionId },
            { $pull: { teams: { team: teamId } } },
            { session }
        );

        await session.commitTransaction();

        // Log actions
        logActionManually({
            userId,
            auditInfo,
            action: 'TEAM_REMOVE',
            entity: 'FootballTeam',
            entityId: teamId,
            details: {
                message: `Removed from competition: ${competition.name}`,
                competitionId
            }
        });

        logActionManually({
            userId,
            auditInfo,
            action: 'UPDATE',
            entity: 'FootballCompetition',
            entityId: competitionId,
            details: {
                message: `Removed team: ${team.name}`,
                removedTeam: teamId
            }
        });

        const updatedCompetition = await db.FootballCompetition.findById(competitionId)
            .populate('teams.team', 'name shorthand');

        return {
            success: true,
            message: 'Team removed from competition',
            data: updatedCompetition
        };
    } catch (error) {
        await session.abortTransaction();
        return { success: false, message: error.message };
    } finally {
        session.endSession();
    }
};

exports.registerTeamSquadList = async ({ competitionId, teamId }, { players }, { userId, auditInfo }) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        // Validate input
        if (!Array.isArray(players) || players.length === 0) {
            throw new Error('Invalid players array');
        }

        // Check competition exists
        const competition = await db.FootballCompetition.findById(competitionId).session(session);
        if (!competition) throw new Error('Competition not found');

        // Check team is in competition
        const teamInCompetition = competition.teams.find(t => t.team.toString() === teamId);
        if (!teamInCompetition) throw new Error('Team not in competition');

        // Get all valid players for this team
        const teamPlayers = await db.FootballPlayer.find(
            { baseTeam: teamId },
            '_id',
            { session }
        );
        const validPlayerIds = teamPlayers.map(p => p._id.toString());

        // Validate all provided players belong to the team
        const invalidPlayers = players.filter(p => !validPlayerIds.includes(p));
        if (invalidPlayers.length > 0) {
            throw new Error(`Invalid players: ${invalidPlayers.join(', ')}`);
        }

        // Update squad list
        teamInCompetition.squadList = players;
        await competition.save({ session });

        // Log action
        logActionManually({
            userId,
            auditInfo,
            action: 'UPDATE_SQUAD',
            entity: 'FootballCompetition',
            entityId: competitionId,
            details: {
                message: `Updated squad list for team ${teamId}`,
                teamId,
                playerCount: players.length
            }
        });

        await session.commitTransaction();

        return { 
            success: true, 
            message: 'Squad list updated successfully',
            data: {
                teamId,
                playerCount: players.length
            }
        };
    } catch (error) {
        await session.abortTransaction();
        return { success: false, message: error.message };
    } finally {
        session.endSession();
    }
};

// Start Competition And Set Table From Array Of Teams In Competition
exports.initializeLeagueTable = async ({ competitionId }, { userId, auditInfo }) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        // Check competition exists
        const competition = await db.FootballCompetition.findById(competitionId).session(session);
        if (!competition) throw new Error('Competition not found');
        
        // Validate competition type
        if (competition.format !== 'league') {
            throw new Error('Only league competitions can initialize tables');
        }

        // Check if already initialized
        if (competition.leagueTable && competition.leagueTable.length > 0) {
            throw new Error('League table already initialized');
        }

        // Validate has teams
        if (competition.teams.length === 0) {
            throw new Error('Cannot initialize table - no teams in competition');
        }

        // Initialize table
        competition.leagueTable = competition.teams.map((team, index) => ({
            team: team.team,
            played: 0,
            points: 0,
            wins: 0,
            losses: 0,
            draws: 0,
            goalsFor: 0,
            goalsAgainst: 0,
            goalDifference: 0,
            form: [],
            position: index + 1
        }));

        competition.status = 'ongoing';
        await competition.save({ session });

        // Log action
        logActionManually({
            userId,
            auditInfo,
            action: 'INIT_TABLE',
            entity: 'FootballCompetition',
            entityId: competitionId,
            details: {
                message: 'League table initialized',
                teamCount: competition.teams.length
            }
        });

        await session.commitTransaction();

        // Get populated result
        const result = await db.FootballCompetition.findById(competitionId)
            .populate('leagueTable.team', 'name shorthand')
            .lean();

        return {
            success: true,
            message: 'League table initialized successfully',
            data: result.leagueTable
        };
    } catch (error) {
        await session.abortTransaction();
        return { success: false, message: error.message };
    } finally {
        session.endSession();
    }
};

exports.addKnockoutPhases = async ({ competitionId }, { name, fixtureFormat }, { userId, auditInfo }) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        // Validate input
        if (!name || !fixtureFormat) {
            throw new Error('Name and fixture format are required');
        }

        // Check competition exists
        const competition = await db.FootballCompetition.findById(competitionId).session(session);
        if (!competition) throw new Error('Competition not found');

        // Validate competition type
        if (competition.format === 'league') {
            throw new Error('Cannot add knockout phases to league competition');
        }

        // Check if round name already exists
        if (competition.knockoutRounds.some(r => r.name === name)) {
            throw new Error('Round with this name already exists');
        }

        // Add new round
        const newRound = {
            name,
            fixtureFormat,
            fixtures: [],
            completed: false
        };

        competition.knockoutRounds.push(newRound);
        await competition.save({ session });

        // Log action
        logActionManually({
            userId,
            auditInfo,
            action: 'ADD_KNOCKOUT',
            entity: 'FootballCompetition',
            entityId: competitionId,
            details: {
                message: `Added knockout round: ${name}`,
                roundName: name,
                fixtureFormat
            }
        });

        await session.commitTransaction();

        return {
            success: true,
            message: 'Knockout round added successfully',
            data: newRound
        };
    } catch (error) {
        await session.abortTransaction();
        return { success: false, message: error.message };
    } finally {
        session.endSession();
    }
};

exports.addGroupStage = async ({ competitionId }, { name }, { userId, auditInfo }) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        // Validate input
        if (!name) throw new Error('Group name is required');

        // Check competition exists
        const competition = await db.FootballCompetition.findById(competitionId).session(session);
        if (!competition) throw new Error('Competition not found');

        // Validate competition type
        if (competition.format !== 'hybrid') {
            throw new Error('Only hybrid competitions can add group stages');
        }

        // Check if group name exists
        if (competition.groupStage.some(g => g.name === name)) {
            throw new Error('Group with this name already exists');
        }

        // Add new group
        const newGroup = {
            name,
            fixtures: [],
            standings: []
        };

        competition.groupStage.push(newGroup);
        await competition.save({ session });

        // Log action
        logActionManually({
            userId,
            auditInfo,
            action: 'ADD_GROUP',
            entity: 'FootballCompetition',
            entityId: competitionId,
            details: {
                message: `Added group stage: ${name}`
            }
        });

        await session.commitTransaction();

        return {
            success: true,
            message: 'Group stage added successfully',
            data: newGroup
        };
    } catch (error) {
        await session.abortTransaction();
        return { success: false, message: error.message };
    } finally {
        session.endSession();
    }
};

exports.addCompetitionFixture = async ({ competitionId }, fixtureData, { userId, auditInfo }) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        // Validate required fields
        const { homeTeam, awayTeam, date, referee, stadium } = fixtureData;
        if (!homeTeam || !awayTeam || !date) {
            throw new Error('Home team, away team and date are required');
        }

        // Check competition exists
        const competition = await db.FootballCompetition.findById(competitionId).session(session);
        if (!competition) throw new Error('Competition not found');

        // Check teams are in competition
        const competitionTeamIds = competition.teams.map(t => t.team.toString());
        if (!competitionTeamIds.includes(homeTeam) || !competitionTeamIds.includes(awayTeam)) {
            throw new Error('One or both teams not in competition');
        }

        // Check not scheduling team against itself
        if (homeTeam === awayTeam) {
            throw new Error('A team cannot play against itself');
        }

        // Check date is valid
        if (new Date(date) < new Date(competition.startDate) || 
            new Date(date) > new Date(competition.endDate)) {
            throw new Error('Fixture date must be within competition dates');
        }

        // Create fixture
        const newFixture = await db.FootballFixture.create([{
            ...fixtureData,
            type: 'competition',
            competition: competitionId,
            status: 'scheduled',
            stadium
        }], { session });

        // Add fixture reference to competition
        if (fixtureData.matchWeek) {
            // For league fixtures
            await db.FootballCompetition.updateOne(
                { _id: competitionId },
                { $push: { fixtures: newFixture[0]._id } },
                { session }
            );
        }

        // Log action
        logActionManually({
            userId,
            auditInfo,
            action: 'CREATE_FIXTURE',
            entity: 'FootballFixture',
            entityId: newFixture[0]._id,
            details: {
                message: `Created fixture ${homeTeam} vs ${awayTeam}`,
                competitionId,
                date
            }
        });

        await session.commitTransaction();

        return {
            success: true,
            message: 'Fixture created successfully',
            data: newFixture[0]
        };
    } catch (error) {
        await session.abortTransaction();
        return { success: false, message: error.message };
    } finally {
        session.endSession();
    }
};

// Update Competition Fixture And Calculate Competition Standings/Rounds/Data
exports.updateCompetitionFixtureResult = async ({ competitionId, fixtureId }, updateData, { userId, auditInfo }) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        // Destructure update data
        const { result, statistics, matchEvents, homeSubs, awaySubs } = updateData;

        // Validate required fields
        if (!result || !result.homeScore || !result.awayScore) {
            throw new Error('Match result with scores is required');
        }

        // Get and validate fixture
        const fixture = await db.FootballFixture.findOne({
            _id: fixtureId,
            competition: competitionId
        }).session(session);

        if (!fixture) throw new Error('Fixture not found in competition');
        if (fixture.status === 'completed') throw new Error('Fixture already completed');

        // Get and validate competition
        const competition = await db.FootballCompetition.findById(competitionId)
            .populate([
                { path: 'leagueTable.team', select: 'name shorthand' },
                { path: 'groupStage.standings.team', select: 'name shorthand' },
                { path: 'knockoutRounds.fixtures', select: 'homeTeam awayTeam' }
            ])
            .session(session);

        if (!competition) throw new Error('Competition not found');

        // Save initial states for auditing
        const initialFixture = fixture.toObject();
        const initialCompetition = competition.toObject();

        // Update statistics if provided
        if (statistics) {
            if (!fixture.statistics) {
                const statsDoc = await db.FootballMatchStatistic.create([{
                    fixture: fixtureId,
                    home: statistics.home,
                    away: statistics.away
                }], { session });
                fixture.statistics = statsDoc[0]._id;
            } else {
                await db.FootballMatchStatistic.findByIdAndUpdate(
                    fixture.statistics,
                    { home: statistics.home, away: statistics.away },
                    { session }
                );
            }
        }

        // Update lineups if subs provided
        if (homeSubs) {
            fixture.homeLineup.subs = homeSubs;
        }
        if (awaySubs) {
            fixture.awayLineup.subs = awaySubs;
        }

        // Process match events if provided
        if (matchEvents && matchEvents.length > 0) {
            await processMatchEvents(fixture, matchEvents, competitionId, session);
        }

        // Update fixture result and status
        fixture.result = result;
        fixture.status = 'completed';
        await fixture.save({ session });

        // Update player appearances
        await updatePlayerAppearances(fixture, competitionId, session);

        // Update competition statistics
        await updateCompetitionStats(competition, fixture, statistics, session);

        // Update competition standings based on format
        await updateCompetitionStandings(competition, fixture, session);

        // Commit all changes
        await session.commitTransaction();

        // Log actions
        await logFixtureUpdate(userId, auditInfo, fixture, initialFixture);
        await logCompetitionUpdate(userId, auditInfo, competition, initialCompetition);

        // Return updated data
        const updatedCompetition = await db.FootballCompetition.findById(competitionId)
            .populate([
                { path: 'leagueTable.team', select: 'name shorthand' },
                { path: 'groupStage.standings.team', select: 'name shorthand' },
                { path: 'knockoutRounds.fixtures', select: 'homeTeam awayTeam' }
            ]);

        return {
            success: true,
            message: 'Fixture and competition updated successfully',
            data: {
                fixture: await db.FootballFixture.findById(fixtureId),
                competition: updatedCompetition
            }
        };

    } catch (error) {
        await session.abortTransaction();
        return { success: false, message: error.message };
    } finally {
        session.endSession();
    }
};

// Helper functions
async function processMatchEvents(fixture, matchEvents, competitionId, session) {
    fixture.matchEvents = matchEvents;

    const eventProcessors = {
        goal: { field: 'goals', count: 1 },
        ownGoal: { field: 'ownGoals', count: 1 },
        assist: { field: 'assists', count: 1 },
        yellowCard: { field: 'yellowCards', count: 1 },
        redCard: { field: 'redCards', count: 1 }
    };

    const eventsByType = {};
    Object.keys(eventProcessors).forEach(type => {
        eventsByType[type] = matchEvents.filter(e => e.eventType === type);
    });

    // Process all event types in parallel
    await Promise.all(
        Object.entries(eventProcessors).map(([type, { field, count }]) => {
            const events = eventsByType[type];
            if (events.length === 0) return;

            const updates = events.map(event => ({
                playerId: event.player,
                count,
                team: event.team
            }));

            return processStatUpdate(updates, field, competitionId, session);
        })
    );

    // Process goal scorers
    const goals = [...eventsByType.goal, ...eventsByType.ownGoal];
    goals.forEach(goal => {
        fixture.goalScorers.push({
            id: goal.player,
            team: goal.team,
            time: goal.time
        });
    });

    // Process clean sheets
    await processCleanSheets(fixture, competitionId, session);
}

async function processCleanSheets(fixture, competitionId, session) {
    const homeConceded = fixture.result.awayScore > 0;
    const awayConceded = fixture.result.homeScore > 0;

    const processTeamCleanSheets = async (lineup, conceded) => {
        if (!lineup?.startingXI) return;
        
        const goalkeepers = lineup.startingXI.filter(p => p.position === 'GK');
        await Promise.all(
            goalkeepers.map(async (player) => {
                if (!conceded) {
                    await updatePlayerGeneralRecord(player._id, 'cleanSheets', 1, session);
                    await updatePlayerCompetitionStats(player._id, 'cleanSheets', 1, competitionId, session);
                }
            })
        );
    };

    await Promise.all([
        processTeamCleanSheets(fixture.homeLineup, homeConceded),
        processTeamCleanSheets(fixture.awayLineup, awayConceded)
    ]);
}

async function updatePlayerAppearances(fixture, competitionId, session) {
    const processTeamAppearances = async (lineup) => {
        if (!lineup?.startingXI) return;
        const players = [...lineup.startingXI, ...(lineup.subs || [])];
        await processAppearanceUpdate(players, competitionId, session);
    };

    await Promise.all([
        processTeamAppearances(fixture.homeLineup),
        processTeamAppearances(fixture.awayLineup)
    ]);
}

async function updateCompetitionStats(competition, fixture, statistics, session) {
    const isHomeWin = fixture.result.homeScore > fixture.result.awayScore;
    const isAwayWin = fixture.result.awayScore > fixture.result.homeScore;
    const isDraw = !isHomeWin && !isAwayWin;

    const totalGames = await db.FootballFixture.countDocuments({
        competition: competition._id,
        status: 'completed'
    }).session(session);

    // Update win/draw percentages
    if (isHomeWin) {
        competition.stats.homeWinsPercentage = calculatePercentage(competition.stats.homeWinsPercentage, totalGames, 1);
        competition.stats.awayWinsPercentage = calculatePercentage(competition.stats.awayWinsPercentage, totalGames, 0);
        competition.stats.drawsPercentage = calculatePercentage(competition.stats.drawsPercentage, totalGames, 0);
    } else if (isAwayWin) {
        competition.stats.homeWinsPercentage = calculatePercentage(competition.stats.homeWinsPercentage, totalGames, 0);
        competition.stats.awayWinsPercentage = calculatePercentage(competition.stats.awayWinsPercentage, totalGames, 1);
        competition.stats.drawsPercentage = calculatePercentage(competition.stats.drawsPercentage, totalGames, 0);
    } else if (isDraw) {
        competition.stats.homeWinsPercentage = calculatePercentage(competition.stats.homeWinsPercentage, totalGames, 0);
        competition.stats.awayWinsPercentage = calculatePercentage(competition.stats.awayWinsPercentage, totalGames, 0);
        competition.stats.drawsPercentage = calculatePercentage(competition.stats.drawsPercentage, totalGames, 1);
    }

    // Update cards stats if statistics provided
    if (statistics) {
        const totalYellows = statistics.home.yellowCards + statistics.away.yellowCards;
        const totalReds = statistics.home.redCards + statistics.away.redCards;

        competition.stats.yellowCardsAvg = calculatePercentage(competition.stats.yellowCardsAvg, totalGames, totalYellows);
        competition.stats.redCardsAvg = calculatePercentage(competition.stats.redCardsAvg, totalGames, totalReds);
    }

    // Update total goals
    competition.stats.totalGoals += (fixture.result.homeScore + fixture.result.awayScore);

    await competition.save({ session });
}

async function updateCompetitionStandings(competition, fixture, session) {
    const isHomeWin = fixture.result.homeScore > fixture.result.awayScore;
    const isAwayWin = fixture.result.awayScore > fixture.result.homeScore;
    const isDraw = !isHomeWin && !isAwayWin;

    const updateTeamStats = (teamStats, isHomeTeam) => {
        const goalsFor = isHomeTeam ? fixture.result.homeScore : fixture.result.awayScore;
        const goalsAgainst = isHomeTeam ? fixture.result.awayScore : fixture.result.homeScore;

        teamStats.played += 1;
        teamStats.goalsFor += goalsFor;
        teamStats.goalsAgainst += goalsAgainst;
        teamStats.goalDifference = teamStats.goalsFor - teamStats.goalsAgainst;

        if (isDraw) {
            teamStats.draws += 1;
            teamStats.points += 1;
            teamStats.form = addToFront(teamStats.form || [], 'D');
        } else if ((isHomeTeam && isHomeWin) || (!isHomeTeam && isAwayWin)) {
            teamStats.wins += 1;
            teamStats.points += 3;
            teamStats.form = addToFront(teamStats.form || [], 'W');
        } else {
            teamStats.losses += 1;
            teamStats.form = addToFront(teamStats.form || [], 'L');
        }

        return teamStats;
    };

    switch (competition.format) {
        case 'league':
            competition.leagueTable = competition.leagueTable.map(team => {
                if (team.team._id.equals(fixture.homeTeam)) {
                    return updateTeamStats(team, true);
                }
                if (team.team._id.equals(fixture.awayTeam)) {
                    return updateTeamStats(team, false);
                }
                return team;
            }).sort(sortStandings);
            break;

        case 'hybrid':
            competition.groupStage.forEach(group => {
                group.standings = group.standings.map(team => {
                    if (team.team._id.equals(fixture.homeTeam)) {
                        return updateTeamStats(team, true);
                    }
                    if (team.team._id.equals(fixture.awayTeam)) {
                        return updateTeamStats(team, false);
                    }
                    return team;
                }).sort(sortStandings);
            });
            break;

        case 'knockout':
            const currentRoundIndex = competition.knockoutRounds.findIndex(
                round => round.fixtures.some(f => f._id.equals(fixture._id))
            );

            if (currentRoundIndex !== -1 && currentRoundIndex < competition.knockoutRounds.length - 1) {
                const nextRound = competition.knockoutRounds[currentRoundIndex + 1];
                const winningTeam = isHomeWin ? fixture.homeTeam : fixture.awayTeam;
                
                if (!nextRound.teams.some(t => t.equals(winningTeam))) {
                    nextRound.teams.push(winningTeam);
                }
            }
            break;
    }

    await competition.save({ session });
}

function sortStandings(a, b) {
    if (b.points !== a.points) return b.points - a.points;
    if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
    if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor;
    return 0;
}

function addToFront(arr, item, maxLength = 5) {
    return [item, ...arr].slice(0, maxLength);
}

async function logFixtureUpdate(userId, auditInfo, fixture, initialFixture) {
    const changedFields = Object.keys(fixture.toObject()).filter(key => 
        JSON.stringify(initialFixture[key]) !== JSON.stringify(fixture[key])
    );

    if (changedFields.length > 0) {
        await logActionManually({
            userId,
            auditInfo,
            action: 'UPDATE',
            entity: 'FootballFixture',
            entityId: fixture._id,
            details: {
                message: 'Fixture result updated',
                changedFields
            },
            previousValues: initialFixture,
            newValues: fixture.toObject()
        });
    }
}

async function logCompetitionUpdate(userId, auditInfo, competition, initialCompetition) {
    const changedFields = Object.keys(competition.toObject()).filter(key => 
        JSON.stringify(initialCompetition[key]) !== JSON.stringify(competition[key])
    );

    if (changedFields.length > 0) {
        await logActionManually({
            userId,
            auditInfo,
            action: 'UPDATE',
            entity: 'FootballCompetition',
            entityId: competition._id,
            details: {
                message: 'Competition standings updated',
                changedFields
            },
            previousValues: initialCompetition,
            newValues: competition.toObject()
        });
    }
}

exports.deleteCompetitionFixture = async ({ competitionId, fixtureId }, { userId, auditInfo }) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        // Validate inputs
        if (!mongoose.Types.ObjectId.isValid(fixtureId)) {
            throw new Error('Invalid fixture ID');
        }

        // Find and delete fixture
        const deletedFixture = await db.FootballFixture.findOneAndDelete(
            { _id: fixtureId, competition: competitionId },
            { session }
        );

        if (!deletedFixture) {
            throw new Error('Fixture not found in competition');
        }

        // Log action
        await logActionManually({
            userId,
            auditInfo,
            action: 'DELETE',
            entity: 'FootballFixture',
            entityId: fixtureId,
            details: {
                message: 'Fixture deleted',
                competitionId
            },
            previousValues: deletedFixture.toObject(),
            newValues: null
        });

        await session.commitTransaction();

        return {
            success: true,
            message: 'Fixture deleted successfully',
            data: deletedFixture
        };
    } catch (error) {
        await session.abortTransaction();
        return { success: false, message: error.message };
    } finally {
        session.endSession();
    }
};

exports.addFixturesToKnockoutPhase = async ({ competitionId, fixtureId }, { roundName }, { userId, auditInfo }) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        // Validate inputs
        if (!roundName || !mongoose.Types.ObjectId.isValid(fixtureId)) {
            throw new Error('Round name and valid fixture ID are required');
        }

        // Get competition and validate
        const competition = await db.FootballCompetition.findById(competitionId).session(session);
        if (!competition) throw new Error('Competition not found');
        if (competition.format === 'league') throw new Error('Cannot add knockout fixtures to league competition');

        // Get fixture and validate
        const fixture = await db.FootballFixture.findById(fixtureId).session(session);
        if (!fixture || !fixture.competition.equals(competitionId)) {
            throw new Error('Fixture not found in competition');
        }

        // Find round
        const roundIndex = competition.knockoutRounds.findIndex(r => r.name === roundName);
        if (roundIndex === -1) throw new Error('Round not found in competition');

        // Check if fixture already exists in round
        if (competition.knockoutRounds[roundIndex].fixtures.some(f => f.equals(fixtureId))) {
            throw new Error('Fixture already exists in this round');
        }

        // Save initial state for audit
        const initialCompetition = competition.toObject();

        // Add fixture to round
        competition.knockoutRounds[roundIndex].fixtures.push(fixtureId);
        await competition.save({ session });

        // Log action
        await logActionManually({
            userId,
            auditInfo,
            action: 'UPDATE',
            entity: 'FootballCompetition',
            entityId: competitionId,
            details: {
                message: `Fixture added to ${roundName}`,
                roundName,
                fixtureId
            },
            previousValues: initialCompetition,
            newValues: competition.toObject()
        });

        await session.commitTransaction();

        return {
            success: true,
            message: 'Fixture added to knockout phase',
            data: competition.knockoutRounds[roundIndex]
        };
    } catch (error) {
        await session.abortTransaction();
        return { success: false, message: error.message };
    } finally {
        session.endSession();
    }
};

exports.addFixturesToGroupStage = async ({ competitionId, fixtureId }, { groupName }, { userId, auditInfo }) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        // Validate inputs
        if (!groupName || !mongoose.Types.ObjectId.isValid(fixtureId)) {
            throw new Error('Group name and valid fixture ID are required');
        }

        // Get competition and validate
        const competition = await db.FootballCompetition.findById(competitionId).session(session);
        if (!competition) throw new Error('Competition not found');
        if (competition.format !== 'hybrid') throw new Error('Only hybrid competitions have group stages');

        // Get fixture and validate
        const fixture = await db.FootballFixture.findById(fixtureId).session(session);
        if (!fixture || !fixture.competition.equals(competitionId)) {
            throw new Error('Fixture not found in competition');
        }

        // Find group
        const groupIndex = competition.groupStage.findIndex(g => g.name === groupName);
        if (groupIndex === -1) throw new Error('Group not found in competition');

        // Check if fixture already exists in group
        if (competition.groupStage[groupIndex].fixtures.some(f => f.equals(fixtureId))) {
            throw new Error('Fixture already exists in this group');
        }

        // Save initial state for audit
        const initialCompetition = competition.toObject();

        // Add fixture to group
        competition.groupStage[groupIndex].fixtures.push(fixtureId);
        await competition.save({ session });

        // Log action
        await logActionManually({
            userId,
            auditInfo,
            action: 'UPDATE',
            entity: 'FootballCompetition',
            entityId: competitionId,
            details: {
                message: `Fixture added to ${groupName}`,
                groupName,
                fixtureId
            },
            previousValues: initialCompetition,
            newValues: competition.toObject()
        });

        await session.commitTransaction();

        return {
            success: true,
            message: 'Fixture added to group stage',
            data: competition.groupStage[groupIndex]
        };
    } catch (error) {
        await session.abortTransaction();
        return { success: false, message: error.message };
    } finally {
        session.endSession();
    }
};

exports.addTeamsToGroupStage = async ({ competitionId, teamId }, { groupName }, { userId, auditInfo }) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        // Validate inputs
        if (!groupName || !mongoose.Types.ObjectId.isValid(teamId)) {
            throw new Error('Group name and valid team ID are required');
        }

        // Get competition and validate
        const competition = await db.FootballCompetition.findById(competitionId).session(session);
        if (!competition) throw new Error('Competition not found');
        if (competition.format !== 'hybrid') throw new Error('Only hybrid competitions have group stages');
        if (competition.status !== 'upcoming') throw new Error('Cannot modify teams in active competition');

        // Get team and validate
        const team = await db.FootballTeam.findById(teamId).session(session);
        if (!team) throw new Error('Team not found');
        if (!competition.teams.some(t => t.team.equals(teamId))) {
            throw new Error('Team not part of this competition');
        }

        // Find group
        const groupIndex = competition.groupStage.findIndex(g => g.name === groupName);
        if (groupIndex === -1) throw new Error('Group not found in competition');

        // Check if team already exists in group
        if (competition.groupStage[groupIndex].standings.some(s => s.team.equals(teamId))) {
            throw new Error('Team already exists in this group');
        }

        // Save initial state for audit
        const initialCompetition = competition.toObject();

        // Add team to group
        competition.groupStage[groupIndex].standings.push({
            team: teamId,
            played: 0,
            points: 0,
            wins: 0,
            losses: 0,
            draws: 0,
            goalsFor: 0,
            goalsAgainst: 0,
            goalDifference: 0,
            form: [],
            position: 0
        });

        await competition.save({ session });

        // Log action
        await logActionManually({
            userId,
            auditInfo,
            action: 'UPDATE',
            entity: 'FootballCompetition',
            entityId: competitionId,
            details: {
                message: `Team added to ${groupName}`,
                groupName,
                teamId
            },
            previousValues: initialCompetition,
            newValues: competition.toObject()
        });

        await session.commitTransaction();

        return {
            success: true,
            message: 'Team added to group stage',
            data: competition.groupStage[groupIndex]
        };
    } catch (error) {
        await session.abortTransaction();
        return { success: false, message: error.message };
    } finally {
        session.endSession();
    }
};

exports.removeFixtureFromKnockoutPhase = async ({ competitionId, fixtureId }, { roundName }, { userId, auditInfo }) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        // Validate inputs
        if (!roundName || !mongoose.Types.ObjectId.isValid(fixtureId)) {
            throw new Error('Round name and valid fixture ID are required');
        }

        // Get competition and validate
        const competition = await db.FootballCompetition.findById(competitionId).session(session);
        if (!competition) throw new Error('Competition not found');
        if (competition.format === 'league') throw new Error('Cannot modify knockout phases in league competition');

        // Get fixture and validate
        const fixture = await db.FootballFixture.findById(fixtureId).session(session);
        if (!fixture || !fixture.competition.equals(competitionId)) {
            throw new Error('Fixture not found in competition');
        }

        // Find round
        const roundIndex = competition.knockoutRounds.findIndex(r => r.name === roundName);
        if (roundIndex === -1) throw new Error('Round not found in competition');

        // Save initial state for audit
        const initialCompetition = competition.toObject();

        // Remove fixture from round
        competition.knockoutRounds[roundIndex].fixtures = competition.knockoutRounds[roundIndex].fixtures.filter(
            f => !f.equals(fixtureId)
        );

        await competition.save({ session });

        // Log action
        await logActionManually({
            userId,
            auditInfo,
            action: 'UPDATE',
            entity: 'FootballCompetition',
            entityId: competitionId,
            details: {
                message: `Fixture removed from ${roundName}`,
                roundName,
                fixtureId
            },
            previousValues: initialCompetition,
            newValues: competition.toObject()
        });

        await session.commitTransaction();

        return {
            success: true,
            message: 'Fixture removed from knockout phase',
            data: competition.knockoutRounds[roundIndex]
        };
    } catch (error) {
        await session.abortTransaction();
        return { success: false, message: error.message };
    } finally {
        session.endSession();
    }
};

exports.removeFixtureFromGroupStage = async ({ competitionId, fixtureId }, { groupName }, { userId, auditInfo }) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        // Validate inputs
        if (!groupName || !mongoose.Types.ObjectId.isValid(fixtureId)) {
            throw new Error('Group name and valid fixture ID are required');
        }

        // Get competition and validate
        const competition = await db.FootballCompetition.findById(competitionId).session(session);
        if (!competition) throw new Error('Competition not found');
        if (competition.format !== 'hybrid') throw new Error('Only hybrid competitions have group stages');

        // Get fixture and validate
        const fixture = await db.FootballFixture.findById(fixtureId).session(session);
        if (!fixture || !fixture.competition.equals(competitionId)) {
            throw new Error('Fixture not found in competition');
        }

        // Find group
        const groupIndex = competition.groupStage.findIndex(g => g.name === groupName);
        if (groupIndex === -1) throw new Error('Group not found in competition');

        // Save initial state for audit
        const initialCompetition = competition.toObject();

        // Remove fixture from group
        competition.groupStage[groupIndex].fixtures = competition.groupStage[groupIndex].fixtures.filter(
            f => !f.equals(fixtureId)
        );

        await competition.save({ session });

        // Log action
        await logActionManually({
            userId,
            auditInfo,
            action: 'UPDATE',
            entity: 'FootballCompetition',
            entityId: competitionId,
            details: {
                message: `Fixture removed from ${groupName}`,
                groupName,
                fixtureId
            },
            previousValues: initialCompetition,
            newValues: competition.toObject()
        });

        await session.commitTransaction();

        return {
            success: true,
            message: 'Fixture removed from group stage',
            data: competition.groupStage[groupIndex]
        };
    } catch (error) {
        await session.abortTransaction();
        return { success: false, message: error.message };
    } finally {
        session.endSession();
    }
};

exports.removeTeamFromGroupStage = async ({ competitionId, teamId }, { groupName }, { userId, auditInfo }) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        // Validate inputs
        if (!groupName || !mongoose.Types.ObjectId.isValid(teamId)) {
            throw new Error('Group name and valid team ID are required');
        }

        // Get competition and validate
        const competition = await db.FootballCompetition.findById(competitionId).session(session);
        if (!competition) throw new Error('Competition not found');
        if (competition.format !== 'hybrid') throw new Error('Only hybrid competitions have group stages');
        if (competition.status !== 'upcoming') throw new Error('Cannot modify teams in active competition');

        // Get team and validate
        const team = await db.FootballTeam.findById(teamId).session(session);
        if (!team) throw new Error('Team not found');
        if (!competition.teams.some(t => t.team.equals(teamId))) {
            throw new Error('Team not part of this competition');
        }

        // Find group
        const groupIndex = competition.groupStage.findIndex(g => g.name === groupName);
        if (groupIndex === -1) throw new Error('Group not found in competition');

        // Check if team exists in group
        if (!competition.groupStage[groupIndex].standings.some(s => s.team.equals(teamId))) {
            throw new Error('Team not found in this group');
        }

        // Save initial state for audit
        const initialCompetition = competition.toObject();

        // Remove team from group
        competition.groupStage[groupIndex].standings = competition.groupStage[groupIndex].standings.filter(
            s => !s.team.equals(teamId)
        );

        await competition.save({ session });

        // Log action
        await logActionManually({
            userId,
            auditInfo,
            action: 'UPDATE',
            entity: 'FootballCompetition',
            entityId: competitionId,
            details: {
                message: `Team removed from ${groupName}`,
                groupName,
                teamId
            },
            previousValues: initialCompetition,
            newValues: competition.toObject()
        });

        await session.commitTransaction();

        return {
            success: true,
            message: 'Team removed from group stage',
            data: competition.groupStage[groupIndex]
        };
    } catch (error) {
        await session.abortTransaction();
        return { success: false, message: error.message };
    } finally {
        session.endSession();
    }
};

exports.makeFeatured = async ({ competitionId }, { userId, auditInfo }) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        // Validate input
        if (!mongoose.Types.ObjectId.isValid(competitionId)) {
            throw new Error('Invalid competition ID');
        }

        // Get current featured competition
        const currentFeatured = await db.FootballCompetition.findOne(
            { isFeatured: true },
            null,
            { session }
        );

        // Set new featured competition
        const newFeatured = await db.FootballCompetition.findByIdAndUpdate(
            competitionId,
            { isFeatured: true },
            { new: true, session }
        );

        if (!newFeatured) throw new Error('Competition not found');

        // Unset previous featured if exists
        if (currentFeatured) {
            await db.FootballCompetition.findByIdAndUpdate(
                currentFeatured._id,
                { isFeatured: false },
                { session }
            );
        }

        // Log action
        await logActionManually({
            userId,
            auditInfo,
            action: 'UPDATE',
            entity: 'FootballCompetition',
            entityId: competitionId,
            details: {
                message: 'Competition featured status updated',
                previousFeatured: currentFeatured?._id || null
            },
            previousValues: { isFeatured: false },
            newValues: { isFeatured: true }
        });

        await session.commitTransaction();

        return {
            success: true,
            message: 'Competition featured status updated',
            data: newFeatured
        };
    } catch (error) {
        await session.abortTransaction();
        return { success: false, message: error.message };
    } finally {
        session.endSession();
    }
};

exports.setCompetitionAdmin = async ({ competitionId }, { adminId }, { userId, auditInfo }) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        // Validate inputs
        if (!mongoose.Types.ObjectId.isValid(adminId)) {
            throw new Error('Invalid admin ID');
        }

        // Get admin and validate
        const admin = await db.RefactoredUser.findById(adminId).session(session);
        if (!admin || admin.role !== 'sportAdmin' || !admin.sports.some(s => s.role === 'competitionAdmin')) {
            throw new Error('User is not a valid competition admin');
        }

        // Get competition and validate
        const competition = await db.FootballCompetition.findById(competitionId).session(session);
        if (!competition) throw new Error('Competition not found');

        // Save previous admin for audit
        const previousAdmin = competition.admin;

        // Update admin
        competition.admin = adminId;
        await competition.save({ session });

        // Log action
        await logActionManually({
            userId,
            auditInfo,
            action: 'UPDATE',
            entity: 'FootballCompetition',
            entityId: competitionId,
            details: {
                message: 'Competition admin updated',
                previousAdmin,
                newAdmin: adminId
            },
            previousValues: { admin: previousAdmin },
            newValues: { admin: adminId }
        });

        await session.commitTransaction();

        return {
            success: true,
            message: 'Competition admin updated',
            data: {
                ...competition.toObject(),
                admin: {
                    _id: admin._id,
                    name: admin.name
                }
            }
        };
    } catch (error) {
        await session.abortTransaction();
        return { success: false, message: error.message };
    } finally {
        session.endSession();
    }
};

exports.deleteCompetition = async ({ competitionId }, { userId, auditInfo }) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        // Validate input
        if (!mongoose.Types.ObjectId.isValid(competitionId)) {
            throw new Error('Invalid competition ID');
        }

        // Get competition and validate
        const competition = await db.FootballCompetition.findById(competitionId).session(session);
        if (!competition) throw new Error('Competition not found');

        // Check if competition has active fixtures
        const hasFixtures = await db.FootballFixture.exists({
            competition: competitionId,
            status: { $in: ['upcoming', 'ongoing'] }
        }).session(session);

        if (hasFixtures) {
            throw new Error('Cannot delete competition with active fixtures');
        }

        // Delete competition
        await db.FootballCompetition.findByIdAndDelete(competitionId, { session });

        // Log action
        await logActionManually({
            userId,
            auditInfo,
            action: 'DELETE',
            entity: 'FootballCompetition',
            entityId: competitionId,
            details: {
                message: 'Competition deleted',
                name: competition.name,
                format: competition.format
            },
            previousValues: competition.toObject(),
            newValues: null
        });

        await session.commitTransaction();

        return {
            success: true,
            message: 'Competition deleted successfully',
            data: competition
        };
    } catch (error) {
        await session.abortTransaction();
        return { success: false, message: error.message };
    } finally {
        session.endSession();
    }
};

module.exports = exports;