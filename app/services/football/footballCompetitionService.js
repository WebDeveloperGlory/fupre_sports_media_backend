const db = require('../../config/db');
const { logActionManually } = require('../../middlewares/auditMiddleware');
const { addToFront, calculatePercentage } = require('../../utils/functionUtils');
const { processStatUpdate, updatePlayerGeneralRecord, processAppearanceUpdate } = require('../../utils/football/footballPlayerStatUtils');

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

exports.createCompetition = async ({ name, sportType, description, rounds, startDate, endDate, format, rules }, { userId, auditInfo } ) => {
    // Create competition
    const competition = await db.FootballCompetition.create({
        name, sportType, 
        description, rounds, 
        startDate, endDate, 
        format, rules
    });

    // Log action
    logActionManually({
        userId, auditInfo,
        action: 'CREATE',
        entity: 'FootballCompetition',
        entityId: competition._id,
        details: {
            message: `Competition Created`
        }
    });
    
    // Return success
    return { success: true, message: 'Competition Created', data: competition };
}

exports.updateCompetition = async ({ competitionId }, { name, description, rounds, startDate, endDate, format, rules }, { userId, auditInfo }) => {
    // Check if competition exists
    const foundCompetition = await db.FootballCompetition.findById( competitionId );
    if( !foundCompetition ) return { success: false, message: 'Invalid Competition' };

    // Update competition
    const updatedCompetition = await db.FootballCompetition.findByIdAndUpdate(
        competitionId,
        { name, description, rounds, startDate, endDate, format, rules },
        { new: true }
    );

    // Log action
    logActionManually({
        userId, auditInfo,
        action: 'UPDATE',
        entity: 'FootballCompetition',
        entityId: foundCompetition._id,
        details: {
            message: `Competition Updated`,
            affectedFields: [ 
                name !== undefined ? 'name' : null,
                description !== undefined ? 'description' : null,
                rounds !== undefined ? 'rounds' : null,
                startDate !== undefined ? 'startDate' : null,
                endDate !== undefined ? 'endDate' : null,
                format !== undefined ? 'format' : null,
                rules !== undefined ? 'rules' : null,
            ].filter(Boolean), // Remove null values
        },
        previousValues: foundCompetition.toObject(),
        newValues: updatedCompetition.toObject()
    });

    // Return success
    return { success: true, message: 'Competition Updated', data: updatedCompetition };
}

exports.updateCompetitionStatus = async ({ competitionId }, { status }, { userId, auditInfo }) => {
    // Check if competition exists
    const foundCompetition = await db.FootballCompetition.findById( competitionId );
    if( !foundCompetition ) return { success: false, message: 'Invalid Competition' };

    // Update competition
    const updatedCompetition = await db.FootballCompetition.findByIdAndUpdate(
        competitionId,
        { status },
        { new: true }
    );

    // Log action
    logActionManually({
        userId, auditInfo,
        action: 'UPDATE',
        entity: 'FootballCompetition',
        entityId: foundCompetition._id,
        details: {
            message: `Competition Updated`,
            affectedFields: [ 'status' ]
        },
        previousValues: foundCompetition.toObject(),
        newValues: updatedCompetition.toObject()
    });

    // Return success
    return { success: true, message: 'Competition Updated', data: updatedCompetition };
}

exports.inviteTeamsToCompetition = async ({ competitionId }, { teamIds }, { userId, auditInfo }) => {
    // Validate input
    if( !Array.isArray( teamIds ) ) return { success: false, message: 'Invalid Input Format' };

    // Check if competition exists
    const foundCompetition = await db.FootballCompetition.findById( competitionId );
    if( !foundCompetition ) return { success: false, message: 'Invalid Competition' };

    // Loop through teamIds
    const updates = teamIds.map( async ( teamId ) => {
        // Check if team exists
        const team = await db.FootballTeam.findById( teamId );
        if( !team ) {
            console.warn( 'Skipped A Team' );
            return null;
        }

        // Update competitionInvitations in team
        await db.FootballTeam.findByIdAndUpdate( 
            teamId, 
            { $addToSet: { competitionInvitations: foundCompetition._id } },
            { new: true }
        );

        // Log action
        logActionManually({
            userId, auditInfo,
            action: 'UPDATE',
            entity: 'FootballTeam',
            entityId: team._id,
            details: {
                message: `Competition Invitation Sent`,
                affectedFields: [ 'competitionInvitations' ]
            },
            previousValues: team.competitionInvitations,
            newValues: [ ...team.competitionInvitations, { competition: foundCompetition._id, status: 'pending' }]
        });

        return teamId
    });

    // Wait for updates and filter all invalidIds
    await Promise.all( updates );
    const validUpdates = updates.filter( id => id !== null );
    const invalidUpdates = updates.filter( id => id === null );

    // Return success
    return { success: true, message: 'Invitations Sent Successfully', data: { validUpdates, invalidUpdates } };
}

