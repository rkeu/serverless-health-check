# serverless-health-check

For when you don't want a server, but do want a health check!

## Helper function for apps

You can `npm install @rkeu/serverless-health-check` then require the module in your app code for a handy readiness check helper:

```js
const { readinessCheck } = require('@rkeu/serverless-health-check')

process.title = 'my-app' // helpful for the `ready` check!

/**
 * Some function that returns `true` when the app is up and working
 * properly, or `false` otherwise.
 */
const isReady = async () => true // or `false` if not ready

readinessCheck(isReady)
```

Assuming the `isReady` function does something sensible, your app will now report back to the bundled `ready` check utility.

## The `ready` utility

A simple script to check the readiness of your app:

```sh
./bin/ready my-app
```

Assuming your app follows the basic example previously suggested, the `ready` utility _signals_ the app, which in turn signals back.
`ready` will exit with one of the following codes:
  - `0`, if the app signals it is ready
  - `1`, if the check fails to complete properly (e.g. app not found)
  - `2`, if the app does not signal within the timeout
  - `3`, when the app signals it is **not** ready
  - `4`, where the check has been called incorrectly

Usage info will be printed to `stdout` if `ready` is called incorrectly or without the necessary command line arguments.
