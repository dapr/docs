export class IssueOperations {
    /**
     * As issues cannot actually be moved, this instead opens an issue in the indicated repo with
     * the body of the original post, then adds a comment to the original issue indicating that it's 
     * been moved and linking to the new issue (so the OP gets a notification). It then closes the
     * original issue.
     */
    public async moveIssueCommand(targetRepoName: string) {

    }

    
    private async closeAndMoveIssue(targetRepoName: string) {

    }
}