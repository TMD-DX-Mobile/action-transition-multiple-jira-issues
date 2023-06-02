const Jira = require("./jira");
const Github = require("./github");

class App {
  
  constructor(issuetypes, transitions) {
    this.issuetypes = issuetypes
    this.transitions = transitions
    this.jira = new Jira();
    this.github = new Github();
    this.publishComment = false
  }

  async init() {
    const commitMessages = await this.github.getPullRequestCommitMessages();
    const titleAndBranchName = await this.github.getPrTitleAndBranchName();
    const issueKeys = this.findIssueKeys(commitMessages, titleAndBranchName)
    const transitionIssues = await this.getTransitionIdsAndKeys(issueKeys)
    await this.transitionIssues(transitionIssues.issueKeys, transitionIssues.transitionIds)

    const jiraIssueList = await this.getIssueListFromKeys(issueKeys);
    await this.publishCommentWithIssues(jiraIssueList, transitionIssues);
  }

  findIssueKeys(commitMessages, titleAndBranchName) {
    if (!commitMessages) {
      console.dir(commitMessages)
      throw new Error(`commitMessages is empty`)
    }

    const issueIdRegEx = /([a-zA-Z0-9]+-[0-9]+)/g
    const valuesWithTickets = commitMessages.concat(titleAndBranchName)
    console.dir(valuesWithTickets)

    // Get issue keys and remove duplicate keys
    const issueKeys = valuesWithTickets
    .flatMap(message => message.match(issueIdRegEx) ? message.toUpperCase().match(issueIdRegEx) : [])
    .filter((key,index,array) => array.indexOf(key) === index)

    if (issueKeys.length == 0) {
      throw new Error(`Commit messages doesn't contain any issue keys`)
    }

    console.log(`Found issue keys: ${issueKeys.join(' ')}`)
    return issueKeys
  }

  async getTransitionIdsAndKeys(issues) {
    const transitionIds = [];
    const issueKeys = [];
    for (const issue of issues) {
      const issueData = await this.jira.getIssue(issue)
      const issuetypeName = issueData.fields.issuetype.name
      const issueStatus = issueData.fields.status.name
      const issuetypeIndex = this.issuetypes.indexOf(issuetypeName)
      
      if (this.transitions[issuetypeIndex] !== issueStatus) { // current status !== transition status
        const { transitions: availableTransitions } = await this.jira.getIssueTransitions(issue)
        const designedTransition = availableTransitions.find(eachTransition => eachTransition.name === this.transitions[issuetypeIndex])
        if (!designedTransition) {
          console.log(`Cannot find transition "${this.transitions[issuetypeIndex]} for issue ${issue}"`)
          console.log('Possible transitions:')
          availableTransitions.forEach((t) => {
            console.log(`{ id: ${t.id}, name: ${t.name} } transitions issue to '${t.to.name}' status.`)
          })
        }
        else{
          issueKeys.push(issue)
          transitionIds.push({
            id: designedTransition.id,
            name: designedTransition.name
          })
          this.publishComment = true
        }
      } else { // current status === transition status
        console.log(`Issue ${issue} is already in ${issueStatus} status`)
      }
    }
    return { issueKeys, transitionIds }
  }

  async transitionIssues(issueKeys, transitionIds) {
    for (let i=0; i<issueKeys.length; i++) {
      console.log(`Transitioning issue "${issueKeys[i]}" to "${transitionIds[i].name}"`)
      await this.jira.transitionIssue(issueKeys[i], transitionIds[i].id)
    }
  }

  async getIssueListFromKeys(issueKeys) {
    const issuesData = await Promise.all(issueKeys.map((issueKey) => this.jira.getIssue(issueKey)));
    return issuesData
  }

  async publishCommentWithIssues(issueList, transitionIssues) {
    if (this.publishComment && issueList.length > 0) {
      const issueStatus = issueList[0].fields.status.name
      const issueComment = issueList
        .filter(issue => transitionIssues.issueKeys.includes(issue.key))
        .map((issue) => {
          const summary = issue.fields.summary;
          const issueUrl = `${this.jira.getBaseUrl()}/browse/${issue.key})`;
          return `- ${summary} ([${issue.key}](${issueUrl})`;
        })
        .join("\n");
      const body = `These issues have been moved to *${issueStatus}*:\n` + issueComment;
      await this.github.publishComment(body);
    }
  }
}

module.exports = App