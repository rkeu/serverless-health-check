const find = require('find-process')

const signal = async (name, sig) => {
  const details = (await find('name', name, true))[0]
  if (!details || !details.pid)
    throw new Error(`Process named "${name}" not found!`)
  process.kill(details.pid, sig)
}

module.exports = {
  signal,
  readinessCheck: (isReady) =>
    process.on('SIGPIPE', async () =>
      signal('ready', await isReady() ? 'SIGPIPE' : 'SIGINT')
    )
}