exports.addTeamsToCompetition = async ({ competitionId }, { teamIds }, { userId, auditInfo }) => {
    // Validate input
    if( !Array.isArray( teamIds ) ) return { success: false, message: 'Invalid Input Format' };

    // Check if competition exists
    const foundCompetition = await db.FootballCompetition.findById( competitionId );
    if( !foundCompetition ) return { success: false, message: 'Invalid Competition' };

    // Loop through teamIds
    const updates = teamIds.map( async ( teamId ) => {
        // Check if team exists
        const team = await db.FootballTeam.findById( teamId );
        if( !team ) {
            console.warn( 'Skipped A Team' );
            return null;
        }

        // Check if cpompetition invite has already been sent
        const competitionInvite = team.competitionInvitations.some( invite => invite.competition.equals( foundCompetition._id ) );
        if( competitionInvite ) {
            const updatedTeam = await db.FootballTeam.findOneAndUpdate(
                { _id: teamId, "competitionInvitations.competitions": foundCompetition._id },
                { $set: { "competitionInvitations.$.status": "accepted" } },
                { new: true }
            );
            const updatedCompetition = await db.FootballCompetition.findByIdAndUpdate(
                competitionId,
                { 
                    $addToSet: { 
                        teams: { 
                            team: updatedTeam._id 
                        } 
                    } 
                },
                { new: true }
            )

            // Log action
            logActionManually({
                userId, auditInfo,
                action: 'UPDATE',
                entity: 'FootballTeam',
                entityId: team._id,
                details: {
                    message: `Competition Invitation Sent`,
                    affectedFields: [ 'competitionInvitations' ]
                },
                previousValues: team.competitionInvitations,
                newValues: updatedTeam.competitionInvitations,
            });

            return updatedTeam
        } else {
            const updatedTeam = await db.FootballTeam.findByIdAndUpdate( 
                teamId,
                { 
                    $addToSet: { 
                        competitionInvitations: { 
                            competition: foundCompetition._id, 
                            status: 'accepted' 
                        }
                    } 
                },
                { new: true }
            );
            const updatedCompetition = await db.FootballCompetition.findByIdAndUpdate(
                competitionId,
                { 
                    $addToSet: { 
                        teams: { 
                            team: updatedTeam._id 
                        } 
                    } 
                },
                { new: true }
            )

            // Log action
            logActionManually({
                userId, auditInfo,
                action: 'UPDATE',
                entity: 'FootballTeam',
                entityId: team._id,
                details: {
                    message: `Competition Invitation Sent`,
                    affectedFields: [ 'competitionInvitations' ]
                },
                previousValues: team.competitionInvitations,
                newValues: [ ...team.competitionInvitations, { competition: foundCompetition._id, status: 'accepted' }]
            });

            return updatedTeam;
        }
    });

    // Wait for updates, filter all invalidIds and refresh competitions
    await Promise.all( updates );
    const validUpdates = updates.filter( id => id !== null );
    const invalidUpdates = updates.filter( id => id === null );
    const refreshedCompetition = await db.FootballCompetition.findById( competitionId ).populate({ path: 'teams.team', select: 'name shorthand' } );

    // Log action
    logActionManually({
        userId, auditInfo,
        action: 'UPDATE',
        entity: 'FootballCompetition',
        entityId: foundCompetition._id,
        details: {
            message: `Competition Teams Updated`,
            affectedFields: [ 'teams' ]
        },
        previousValues: foundCompetition,
        newValues: refreshedCompetition
    });

    // Return success
    return { success: true, message: 'Invitations Sent Successfully', data: { validUpdates, invalidUpdates, refreshedCompetition } };
}

exports.removeTeamFromCompetition = async ({ competitionId, teamId }, { userId, auditInfo }) => {
    // Check if competition exists
    const foundCompetition = await db.FootballCompetition.findById( competitionId );
    if( !foundCompetition ) return { success: false, message: 'Invalid Competition' };
    if( foundCompetition.status !== 'upcoming' ) return { success: false, message: 'Competition Started' }

    // Check if team exists
    const team = await db.FootballTeam.findById( teamId );
    if( !team ) return { success: false, message: 'Invalid Team' };

    // Check if team is a part of competition
    if( !foundCompetition.teams.some( team => team === teamId )) return { success: false, message: 'Team Not In Competition' };

    // Map through team invitations and reject invite
    const updatedInvitations = await db.FootballTeam.findOneAndUpdate(
        { _id: teamId, "competitionInvitations.competition": competitionId },
        {
            $set: {
                "competitionInvitations.$.status": "rejected"
            }
        },
        { new: true }
    )

    // Log action
    logActionManually({
        userId, auditInfo,
        action: 'UPDATE',
        entity: 'FootballTeam',
        entityId: team._id,
        details: {
            message: `Competition Invitation Rejected`,
            affectedFields: [ 'competitionInvitations' ]
        },
        previousValues: team.competitionInvitations,
        newValues: updatedInvitations.competitionInvitations
    });

    // Remove team from competition
    const refreshedCompetition = await db.FootballCompetition.findByIdAndUpdate(
        competitionId,
        {
            $pull: {
                teams: { team: teamId }
            }
        },
        { new: true }
    )
        .populate({
            path: 'teams',
            select: 'name shorthand'
        });

    // Log action
    logActionManually({
        userId, auditInfo,
        action: 'UPDATE',
        entity: 'FootballCompetition',
        entityId: foundCompetition._id,
        details: {
            message: `Competition Team Removed`,
            affectedFields: [ 'teams' ]
        },
        previousValues: foundCompetition.teams,
        newValues: refreshedCompetition.teams
    });

    // Return success
    return { success: true, message: 'Team Removed', data: refreshedCompetition.teams }
}

exports.registerTeamSquadList = async ({ competitionId, teamId }, { players }, { userId, auditInfo }) => {
    // Check if competition exists
    const foundCompetition = await db.FootballCompetition.findById( competitionId );
    if( !foundCompetition ) return { success: false, message: 'Invalid Competition' };

    // Initialize old competition
    const oldCompetition = await db.FootballCompetition.findById( competitionId );

    // Check if the team exists in the competition
    const teamIndex = foundCompetition.teams.findIndex(team => team.team.toString() === teamId);
    if (teamIndex === -1) return { success: false, message: 'Team not found in the competition' };

    // Validate that the players are part of the team
    const team = foundCompetition.teams[ teamIndex ];
    const teamPlayers = await db.FootballPlayer.find({ team: teamId });
    const playerIds = teamPlayers.map( player => player._id );

    const invalidPlayers = players.filter(playerId => !playerIds.includes(playerId));
    if (invalidPlayers.length > 0) {
        return { success: false, message: `Player(s) ${invalidPlayers.join(', ')} are not part of this team` };
    }

    // Update the squad list with the provided players
    team.squadList = players.map(player => player);

    // Save the updated competition document
    await foundCompetition.save();

    // Log actions
    // Log action
    logActionManually({
        userId, auditInfo,
        action: 'UPDATE',
        entity: 'FootballCompetition',
        entityId: foundCompetition._id,
        details: {
            message: `Competition Teams Updated`,
            affectedFields: [ 'teams' ]
        },
        previousValues: oldCompetition.toObject(),
        newValues: foundCompetition.toObject()
    });

    // Return success
    return { success: true, message: 'Team squad list updated successfully' };
}

