const core = require('@actions/core')
const App = require('./src/app')

try {
  const input = {
    issuetypes: core.getInput('issuetypes'),
    transitions: core.getInput('transitions')
  }
  if (!input.issuetypes || !input.transitions) {
    throw new Error('Invalid input')
  }
  const issuetypes = input.issuetypes.split(',')
  const transitions = input.transitions.split(',')
  if (issuetypes.length !== transitions.length) {
    throw new Error('Length of issuetypes input don\'t equal with length of transitions input')
  }
  const app = new App(issuetypes, transitions)
  app.init()
} catch (error) {
  core.setFailed(error.toString())
}
