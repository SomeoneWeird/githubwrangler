# githubdoctor
Program for managing Github repository expectations

# Installation

```
npm install -g githubdoctor
```

# Usage

`githubdoctor` requires you pass a json file as the first parameter.

Example:

```js
{
  org: "myorganisation",
  checks: [
    {
      type: "webhook",
      url: "https://youdomain.com/webhook",
      events: [
        "push"
      ]
    },
    {
      type: "team",
      team: "ci",
      access: "pull"
    }
  ]
}
```

```
➜  githubdoctor git:(master) ✗ ./lib/index.js example.json
 ✘  Webhook 'Slack - Engineering' not found for myorganisation/testrepo
:   Would you like to add this webhook? (y/n):  y
 ✓  Successfully added webhook to myorganisation/testrepo
 ✘  Team 'ci' does not have access to myorganisation/testrepo
:   Would you like to add this team? (y/n):  y
 ✓  Successfully added team to myorganisation/testrepo
 ```

# Type of checks

## webhook

Options:

* **name** (string, *optional*) - A description for this webhook (only used for CLI output)
* **url** (string) - The URL of the webhook that should be checked.
* **events** (array of strings) - An array of event names that the URL should be activated on.

## team

Options:

* **team** (string) - The slug for the team you wish to add.
* **access** (string) - Level of access you wish to give this team ('pull', 'push' or 'admin')
