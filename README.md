
# transifex-reminder

A simple NodeJS app to check if incoming pull requests modifies language files. If so it will mark PR's commit with failure status or success otherwise.

## Requirements

* GitHub OAuth2 token with `repo:status` scope,
* NodeJS host accessible from outside world.

## Configuration

1. Create `config.json` based on `config.json.dist` file.
	1. set `token` property to GitHub OAuth2 token,
	1. set a proper `repo` value, e.g. `<yourAccount>/ckeditor-dev` if you want to watch a fork,
1. install dependencies,
	1. `cd transifex-reminder`
	1. `npm install`
1. run server `node server.js`
1. open `ckeditor-dev` GitHub repository page as it's administrator,
	1. open settings page,
	1. Webhooks & services,
	1. Click "Add webhook" button,
	1. Apply proper settings:
		![GitHub settings](http://i.imgur.com/KAUZjEd.png)
	1. Click "Add webhook" button.