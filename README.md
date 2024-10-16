# GIT HUB HOURS LOG ACTION

This is a bot for github actions that allow us to log hours on github via issue comments following an special format

```
### LOG
DATE HOUR to HOUR

Description
###
```

## Set up

We need to set up act

> brew install act

Install the dependencies

 > pnpm install
 
Set up the .env file with the GITHUB_TOKEN and WEBHOOK_URL

```
GITHUB_TOKEN=xxxx
WEBHOOK_URL=xxxx
```
 
Run the project, this will watch for changes.

> pnpm run dev 

## Run the project

This will run the project in a container architecture

> act issues --secret-file .env --container-architecture linux/amd64 --eventpath event.json

For specific scenarios make test cases