// Start Competition And Set Table From Array Of Teams In Competition
exports.initializeLeagueTable = async ({ competitionId }, { userId, auditInfo }) => {
    // Check if competition exists and is league
    const foundCompetition = await db.FootballCompetition.findById( competitionId );
    if( !foundCompetition ) return { success: false, message: 'Invalid Competition' };
    if( foundCompetition.format !== 'league' ) return { success: false, message: 'Invalid Competition Type' };

    if( foundCompetition.leagueTable && foundCompetition.leagueTable.length > 0 ) return { success: false, message: 'League Table Initialized' };

    // Create league table and status
    foundCompetition.leagueTable = foundCompetition.teams.map( ( team ) => ({
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
        position: 0
    }));
    foundCompetition.status = 'ongoing';

    // Save updated table
    await foundCompetition.save();

    // Refresh Competition
    const refreshedCompetition = await db.FootballCompetition.findById( competitionId )
        .populate({
            path: 'leagueTable.team',
            select: 'name shorthand'
        });

    // Log action
    logActionManually({
        userId, auditInfo,
        action: 'UPDATE',
        entity: 'FootballCompetition',
        entityId: foundCompetition._id,
        details: {
            message: `Competition Table Initialized`,
            affectedFields: [ 'leagueTable' ]
        },
        previousValues: foundCompetition,
        newValues: refreshedCompetition
    });

    // Return success
    return { success: true, message: 'League Table Initialized', data: refreshedCompetition };
}

exports.addKnockoutPhases = async ({ competitionId }, { name, fixtureFormat }, { userId, auditInfo }) => {
    // Check if competition exists
    const foundCompetition = await db.FootballCompetition.findById( competitionId );
    if( !foundCompetition ) return { success: false, message: 'Invalid Competition' };
    if( foundCompetition.format === 'league' ) return { success: false, message: 'Invalid Competition Type' };

    // Update knockout rounds
    const updatedCompetition = await db.FootballCompetition.findByIdAndUpdate(
        competitionId,
        {
            $addToSet: {
                knockoutRounds: {
                    name,
                    fixtureFormat,
                    fixtures: [],
                    completed: false
                }
            }
        },
        { new: true }
    );

    // Log action
    logActionManually({
        userId, auditInfo,
        action: 'UPDATE',
        entity: 'FootballCompetition',
        entityId: foundCompetition._id,
        details: {
            message: `Knockout Phase Added`,
            affectedFields: [ 'knockoutRounds' ]
        },
        previousValues: foundCompetition,
        newValues: updatedCompetition
    });

    // Return success
    return { success: true, message: 'Knockout Rounds Added', data: updatedCompetition.knockoutRounds }
}

exports.addGroupStage = async ({ competitionId }, { name }, { userId, auditInfo }) => {
    // Check if competition exists
    const foundCompetition = await db.FootballCompetition.findById( competitionId );
    if( !foundCompetition ) return { success: false, message: 'Invalid Competition' };
    if( foundCompetition.format !== 'hybrid' ) return { success: false, message: 'Invalid Competition Type' };

    // Add group stage
    const updatedCompetition = await db.FootballCompetition.findByIdAndUpdate(
        competitionId,
        {
            $addToSet: {
                groupStage: {
                    name,
                    fixtures: [],
                    standings: []
                }
            }
        }
    )

    // Log action
    logActionManually({
        userId, auditInfo,
        action: 'UPDATE',
        entity: 'FootballCompetition',
        entityId: foundCompetition._id,
        details: {
            message: `Group Stage Added`,
            affectedFields: [ 'groupStage' ]
        },
        previousValues: foundCompetition,
        newValues: updatedCompetition
    });

    // Return success
    return { success: true, message: 'Group Stage Added', data: updatedCompetition.groupStage }
}

exports.addCompetitionFixture = async ({ competitionId }, { homeTeam, awayTeam, matchWeek, referee, date, stadium }, { userId, auditInfo }) => {
    // Check if competition exists
    const foundCompetition = await db.FootballCompetition.findById( competitionId );
    if( !foundCompetition ) return { success: false, message: 'Invalid Competition' };

    const competitionTeams = foundCompetition.teams.map( ( team ) => String( team.team ) ); // Convert to string for comparison

    // Check if home and away teams are in competition
    if( !competitionTeams.includes( homeTeam ) || !competitionTeams.includes( awayTeam ) ) return { success: false, message: 'Invalid Teams' }


    // Loop through fixtures and create
    const createdFixture = await db.FootballFixture.create({
        homeTeam, awayTeam,
        date, stadium,
        type: 'competition',
        competition: foundCompetition._id,
        referee, matchWeek
    });

    // Log action
    logActionManually({
        userId, auditInfo,
        action: 'CREATE',
        entity: 'FootballFixture',
        entityId: createdFixture._id,
        details: {
            message: `Fixture Created`
        }
    });

    // Return success
    return { success: true, message: 'Fixture Created', data: createdFixture };
}

