const sleep = require('node:timers/promises').setTimeout
const util = require('node:util')
const execFile = util.promisify(require('node:child_process').execFile)
const  { signal, readinessCheck } = require('..')

describe('serverless-health-check', () => {

  describe('signal', () => {
    it('should send SIGPIPE signal to target program', async () => {
      const fixture = execFile('test/ready.fixture')
      await sleep(50)

      await signal('ready.fixture', 'SIGPIPE')

      expect((await fixture).stdout).toEqual('signal=SIGPIPE\n')
      expect(fixture.child.exitCode).toEqual(0)
    })
    it('should send SIGINT signal to target program', async () => {
      const fixture = execFile('test/ready.fixture')
      await sleep(50)

      await signal('ready.fixture', 'SIGINT')

      expect((await fixture).stdout).toEqual('signal=SIGINT\n')
      expect(fixture.child.exitCode).toEqual(0)
    })
  })

  describe('ready', () => {
    describe('readinessCheck', () => {
      it('should exit with code 0 if target program is ready', async () => {
        execFile('test/ready.fixture', ['ready'])
        const ready = execFile('bin/ready', ['ready.fixture'])
        await ready // let the readiness check complete
        expect(ready.child.exitCode).toEqual(0)
      })
      it('should exit with code 3 if target program is NOT ready', async () => {
        expect.assertions(1)
        execFile('test/ready.fixture', ['not ready'])
        try {
          await execFile('bin/ready', ['ready.fixture'])
        } catch (result) {
          expect(result.code).toEqual(3)
        }
      })
      it('should exit with code 2 if ready check times out before target program responds', async () => {
        expect.assertions(1)
        execFile('test/ready.fixture', ['wait'])
        try {
          await execFile('bin/ready', ['ready.fixture', 50])
        } catch (result) {
          expect(result.code).toEqual(2)
        }
      })
      afterEach(() => signal('ready.fixture', 'SIGINT'))
    })

    it('should fail with usage and exit code 4 if called with no args', async () => {
      expect.assertions(3)
      try {
        await execFile('bin/ready')
      } catch (result) {
        expect(result.stderr).toMatch('ERROR: missing required target program name argument')
        expect(result.stdout).toMatch('USAGE')
        expect(result.code).toEqual(4)
      }
    })
    it('should fail with exit code 4 if timeout is not a number', async () => {
      expect.assertions(3)
      try {
        await execFile('bin/ready', ['spam', 'text'])
      } catch (result) {
        expect(result.stderr).toMatch('ERROR: timeout argument must be a number of millis')
        expect(result.stdout).toMatch('USAGE')
        expect(result.code).toEqual(4)
      }
    })
    it('should fail with exit code 1 if target process is not found', async () => {
      expect.assertions(3)
      try {
        await execFile('bin/ready', ['nonexistent'])
      } catch (result) {
        expect(result.stderr).toMatch('Error: Process named "nonexistent" not found!')
        expect(result.stdout).toEqual('')
        expect(result.code).toEqual(1)
      }
    })
  })
  
})
