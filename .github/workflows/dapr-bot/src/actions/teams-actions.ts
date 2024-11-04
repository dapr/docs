import { getOctokit } from '@actions/github'
import { Configuration } from '../configuration';

export class Teams {
    // The various high-level teams across Dapr at https://github.com/orgs/dapr/teams
    private readonly roles = {
        '*': new TeamIdentifier('*'),
        'approvers': new TeamIdentifier('approvers-'),
        'maintainers': new TeamIdentifier('maintainers-'),
        'community-managers': new TeamIdentifier(['community-managers']),
        'contributors': new TeamIdentifier(['members']),
        'releasers': new TeamIdentifier(['release team']),
        'stc': new TeamIdentifier(['stc'])
        //this-repo: includes all teams on this org/repo (e.g. non-anonymous)
    };

    // We only care about the Dapr organization
    private organization = 'dapr';

    constructor() {
        this.init();
    }

    /**
     * Initializes the roles defines on the repository with values retrieved asynchronously.
     */
    private async init() {
        this.roles['this-repo'] = await this.getTeamsOnOrgRepo();
    }
    
    /**
     * Determines if the specified user is a member of any of the Dapr teams encompassed in the various
     * roles indicated on this class.
     * @param username The name of the user to validate.
     * @param acceptableRoles The roles the user is being validated against for this request.
     * @returns True if the user is a member of an indicated role; otherwise false.
     */
    public async isPartOfRole(username: string, acceptableRoles: string[]): Promise<boolean> {
        //Get the teams the user is a part of on the Dapr org
        const userTeams = await this.getUserTeamsInOrg(username);

        return acceptableRoles.some(role => this.roleContainsAnyTeam(role, userTeams));
    }

    /**
     * Retrieves the team identifier from the declaration on this class given its identifier.
     * @param roleName The name of the role to retrieve the team identifier for.
     * @returns The team identifier for the role if found; else null.
     */
    private getTeamIdentifier(roleName: string): TeamIdentifier | null {
        if (roleName in this.roles) {
            return this.roles[roleName];
        }
        return null;
    }

    /**
     * Determines if any of the teams are a match for the identifier matching the role name.
     * @param roleName The name of the role to validate against the associated teams of.
     * @param teamNames The names of the teams the user is a part of.
     * @returns True if the user is on any teams matching the indicated role; else false.
     */
    private roleContainsAnyTeam(roleName: string, teamNames: string[]): boolean {
        const team = this.getTeamIdentifier(roleName);
        if (team === null) {
            return false;
        }

        return teamNames.some(teamName => team.isMatch(teamName));
    }

    /**
     * Gets the teams the user is associated with withn the organization.
     * @param username The name of the user.
     * @returns An array of the teams the user is associated with in the organization.
     */
    private async getUserTeamsInOrg(username: string): Promise<string[]> {
        const octokit = getOctokit(Configuration.ApiToken());
        const org = Configuration.getInstance().Organization;
        const {data: teams} = await octokit.rest.teams.listForAuthenticatedUser({
            org
        });

        const userTeams = teams.filter(team => team.members_url.includes(username));
        return userTeams.map(team => team.name);
    }

    /**
     * Gets each of the teams associated with both the organization and repository
     * exposed on the configuration.
     * @returns The list of team names.
     */
    private async getTeamsOnOrgRepo(): Promise<string[]> {
        const octokit = getOctokit(Configuration.ApiToken());
        const config = Configuration.getInstance();
        const org = config.Organization();

        const {data: teams} = await octokit.rest.teams.list({
            org
        });

        const repo = config.Repository();
        const repoTeams = teams.filter(team => team.repositories_url.includes(repo));

        return repoTeams.map(team => team.name);
    }
}

/**
 * Identifies an organization-wide team across each of the repository-specific teams.
 */
class TeamIdentifier {
    private prefix: string | null = null;
    private teamNames: string[] = [];

    constructor(prefix: string);
    constructor(teamNames: string[]);
    constructor(prefix: string, teamNames: string[]);
    constructor(arg1?: string | string[], arg2?: string[]) {
        if (Array.isArray(arg1)) {
            this.teamNames = arg1;
            this.prefix = null;
        } else {
            this.prefix = arg1 || null;
            this.teamNames = arg2 || [];
        }
    }

    /**
     * Determines if the provided value is a match for the team identifiers.
     * @param value The case-insensitive value to compare to.
     * @returns True if the provided value is a match for the provided team identifiers; otherwise false.
     */
    isMatch(value: string): boolean {
        var lowerCaseValue = value.toLowerCase();
        //Should match either a wildcard prefix value or the prefix
        if (this.prefix && (this.prefix === '*' || lowerCaseValue.indexOf(this.prefix) === 0)) {
            return true;
        }

        return this.teamNames.indexOf(lowerCaseValue) > -1;
    }
}