const core = require('@actions/core');
const github = require('@actions/github');

const jiraRE = /^[A-Z]+-\d+/

// Toolkit docs: https://github.com/actions/toolkit

async function run() {
  try {
    const inputs = {
      token: core.getInput('github-token', {required: true})
    };
    console.log(github.context.payload.pull_request.title)
    // Pull-request format: https://developer.github.com/v3/pulls/#response
    const variables = {
      prNumber: github.context.payload.pull_request.number,
      jiraTicket: github.context.payload.pull_request.title.match(jiraRE)
    };

    const body = github.context.payload.pull_request.body;

    console.log('Initial description: ', body);

    if (!body) return;

    const newBody = (body.match(/{{\w+}}/g) || '').reduce((contents, placeholder) => {
      const variableName = placeholder.replace(/({|})/g, '');
      const value = variables[variableName];
      console.log(`Replacing ${placeholder} with ${value}`);
      return contents.replace(placeholder, value);
    }, body);

    console.log('New description: ', newBody);

    const request = {
      owner: github.context.repo.owner,
      repo: github.context.repo.repo,
      pull_number: github.context.payload.pull_request.number,
      body: newBody
    };

    const client = new github.GitHub(inputs.token);
    const response = await client.pulls.update(request);

    if (response.status !== 200) {
      core.error('There was an issue while trying to update the pull-request.');
    }
  } catch (error) {
    core.error(error);
    core.setFailed(error.message);
  }
}

run()
