import { Input, Comment } from './inputs/comment-inputs.ts';


export class DaprBot {
    public async performCommentAction() {
        //Retrieve the comment that triggered the action
        const comment = await this.getCommentFromAction();

        //Determine if it's a valid command

        //Satisfy role membership

        //Validate command authorization

        //Perform operation
    }

    private async getCommentFromAction() : Promise<Comment | null> {
        const input = new Input();
        return await input.getComment();
    }
}