// Update Competition Fixture And Calculate Competition Standings/Rounds/Data
exports.updateCompetitionFixtureResult = async({ competitionId, fixtureId }, { result, statistics,  matchEvents, homeSubs, awaySubs }, { userId, auditInfo }) => {
    // Check if fixture exists
    const foundFixture = await db.FootballFixture.findOne(
        { _id: fixtureId, competition: competitionId },
    );
    if( !foundFixture ) return { success: false, message: 'Invalid Competition Fixture' };
    if( foundFixture.status === 'completed' ) return { success: false, message: 'Fixture Already Updated' };

    // Initialize initial fixture
    const initialFixture = await db.FootballFixture.findOne(
        { _id: fixtureId, competition: competitionId },
    );
    
    // Check if competition exists
    const foundCompetition = await db.FootballCompetition.findById( competitionId )
        .populate([
            {
                path: 'leagueTable.team',
                select: 'name department level shorthand'
            },
            {
                path: 'groupStage.standings.team',
                select: 'name shorthand'
            },
            {
                path: 'knockoutRounds.teams',
                select: 'name shorthand'
            }
        ]);
    if( !foundCompetition ) return { success: false, message: 'Invalid Competition' };

    // Initialize initial fixture
    const initialCompetition = await db.FootballCompetition.findById( competitionId );

    // Check if user passed in statistics
    if( statistics ) {
        // Check if statistics does not exist and create
        const { home, away } = statistics;
        if( !foundFixture.statistics ) {
            const createdStatistics = await db.FootballMatchStatistic.create({ fixture: foundFixture._id, home, away });
            foundFixture.statistics = createdStatistics._id;
        } else {
            const foundStatistics = await db.FootballMatchStatistic.findByIdAndUpdate( foundFixture.statistics, { home, away });
        }
    }
    // Check if subs
    if( homeSubs ) {
        foundFixture.homeLineup = {
            ...foundFixture.homeLineup,
            subs: homeSubs
        }
    }
    if( awaySubs ) {
        foundFixture.homeLineup = {
            ...foundFixture.homeLineup,
            subs: awaySubs
        }
    }
    await foundFixture.save();

    // Update player appearances
    const alsoFixture = await db.Fixture.findOne({ _id: fixtureId, competition: competitionId });
    if( alsoFixture.homeLineup.startingXI && alsoFixture.homeLineup.startingXI.length > 0 ) {
        const playersArr = [ ...alsoFixture.homeLineup.startingXI, ...alsoFixture.homeLineup.subs ]
        await processAppearanceUpdate( playersArr, competitionId )
    }
    if( alsoFixture.awayLineup.startingXI && alsoFixture.awayLineup.startingXI.length > 0 ) {
        const playersArr = [ ...alsoFixture.awayLineup.startingXI, ...alsoFixture.awayLineup.subs ]
        await processAppearanceUpdate( playersArr, competitionId )
    }
    // Update player stats if available
    if( matchEvents && matchEvents.length > 0 ) {
        // Save matchEvents
        foundFixture.matchEvents = matchEvents;

        // Extract events
        const goals = matchEvents.filter( event => event.eventType === "goal" );
        const ownGoals = matchEvents.filter( event => event.eventType === "ownGoal" );
        const assists = matchEvents.filter( event => event.eventType === "assist" );
        const yellowCards = matchEvents.filter( event => event.eventType === "yellowCard" );
        const redCards = matchEvents.filter( event => event.eventType === "redCard" );

        // ✅ 1️⃣ Update Goal Stats
        if ( goals.length > 0 ) {
            await processStatUpdate(
                goals.map( goal => ({ playerId: goal.player, count: 1 })), 
                "goals", 
                competitionId 
            );

            goals.forEach( goal => {
                foundFixture.goalScorers.push({
                    id: goal.player,
                    team: goal.team,
                    time: goal.time
                });
            });
        }
        // Process own goals
        if ( ownGoals.length > 0 ) {
            await processStatUpdate(
                ownGoals.map( goal => ({ playerId: goal.player, count: 1 })), 
                "ownGoals", 
                competitionId 
            );

            ownGoals.forEach( goal => {
                foundFixture.goalScorers.push({
                    id: goal.player,
                    team: goal.team,
                    time: goal.time
                });
            });
        }

        // ✅ 2️⃣ Update Assist Stats
        await processStatUpdate(
            assists.map( assist => ({ playerId: assist.player, count: 1 })), 
            "assists", 
            competitionId
        );

        // ✅ 3️⃣ Update Yellow & Red Card Stats
        await processStatUpdate(
            yellowCards.map(card => ({ playerId: card.player, count: 1 })), 
            "yellowCards", 
            competitionId
        );

        await processStatUpdate(
            redCards.map(card => ({ playerId: card.player, count: 1 })), 
            "redCards", competitionId
        );

        if( foundFixture.homeLineup && foundFixture.homeLineup.length > 0 ) {
            // ✅ 4️⃣ Handle Clean Sheets
            const homeConceded = result.awayScore > 0;
            // Get all goalkeepers from lineup
            const homeGoalkeepers = foundFixture.homeLineup.startingXI.filter( player => player.position === 'GK' );

            await Promise.all(
                homeGoalkeepers.map( async ( player ) => {
                    const playerDoc = await db.Player.findById( player._id );
                    if ( !playerDoc ) return;
    
                    if ( !homeConceded ) {
                        await updatePlayerGeneralRecord( player._id, "cleanSheets", 1 );
                        await updatePlayerCompetitionStats( player._id, "cleanSheets", 1, competitionId );
                    }
                })
            );
        }
        if( foundFixture.awayLineup && foundFixture.awayLineup.length > 0 ) {
            // ✅ 4️⃣ Handle Clean Sheets
            const awayConceded = result.homeScore > 0;
            // Get all goalkeepers from lineup
            const awayGoalkeepers = foundFixture.awayLineup.startingXI.filter( player => player.position === 'GK' );

            await Promise.all(
                awayGoalkeepers.map( async ( player ) => {
                    const playerDoc = await db.Player.findById( player._id );
                    if ( !playerDoc ) return;

                    if ( !awayConceded ) {
                        await updatePlayerGeneralRecord( player._id, "cleanSheets", 1 );
                        await updatePlayerCompetitionStats( player._id, "cleanSheets", 1, competitionId );
                    }
                })
            );
        }
    }

    // Update result and goalscorers if available and save
    if( result ) foundFixture.result = result;
    foundFixture.status = 'completed';
    await foundFixture.save();

    // Log action
    logActionManually({
        userId, auditInfo,
        action: 'UPDATE',
        entity: 'FootballFixture',
        entityId: foundFixture._id,
        details: {
            message: 'Fixture Updated',
            affectedFields: [
                result !== undefined ? "result" : null,
                matchEvents !== undefined ? "matchEvents" : null,
                homeSubs !== undefined ? "homeSubs" : null,
                awaySubs !== undefined ? "awaySubs" : null,
                statistics !== undefined ? "statistics" : null,
                "status",
            ].filter(Boolean), // Remove null values
        },
        previousValues: initialFixture.toObject(),
        newValues: foundFixture.toObject()
    });

    // Check Winner
    const homeWin = ( foundFixture.result.homeScore > foundFixture.result.awayScore ) || ( foundFixture.result.homePenalty > foundFixture.result.awayPenalty );
    const awayWin = ( foundFixture.result.homeScore < foundFixture.result.awayScore ) || ( foundFixture.result.homePenalty < foundFixture.result.awayPenalty );
    const draw = !homeWin && !awayWin;

    // Perform competition stat update
    const { homeWinsPercentage, awayWinsPercentage, totalGoals, drawsPercentage, yellowCardsAvg, redCardsAvg } = foundCompetition.stats;
    const totalGames = await db.FootballFixture.countDocuments(
        { competition: competitionId, status: completed }
    );
    if( homeWin ) {
        foundCompetition.stats.homeWinsPercentage = calculatePercentage( homeWinsPercentage, totalGames, 1 );
        foundCompetition.stats.awayWinsPercentage = calculatePercentage( awayWinsPercentage, totalGames, 0 );
        foundCompetition.stats.drawsPercentage = calculatePercentage( drawsPercentage, totalGames, 0 );
    }
    if( awayWin ) {
        foundCompetition.stats.homeWinsPercentage = calculatePercentage( homeWinsPercentage, totalGames, 0 );
        foundCompetition.stats.awayWinsPercentage = calculatePercentage( awayWinsPercentage, totalGames, 1 );
        foundCompetition.stats.drawsPercentage = calculatePercentage( drawsPercentage, totalGames, 0 );
    }
    if( draw ) {
        foundCompetition.stats.homeWinsPercentage = calculatePercentage( homeWinsPercentage, totalGames, 0 );
        foundCompetition.stats.awayWinsPercentage = calculatePercentage( awayWinsPercentage, totalGames, 0 );
        foundCompetition.stats.drawsPercentage = calculatePercentage( drawsPercentage, totalGames, 1 );
    }
    if( statistics ) {
        const totalYellows = statistics.home.yellowCards + statistics.away.yellowCards;
        const totalReds = statistics.home.redCards + statistics.away.redCards;

        foundCompetition.stats.yellowCardsAvg = calculatePercentage( yellowCardsAvg, totalGames, totalYellows );
        foundCompetition.stats.redCardsAvg = calculatePercentage( redCardsAvg, totalGames, totalReds );
    }
    foundCompetition.stats.totalGoals = totalGoals + ( foundFixture.result.homeScore + foundFixture.result.awayScore );

    // Save changes
    await foundCompetition.save();

    // Unified approach for different competition formats
    const updateStandings = async ( homeWin, awayWin, draw ) => {
        // Shared result processing logic
        const processTeamResult = ( teamStats, isHomeTeam ) => {
            const teamId = isHomeTeam ? foundFixture.homeTeam : foundFixture.awayTeam;
            const opponentId = isHomeTeam ? foundFixture.awayTeam : foundFixture.homeTeam;
            const homeGoals = isHomeTeam ? foundFixture.result.homeScore : foundFixture.result.awayScore;
            const awayGoals = isHomeTeam ? foundFixture.result.awayScore : foundFixture.result.homeScore;

            const currentForm = teamStats.form || [];
            teamStats.played += 1;

            if (draw) {
                teamStats.draws += 1;
                teamStats.points += 1;
                teamStats.form = addToFront(currentForm, 'D');
            } else if ((isHomeTeam && homeWin) || (!isHomeTeam && awayWin)) {
                teamStats.wins += 1;
                teamStats.points += 3;
                teamStats.form = addToFront(currentForm, 'W');
            } else {
                teamStats.losses += 1;
                teamStats.form = addToFront(currentForm, 'L');
            }

            teamStats.goalsFor += homeGoals;
            teamStats.goalsAgainst += awayGoals;
            teamStats.goalDifference += (homeGoals - awayGoals);

            return teamStats;
        };

        // Handle different competition formats
        switch (foundCompetition.format) {
            case 'league': {
                const updatedTableStandings = foundCompetition.leagueTable.map(teamEntry => {
                    if (teamEntry.team._id.equals(foundFixture.homeTeam)) {
                        return processTeamResult(teamEntry, true);
                    }
                    if (teamEntry.team._id.equals(foundFixture.awayTeam)) {
                        return processTeamResult(teamEntry, false);
                    }
                    return teamEntry;
                });

                // Sort and assign positions
                const sortedStandings = updatedTableStandings.sort((a, b) => {
                    if (b.points !== a.points) return b.points - a.points;
                    if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
                    return b.goalsFor - a.goalsFor;
                });

                sortedStandings.forEach((team, index) => {
                    team.position = index + 1;
                });

                foundCompetition.leagueTable = sortedStandings;
                break;
            }
            case 'hybrid': {
                // Hybrid might have group stages
                foundCompetition.groupStage.forEach(group => {
                    const updatedGroupStandings = group.standings.map(teamEntry => {
                        if (teamEntry.team._id.equals(foundFixture.homeTeam)) {
                            return processTeamResult(teamEntry, true);
                        }
                        if (teamEntry.team._id.equals(foundFixture.awayTeam)) {
                            return processTeamResult(teamEntry, false);
                        }
                        return teamEntry;
                    });

                    // Sort and assign positions within group
                    const sortedGroupStandings = updatedGroupStandings.sort((a, b) => {
                        if (b.points !== a.points) return b.points - a.points;
                        if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
                        return b.goalsFor - a.goalsFor;
                    });

                    sortedGroupStandings.forEach((team, index) => {
                        team.position = index + 1;
                    });

                    group.standings = sortedGroupStandings;
                });
                break;
            }
            case 'knockout': {
                // For knockout, handle progression logic (existing logic)
                const currentRoundIndex = foundCompetition.knockoutRounds.findIndex( 
                    round => round.fixtures.some( 
                        fixtureId => fixtureId.equals( foundFixture._id ) 
                    ) 
                );

                if (currentRoundIndex !== -1) {
                    const currentRound = foundCompetition.knockoutRounds[currentRoundIndex];
                    const nextRoundIndex = currentRoundIndex + 1;

                    if (nextRoundIndex < foundCompetition.knockoutRounds.length) {
                        const nextRound = foundCompetition.knockoutRounds[nextRoundIndex];
                        
                        if (homeWin) {
                            nextRound.teams.push(foundFixture.homeTeam);
                        } else if (awayWin) {
                            nextRound.teams.push(foundFixture.awayTeam);
                        }
                    }
                }
                break;
            }
        }
    }

    // Perform standings update
    await updateStandings(homeWin, awayWin, draw);

    // Save competition updates
    await foundCompetition.save();

    // Refresh and return updated data
    const refreshedCompetition = await FootballCompetition.findById(competitionId)
        .populate([
            { path: 'leagueTable.team', select: 'name shorthand' },
            { path: 'groupStage.standings.team', select: 'name shorthand' },
            { path: 'knockoutRounds.teams', select: 'name shorthand' }
        ]);

    const refreshedFixture = await FootballFixture.findOne(
        { _id: fixtureId, competition: competitionId }
    );

    // Log action
    logActionManually({
        userId, auditInfo,
        action: 'UPDATE',
        entity: 'FootballCompetition',
        entityId: foundCompetition._id,
        details: {
            message: 'Competition Updated',
            affectedFields: [
                foundCompetition.format === 'league' ? "leagueTable" : null,
                foundCompetition.format === 'knockout' ? "knockoutRounds" : null,
                foundCompetition.format === 'hybrid' ? "groupStage" : null,
                "stats",
            ].filter(Boolean), // Remove null values
        },
        previousValues: initialCompetition.toObject(),
        newValues: refreshedCompetition.toObject()
    });
 
    return { 
        success: true,
        message: 'Fixture Updated And Competition Stats Updated',
        data: {
            refreshedFixture, 
            refreshedCompetition
        }
    };
}

