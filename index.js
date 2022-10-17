const core = require("@actions/core");
const github = require("@actions/github");

// Toolkit docs: https://github.com/actions/toolkit

async function run() {
  try {
    const inputs = {
      token: core.getInput("github-token", { required: true }),
    };

    // Pull-request format: https://developer.github.com/v3/pulls/#response
    const variables = {
      prNumber: github.context.payload.pull_request.number,
      branchName: github.context.payload.pull_request.head.ref,
    };

    const body = github.context.payload.pull_request.body;

    console.log("Initial description: ", body);

    if (!body) return;

    let newBody = body;

    for ([placeholder, value] of Object.entries(variables)) {
      console.log(`Replacing {{${placeholder}}} with ${value}`);
      newBody = newBody.replaceAll(`{{${placeholder}}}`, value);
    }

    console.log("New description: ", newBody);

    const request = {
      owner: github.context.repo.owner,
      repo: github.context.repo.repo,
      pull_number: github.context.payload.pull_request.number,
      body: newBody,
    };

    const client = new github.GitHub(inputs.token);
    const response = await client.pulls.update(request);

    if (response.status !== 200) {
      core.error("There was an issue while trying to update the pull-request.");
    }
  } catch (error) {
    core.error(error);
    core.setFailed(error.message);
  }
}

run();
