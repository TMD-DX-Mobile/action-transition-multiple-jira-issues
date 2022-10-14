
# Message from the author : 
This action is fusioning these two actions : 
- https://github.com/bloobirds-it/action-transition-multiple-jira-issues
- https://github.com/chontawee/gj-find-transition-issues

You can apply a transition on multiples issues, whatever there types.

# action-transition-multiple-jira-issues

Find issue keys from commit messages and transition them to status which you want

## Usage

```yaml
- name: Jira find and transition issues
  uses: mop-Technical-User/action-transition-multiple-jira-issues@main
  with:
    jira-base-url: https://<yourdomain>.atlassian.net
    jira-user-email: human@example.com
    jira-api-token: ${{ secrets.JIRA_API_TOKEN }}
    github-token: ${{ secrets.GITHUB_TOKEN }}
    issuetypes: Story,Bug
    transitions: In Progress,In Progress
```

## Inputs

| **Name**        | **Description**                                                           | **Required** |
| --------------- | ------------------------------------------------------------------------- | ------------ |
| jira-base-url   | URL of Jira instance                                                      | ✔            |
| jira-api-token  | Access Token for Authorization                                            | ✔            |
| jira-user-email | Email of the user for which Access Token was created for                  | ✔            |
| github-token    | Your everyday GitHub token                                                | ✔            |
| issuetypes      | Type of issues on your workflow. They will map with transitions arguments.  | ✔            |
| transitions | Transitions status which you want to move. They will depends on issuetypes argument. Example: In Progress,To Do Note: Relationship between issuetypes and transitions argument be shown below Example issuetypes is **Story,Bug** and transtions is **In Progress, To Do**                              | ✔            |

## References

- [atlassian/gajira-login](https://github.com/atlassian/gajira-login.git)
- [atlassian/gajira-find-issue-key](https://github.com/atlassian/gajira-find-issue-key.git)
- [atlassian/gajira-transition](https://github.com/atlassian/gajira-transition.git)
- [https://github.com/chontawee/gj-find-transition-issues](https://github.com/chontawee/gj-find-transition-issues)