exports.deleteCompetitionFixture = async ({ competitionId, fixtureId }, { userId, auditInfo }) => {
    // Deleted fixture
    const deletedFixture = await db.FootballFixture.findOneAndDelete( 
        { _id: fixtureId, competition: competitionId }
    );
    if( !deletedFixture ) return { success: false, message: 'Invalid Fixture' };

    // Log action
    logActionManually({
        userId, auditInfo,
        action: 'DELETE',
        entity: 'FootballFixture',
        entityId: fixtureId,
        details: {
            message: `Fixture Deleted`
        },
        previousValues: deletedFixture.toObject(),
        newValues: null
    });

    // Return success
    return { success: true, message: 'Fixture Deleted', data: deletedFixture };
}

exports.addFixturesToKnockoutPhase = async ({ competitionId, fixtureId }, { roundName }, { userId, auditInfo }) => {
    // Check if competition exists
    const foundCompetition = await db.FootballCompetition.findById(competitionId);
    if (!foundCompetition) return { success: false, message: 'Invalid Competition' };
    if (foundCompetition.type === 'league') return { success: false, message: 'Invalid Competition Type' };

    // Get old competition
    const oldCompetition = await db.FootballCompetition.findById( competitionId );

    // Check if fixture exists
    const foundFixture = await db.FootballFixture.findById( fixtureId );
    if( !foundFixture || foundFixture.competition !== competitionId ) return { success: false, message: 'Invalid Fixture' }

    // Check if round name matches an existing round
    const roundIndex = foundCompetition.knockoutRounds.findIndex(round => round.name === roundName);
    if (roundIndex === -1) return { success: false, message: 'Round Not In Competition' };

    // Get the round object
    const round = foundCompetition.knockoutRounds[roundIndex];

    // Add fixtures to the correct round
    foundCompetition.knockoutRounds[ roundIndex ].fixtures = [
        ...foundCompetition.knockoutRounds[roundIndex].fixtures,
        fixtureId
    ];

    // Save competition
    await foundCompetition.save();

    // Log action
    logActionManually({
        userId, auditInfo,
        action: 'UPDATE',
        entity: 'FootballCompetition',
        entityId: foundCompetition._id,
        details: {
            message: `Fixture Added To ${ roundName }`,
            affectedFields: [ 'knockoutRounds' ]
        },
        previousValues: oldCompetition,
        newValues: foundCompetition
    });

    // Return success
    return { success: true, message: 'Fixture Added To Knockout', data: foundCompetition };
};

