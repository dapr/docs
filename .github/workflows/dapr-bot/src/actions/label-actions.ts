import { Configuration } from "../configuration";
import { getOctokit } from "@actions/github";

/**
 * Performs actions based on GitHub labels.
 */
export class LabelActions {
    // The following are each of the labels in dapr/docs keyed to the values expected in a comment
    // by an authorized user
    private labelsMap = {
        "/do-not-merge": "do-not-merge",
        "/waiting-on-pr": "waiting-on-code-pr",
        "/missing-docs": "feature-in-release-no-docs",
        "/required": "release-requirement"
    }

    private async labelExists(labelName: string): Promise<boolean> {
        const octokit = getOctokit(Configuration.ApiToken());
        const issueLabels = await octokit.rest.issues.listLabelsOnIssue({
            owner: Configuration.Organization(),
            repo: 
        }))

        const issueLabels = await github.issues.listLabelsOnIssue({

        });
    }

    public async addLabel(labelName: string) {
        if (!(await ))
    }

    
}

