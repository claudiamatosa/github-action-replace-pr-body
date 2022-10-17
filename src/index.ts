import * as core from "@actions/core";
import * as github from "@actions/github";
import { GitHub } from "@actions/github/lib/utils";
import {PullRequest} from '@octokit/webhooks-definitions/schema'

// Toolkit docs: https://github.com/actions/toolkit

export async function run() {
  try {
    const inputs = {
      token: core.getInput("github-token", { required: true }),
    };

    const pullRequest = github.context.payload.pull_request as PullRequest;

    // Pull-request format: https://developer.github.com/v3/pulls/#response
    const placeholders: {[key: string]: string} = {
      prNumber: String(pullRequest.number),
      branchName: pullRequest.head.ref,
    };

    const body = pullRequest.body;

    console.log("Initial description: ", body);

    if (!body) return;

    let newBody = body;

    for (let [placeholder, value] of Object.entries(placeholders)) {
      console.log(`Replacing {{${placeholder}}} with ${value}`);
      newBody = newBody.replaceAll(`{{${placeholder}}}`, value);
    }

    console.log("New description: ", newBody);

    const request = {
      owner: github.context.repo.owner,
      repo: github.context.repo.repo,
      pull_number: pullRequest.number,
      body: newBody,
    };

    const octokit = github.getOctokit(inputs.token);
    const updatePrBody = await octokit.rest.pulls.update(request);

    if (updatePrBody.status !== 200) {
      core.error("There was an issue while trying to update the pull-request.");
    }
  } catch (error) {

    core.error(error as Error);
    core.setFailed((error as Error).message);
  }
}

run();