exports.addFixturesToGroupStage = async ({ competitionId, fixtureId }, { groupName }, { userId, auditInfo }) => {
    // Check if competition exists
    const foundCompetition = await db.FootballCompetition.findById(competitionId);
    if (!foundCompetition) return { success: false, message: 'Invalid Competition' };
    if (foundCompetition.type !== 'hybrid') return { success: false, message: 'Invalid Competition Type' };

    // Get old competition
    const oldCompetition = await db.FootballCompetition.findById( competitionId );

    // Check if fixture exists
    const foundFixture = await db.FootballFixture.findById( fixtureId );
    if( !foundFixture || foundFixture.competition !== competitionId ) return { success: false, message: 'Invalid Fixture' }

    // Check if group name matches an existing round
    const roundIndex = foundCompetition.groupStage.findIndex(group => group.name === groupName);
    if (roundIndex === -1) return { success: false, message: 'Group Not In Competition' };

    // Get the round object
    const round = foundCompetition.groupStage[roundIndex];

    // Add fixtures to the correct round
    foundCompetition.groupStage[ roundIndex ].fixtures = [
        ...foundCompetition.groupStage[roundIndex].fixtures,
        fixtureId
    ];

    // Save competition
    await foundCompetition.save();

    // Log action
    logActionManually({
        userId, auditInfo,
        action: 'UPDATE',
        entity: 'FootballCompetition',
        entityId: foundCompetition._id,
        details: {
            message: `Fixture Added To ${ groupName }`,
            affectedFields: [ 'groupStage' ]
        },
        previousValues: oldCompetition,
        newValues: foundCompetition
    });

    // Return success
    return { success: true, message: 'Fixture Added To Group Stage', data: foundCompetition };
};

