import * as fs from 'fs';
import * as yaml from 'js-yaml';
import { context } from '@actions/github';

export class Configuration {
    // The path on the current repository to the Dapr bot configuration.
    private configFilePath = "./dapr-bot-config.yaml";

    // The label configurations by each authorized role
    private labelConfiguration: LabelConfigurationByRole[];    

    private static instance: Configuration;

    private constructor() {
        //Prevents direct instantiation
        this.loadConfigurationFromFile();
    }

    public static getInstance() : Configuration {
        if (!Configuration.instance) {
            Configuration.instance = new Configuration();

        }
        return Configuration.instance;
    }

    /**
     * The API token used to access the GitHub API by the bot.
     * @returns 
     */
    public static ApiToken(): string {
        return process.env['github-token'] || '';
    };

    /**
     * The username responsible for triggering the action.
     * @returns 
     */
    public static UserName(): string {
        return process.env['github-actor'] || '';
    }

    /**
     * The name of the Dapr organization on GitHub.
     * @returns The organization name.
     */
    public Organization(): string {
        return context.repo.owner;
    } 

    /**
     * The name of the Dapr repository on GitHub.
     * @returns The repository name.
     */
    public Repository(): string {
        return context.repo.repo;
    }

    /**
     * The list of label configurations and the roles authorized to mark each.
     * @returns An array of label configurations.
     */
    public LabelConfiguration(): LabelConfigurationByRole[] {
        return this.labelConfiguration;
    }

    /**
     * Loads the configuration from the dapr-bot-config.yaml file in the same directory as the 
     * workflow action YAML script.
     */
    private loadConfigurationFromFile() {
        try {
            const fileContents = fs.readFileSync(this.configFilePath, 'utf8');
            const config = yaml.load(fileContents) as Record<string, any>;
            this.labelConfiguration = config.labels;
        } catch (e) {
            console.error(`Failed to read or parse the config file: ${e}`);
        }
    }
}

/**
 * Represents the mapping of the label names keyed to their commands (pulled from the comments).
 */
export interface LabelCommand {
    [command: string]: string;
}

/**
 * Represents the configuration allowing a set of specified roles to perform the associated 
 * label commands.
 */
export interface LabelConfigurationByRole {
    /**
     * The names of the roles specified in the configuration.
     */
    roles: string[];
    /**
     * The sets of commands authorized for each of the indicated roles.
     */
    commands: LabelCommand;
    /**
     * The GitHub resource types on which the label(s) are allowed, e.g. ('pr': pull requests, 'issue': issues).
     */
    types: GitHubItemType[];
}

/**
 * The GitHub items on which issues can be specified.
 */
export enum GitHubItemType {
    Issue = 'issue',
    PullRequest = 'pr'
}