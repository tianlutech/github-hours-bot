# GIT HUB HOURS LOG ACTION

This is a bot for github actions that allow us to log hours on github via issue comments following an special format

## Usage

Once installed, you can log hours by adding a comment to any issue in the following format:

```
[LOG]
2023-06-01 09:00 to 17:00

Worked on feature X
[/LOG]
```

The app will automatically process this comment call the webhook and log the hours.


## Development

We need to set up act

> brew install act

Install the dependencies

 > pnpm install
 
Set up the .env file with the GITHUB_TOKEN and WEBHOOK_URL

```
GITHUB_TOKEN=xxxx
WEBHOOK_URL=xxxx
```

To test in local you may need to generate a personal access token,
in the pipeline he will use your user github token.

Use a webhook that you can call from local so act will not fail.
 
Run the project, this will watch for changes.

> pnpm run dev 

## Run the project

This will run the project in a container architecture

> act issue_comment --secret-file .env --eventpath event.json 

Mac users may add `--container-architecture linux/amd64`

For specific scenarios make test cases

## Stack

- [Octokit to interact with Issues](https://octokit.github.io/rest.js/v21)