exports.addTeamsToGroupStage = async ({ competitionId, teamId }, { groupName }, { userId, auditInfo }) => {
    // Check if competition exists
    const foundCompetition = await db.FootballCompetition.findById(competitionId);
    if (!foundCompetition) return { success: false, message: 'Invalid Competition' };
    if (foundCompetition.type !== 'hybrid') return { success: false, message: 'Invalid Competition Type' };
    if( foundCompetition.status !== 'upcoming' ) return { success: false, message: 'Active Competition' };

    // Get old competition
    const oldCompetition = await db.FootballCompetition.findById( competitionId );

    // Check if team exists
    const foundTeam = await db.FootballTeam.findById( teamId );
    if( !foundTeam ) return { success: false, message: 'Invalid Team' }
    if( !foundCompetition.teams.includes( teamId ) ) return { success: false, message: 'Invalid Competition Team' }

    // Check if round name matches an existing round
    const roundIndex = foundCompetition.groupStage.findIndex(group => group.name === groupName);
    if (roundIndex === -1) return { success: false, message: 'Group Not In Competition' };

    // Add team to the correct round
    foundCompetition.groupStage[ roundIndex ].standings = [
        ...foundCompetition.groupStage[roundIndex].standings,
        {
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
        }
    ];

    // Save competition
    await foundCompetition.save();

    // Log action
    logActionManually({
        userId, auditInfo,
        action: 'UPDATE',
        entity: 'FootballCompetition',
        entityId: foundCompetition._id,
        details: {
            message: `Team Added To ${ groupName }`,
            affectedFields: [ 'groupStage' ]
        },
        previousValues: oldCompetition,
        newValues: foundCompetition
    });

    // Return success
    return { success: true, message: 'Team Added To Group Stage', data: foundCompetition };
}

exports.removeFixtureFromKonckoutPhase = async ({ competitionId, fixtureId }, { roundName }, { userId, auditInfo }) => {
    // Check if competition exists
    const foundCompetition = await db.FootballCompetition.findById(competitionId);
    if (!foundCompetition) return { success: false, message: 'Invalid Competition' };
    if (foundCompetition.type === 'league') return { success: false, message: 'Invalid Competition Type' };

    // Get old competition
    const oldCompetition = await db.FootballCompetition.findById( competitionId );

    // Check if fixture exists
    const foundFixture = await db.FootballFixture.findById( fixtureId );
    if( !foundFixture || foundFixture.competition !== competitionId ) return { success: false, message: 'Invalid Fixture' }

    // Check if round name matches an existing round
    const roundIndex = foundCompetition.knockoutRounds.findIndex(round => round.name === roundName);
    if (roundIndex === -1) return { success: false, message: 'Round Not In Competition' };

    // Get the round object
    const round = foundCompetition.knockoutRounds[roundIndex];

    // Add fixtures to the correct round
    foundCompetition.knockoutRounds = foundCompetition.knockoutRounds.map( ( knockoutRound ) => {
        if( knockoutRound.name === roundName ) {
            knockoutRound.fixtures = knockoutRound.fixtures.filter( fixture => fixture !== fixtureId );
        }
        return knockoutRound;
    });

    // Save competition
    await foundCompetition.save();

    // Log action
    logActionManually({
        userId, auditInfo,
        action: 'UPDATE',
        entity: 'FootballCompetition',
        entityId: foundCompetition._id,
        details: {
            message: `Fixture Removed From ${ roundName }`,
            affectedFields: [ 'knockoutRounds' ]
        },
        previousValues: oldCompetition,
        newValues: foundCompetition
    });

    // Return success
    return { success: true, message: 'Fixture Removed From Knockout', data: foundCompetition };
};

