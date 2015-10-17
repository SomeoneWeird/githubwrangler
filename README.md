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
    }
  ]
}
```

# Type of checks

## webhook

Options:

* **name** (string, *optional*) - A description for this webhook (only used for CLI output)
* **url** (string) - The URL of the webhook that should be checked.
* **events** (array of strings) - An array of event names that the URL should be activated on.
