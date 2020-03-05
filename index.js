const core = require('@actions/core');
const github = require('@actions/github');

// Toolkit docs: https://github.com/actions/toolkit

async function run() {
  try {
    const inputs = {
      token: core.getInput('github-token', {required: true})
    };

    // Pull-request format: https://developer.github.com/v3/pulls/#response
    const variables = {
      prNumber: github.context.payload.pull_request.number
    };

    const body = github.context.payload.pull_request.body;

    console.log('initial description: ', body);

    if (!body) return;

    const newBody = (body.match(/{{\w+}}/g) || '').reduce((contents, variable) => {
      console.log('variable: ', variable);

      const variableName = variable.replace(/({|})/g, '');
      const replacement = variables.prNumber;
      // const replacement = variables(variableName);

      // console.log('replacement: ', replacement);
      // console.log('current description: ', currentBody);

      // if(!replacement) return contents;

      // console.log(typeof currentBody.replace);

      console.log('variable name', variable);
      console.log('variable again', variable);
      console.log('replacement', replacement);

      return contents.replace(variable, replacement);

      // return contents.replace('{{prNumber}}', variables.prNumber);
    }, body);

    console.log('new description: ', newBody);

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
