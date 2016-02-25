# githubwrangler
Program for managing Github repository expectations

# Installation

```
npm install -g githubwrangler
```

# Usage

Save a configuration file, then call `githubwrangler` and pass it as a parameter.

`githubwrangler -f example.json`

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
    },
    {
      type: "label",
      name: "do not merge",
      colour: "FF0000"
    }
  ]
}
```

![Example when running](http://i.imgur.com/1zrT7Ve.png)

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

## label

* **name** (string) - Name of the label
* **color** (string) - Hex colour of the label
