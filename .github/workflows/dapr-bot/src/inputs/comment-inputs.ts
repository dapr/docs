import { context } from '@actions/github';
import { GitHubItemType } from '../configuration';

export class Input
{
    /**
     * Retrieves the comment that triggered the GitHub workflow.
     * @returns Either the comment or null.
     */
    public getComment() : Comment | null {        
        if (context.payload.comment?.body) {
            const comment: Comment = {
                body: context.payload.comment?.body,
                type: !!context.payload.pull_request ? GitHubItemType.PullRequest : GitHubItemType.Issue,
                issueNumber: context.issue.number
            };
            return comment;
        }

        return null;
    }
}

/**
 * Represents a comment left in GitHub.
 */
export interface Comment {
    /**
     * The value of the comment body.
     */
    body: string;
    /**
     * The type of GitHub item the comment was left on.
     */
    type: GitHubItemType;
    /**
     * The issue or PR number the comment was left on.
     */
    issueNumber: number;
}