import { getOctokit } from "@actions/github"
import { Configuration } from "../configuration"
import { context } from '@actions/github';

export class LabelOperations {
    /**
     * The various labels a user can provide and their associated values and constraints.
     */
    private labelRequirements = [
        new LabelRequirement("/do-not-merge", "do-not-merge", ConstraintType.PullRequest),
        new LabelRequirement("/waiting-on-pr", "waiting-on-code-pr", ConstraintType.PullRequest),
        new LabelRequirement("/missing-docs", "feature-in-release-no-docs", ConstraintType.PullRequest),
        new LabelRequirement("/required", "release-requirement", ConstraintType.PullRequest)
    ]

    /**
     * Adds the indicated label to the issue.
     * @param {string} labelCommand The label command to add.
     */
    public async addLabelCommand(labelCommand: string): Promise<void> {
        //Map to the corresponding label
        const labelRequirement = this.findLabelRequirementByComment(labelCommand);
        if (labelRequirement == null) {
            return;
        }

        const label = labelRequirement.getLabel();

        //Finally, is this operation permitted by the person that made the comment?
        

        if (!(await this.labelExists(label))) {
            const configuration = Configuration.getInstance();

            const octokit = getOctokit(configuration.ApiToken());

            await octokit.rest.issues.addLabels({
                owner: configuration.Organization(),
                repo: configuration.Repository(),
                issue_number: context.issue.number,
                labels: [label]
            });
        }
    }

    /**
     * Removes the label associated with the command from the issue.
     * @param {string} labelName The name of the label to remove.
     */
    public async removeLabelCommand(labelCommand: string) {
        //Map to the corresponding label
        const labelRequirement = this.findLabelRequirementByComment(labelCommand);
        if (labelRequirement == null) {
            return;
        }

        const label = labelRequirement.getLabel();

        if (await this.labelExists(label)) {
            const octokit = getOctokit(Configuration.ApiToken());

            await octokit.rest.issues.removeLabel({
                owner: Configuration.Organization(),
                repo: Configuration.Repository(),
                issue_number: context.issue.number,
                name: label
            });
        }
    }
   
    /**
     * Validates that the specified label does not exist on the issue already.
     * @param {string} labelName The name of the label to validate.
     */
    private async labelExists(labelName: string) : Promise<boolean> {
        const octokit = getOctokit(Configuration.ApiToken());
        
        const issueLabels = await octokit.rest.issues.listLabelsOnIssue({
            owner: Configuration.Organization(),
            repo: Configuration.Repository(),
            issue_number: context.issue.number
        });

        return issueLabels.data.some(label => label.name == labelName);        
    }

    /**
     * Retrieves the label requirement by its comment value.
     * @param {string} comment The comment used for the label value.
     * @returns The label requirement, if found; otherwise null.
     */
    private findLabelRequirementByComment(comment: string) : LabelRequirement | null {
        return this.labelRequirements.find(req => req.matchesComment(comment)) ?? null;
    }
}

/**
 * Offers a more structured approach to evaluating the requirements for any given label.
 */
class LabelRequirement {
    private comment: string;
    private label: string;
    private contextType: ConstraintType;

    constructor(comment: string, label: string, contextType: ConstraintType) {
        this.comment = comment;
        this.label = label;
        this.contextType = contextType;
    }

    /**
     * Retrieves the label value.
     * @returns
     */
    public getLabel(){
        return this.label;
    }

    /**
     * Validates that the context matches the context required to use this label.
     * @param {ConstraintType} context The context for the label (e.g. issue, pull request).
     * @returns {boolean} True if the comment matches this requirement; else false.
     */
    public matchesContext(context: ConstraintType): boolean {
        return context === this.contextType;
    }

    /**
     * Validates that a given comment matches the comment required for this label.
     * @param {string} comment The comment value to test.
     * @returns {boolean} True if the comment matches this requirement; else false.
     */
    public matchesComment(comment: string): boolean {
        return comment === this.comment;
    }
}

/**
 * Identifies the context by which the label is being evaluated.
 */
enum ConstraintType {
    Issue,
    PullRequest
}