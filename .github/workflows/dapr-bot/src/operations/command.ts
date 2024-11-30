import { IssueOperations } from "./issue-operations";
import { LabelOperations } from "./label-operations";


export class CommandParser {
    /**
     * Maps each each expected command with its enum equivalent.
     */
    private commandMap = {
        "add": CommandType.Add,
        "remove": CommandType.Remove,
        "move": CommandType.Move
    };

    /**
     * Parses the command left in the comment to figure out what needs doing.
     * @param {string} command The command to parse. 
     */
    public async parseAndExecuteCommand(command: string): Promise<void> {
        //Parse out the command type
        const commandType = this.parseCommand(command);
        if (commandType === null) {
            return;
        }

        //Add/remove always refers to labels on issues or PRs
        //Move always refers to issues
        switch (commandType.type)
        {
            case CommandType.Add:
            {
                const labelOps = new LabelOperations();
                await labelOps.addLabelCommand(commandType.remainingCommand);
                break;
            }
            case CommandType.Remove:
            {
                const labelOps = new LabelOperations();
                await labelOps.removeLabelCommand(commandType.remainingCommand);
                break;
            }
            case CommandType.Move:
            {
                const issueOps = new IssueOperations();
                await issueOps.moveIssueCommand(commandType.remainingCommand);
                break;
            }
        }

        



    }

    /**
     * Parses the command type out of the comment provided by the user.
     * @param {string} command The command value to parse.
     * @returns The parsed command type or a null.
     */
    private parseCommand(command: string): ParsedCommand | null {
        //The first character should always be a forward-slash
        if (!command || command[0] !== '/' || command.length <= 1) {
            return null;
        }

        //Split the command by spaces
        const commandSplit = command.substring(1).split(' ');
        if (commandSplit.length < 2) {
            return null;
        }

        const commandKey = commandSplit[0].toLowerCase();
        if (this.commandMap.hasOwnProperty(commandKey)) {
            return {
                type: this.commandMap[commandKey],
                remainingCommand: commandSplit.slice(1).join(' ')
            };
        }

        return null;
    }
}

interface ParsedCommand {
    type: CommandType,
    remainingCommand: string;
}

export enum CommandTarget {
    /**
     * Indicates that the command refers to an issue operation.
     */
    Issue,
    /**
     * Indicates that the command refers to a label operation.
     */
    Label
}

/**
 * Identifies the type of command indicated.
 */
export enum CommandType {
    /**
     * Used to add something to a context.
     */
    Add,
    /**
     * Used to remove something from a context.
     */
    Remove,
    /**
     * Used to move a context between repositories.
     */
    Move
}