exports.removeFixtureFromGroupStage = async ({ competitionId, fixtureId }, { groupName }, { userId, auditInfo }) => {
    // Check if competition exists
    const foundCompetition = await db.FootballCompetition.findById(competitionId);
    if (!foundCompetition) return { success: false, message: 'Invalid Competition' };
    if (foundCompetition.type !== 'hybrid') return { success: false, message: 'Invalid Competition Type' };

    // Get old competition
    const oldCompetition = await db.FootballCompetition.findById( competitionId );

    // Check if fixture exists
    const foundFixture = await db.FootballFixture.findById( fixtureId );
    if( !foundFixture || foundFixture.competition !== competitionId ) return { success: false, message: 'Invalid Fixture' }

    // Check if round name matches an existing round
    const roundIndex = foundCompetition.groupStage.findIndex(group => group.name === groupName);
    if (roundIndex === -1) return { success: false, message: 'Group Not In Competition' };

    // Get the round object
    const round = foundCompetition.groupStage[roundIndex];

    // Add fixtures to the correct round
    foundCompetition.groupStage = foundCompetition.groupStage.map( ( group ) => {
        if( group.name === groupName ) {
            group.fixtures = group.fixtures.filter( fixture => fixture !== fixtureId );
        }
        return group;
    });

    // Save competition
    await foundCompetition.save();

    // Log action
    logActionManually({
        userId, auditInfo,
        action: 'UPDATE',
        entity: 'FootballCompetition',
        entityId: foundCompetition._id,
        details: {
            message: `Fixture Removed From ${ groupName }`,
            affectedFields: [ 'groupStage' ]
        },
        previousValues: oldCompetition,
        newValues: foundCompetition
    });

    // Return success
    return { success: true, message: 'Fixture Removed From Group Stage', data: foundCompetition };
};

exports.removeTeamFromGroupStage = async ({ competitionId, teamId }, { groupName }, { userId, auditInfo }) => {
    // Check if competition exists
    const foundCompetition = await db.FootballCompetition.findById(competitionId);
    if (!foundCompetition) return { success: false, message: 'Invalid Competition' };
    if (foundCompetition.type !== 'hybrid') return { success: false, message: 'Invalid Competition Type' };
    if( foundCompetition.status !== 'upcoming' ) return { success: false, message: 'Active Competition' };

    // Get old competition
    const oldCompetition = await db.FootballCompetition.findById( competitionId );

    // Check if team exists
    const foundTeam = await db.FootballTeam.findById( teamId );
    if( !foundTeam ) return { success: false, message: 'Invalid Team' }
    if( !foundCompetition.teams.includes( teamId ) ) return { success: false, message: 'Invalid Competition Team' }

    // Check if round name matches an existing round
    const roundIndex = foundCompetition.groupStage.findIndex(group => group.name === groupName);
    if (roundIndex === -1) return { success: false, message: 'Group Not In Competition' };

    // Add team to the correct round
    foundCompetition.groupStage = foundCompetition.groupStage.map( ( group ) => {
        if( group.name === groupName ) {
            group.standings = group.standings.filter( standing => standing.team !== teamId );
        }
        return group;
    });

    // Save competition
    await foundCompetition.save();

    // Log action
    logActionManually({
        userId, auditInfo,
        action: 'UPDATE',
        entity: 'FootballCompetition',
        entityId: foundCompetition._id,
        details: {
            message: `Team Removed From ${ groupName }`,
            affectedFields: [ 'groupStage' ]
        },
        previousValues: oldCompetition,
        newValues: foundCompetition
    });

    // Return success
    return { success: true, message: 'Team Removed From Group Stage', data: foundCompetition };
}

exports.makeFeatured = async ({ competitionId }, { userId, auditInfo }) => {
    // Set existing featured to false
    const alreadyFeatured = await db.FootballCompetition.findOneAndUpdate(
        { isFeatured: true },
        { isFeatured: false },
    );

    // Set competition to featured
    const newFeatured = await db.FootballCompetition.findByIdAndUpdate(
        competitionId,
        { isFeatured: true },
        { new: true }
    );
    if( !newFeatured ) return { success: false, message: 'Invalid Competition' };

    // Log action
    logActionManually({
        userId, auditInfo,
        action: 'UPDATE',
        entity: 'FootballCompetition',
        entityId: newFeatured._id,
        details: {
            message: `Competition Featured`,
            affectedFields: [ 'isFeatured' ]
        },
        previousValues: alreadyFeatured,
        newValues: newFeatured
    });

    // Return success
    return { success: true, message: 'Competition Featured', data: newFeatured };
}

exports.setCompetitionAdmin = async ({ competitionId }, { adminId }, { userId, auditInfo }) => {
    // Check if admin exists and is a team-admin
    const foundAdmin = await db.RefactoredUser.findById( adminId );
    if( !foundAdmin || foundAdmin.role !== 'sportAdmin' || !foundAdmin.sports.some( sport => sport.role === 'competitionAdmin' ) ) return { success: false, message: 'Invalid Admin' };

    // Check if competition exists and add admin
    const updatedCompetition = await db.FootballCompetition.findByIdAndUpdate(
        competitionId,
        { admin: adminId },
        { new: true }
    ).populate({
        path: 'admin',
        select: 'name'
    });
    if( !updatedCompetition ) return { success: false, message: 'Invalid Team' }

    // Log actions
    logActionManually({
        userId, auditInfo,
        action: 'UPDATE',
        entity: 'FootballCompetition',
        entityId: competitionId,
        details: {
            message: 'Competition Admin Updated',
            affectedFields: [ 'admin' ]
        },
        previousValues: { admin: null },
        newValues: { admin: adminId }
    });

    // Return success
    return { success: true, message: 'Admin Updated', data: updatedCompetition };
    
}

exports.deleteCompetition = async ({ competitionId }, { userId, auditInfo }) => {
    // Check if team exists
    const foundCompetition = await db.FootballCompetition.findById( competitionId );
    if( !foundCompetition ) return { success: false, message: 'Invalid Competition' };

    // Delete team
    await db.FootballCompetition.findByIdAndDelete( competitionId );

    // Log action
    logActionManually({
        userId, auditInfo,
        action: 'DELETE',
        entity: 'FootballCompetition',
        entityId: competitionId,
        details: {
            message: 'Team Deleted'
        },
        previousValues: foundCompetition.toObject(),
        newValues: null
    });

    // Return success
    return { success: true, message: 'Competition Deleted', data: foundCompetition };
}

module.exports = exports;