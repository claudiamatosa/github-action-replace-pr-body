const core = require('@actions/core');
const github = require('@actions/github');

async function run() {
  try {
    const inputs = {
      token: core.getInput('github-token', {required: true}),
      variables: core.getInput('github-token', {required: true})
    };

    // Pull-request format: https://developer.github.com/v3/pulls/#response
    const variables = {
      prNumber: github.context.payload.pull_request.number
    };

    const body = github.context.payload.pull_request.body;

    core.debug('initial description: ', body);

    if (!body) return;

    const newBody = (body.match(/{{\w+}}/g) || '').reduce((currentBody, variable) => {
      core.debug('variable: ', variable);

      const variableName = variable.replace(/({|})/g, '');
      const replacement = variables(variableName);

      core.debug('replacement: ', replacement);
      core.debug('current description: ', currentBody);

      if(!replacement) return body;

      return currentBody.replace(variable, replacement);
    }, body);

    core.debug('new description: ', newBody);

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
