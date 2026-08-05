# Contributing Guidelines

Thank you for contributing to this project!

## Before Starting Work

An issue must be created before work begins.

1. Check whether an issue already exists for the task.
2. Create a new issue if one does not exist.
3. Make sure the issue explains what needs to be completed.
4. Use the issue number when creating your branch.

## Create a Branch

Branch names should begin with the related issue number.

Use this format:

```text
issue-number/short-task-description
```

Examples:

```text
12/add-input-component
18/fix-navbar-spacing
24/update-contributors-file
```

Create your branch with:

```bash
git checkout -b 12/add-input-component
```

You can also use:

```bash
git switch -c 12/add-input-component
```

## Making Changes

* Work on one issue at a time.
* Keep your changes focused on the issue.
* Follow the existing code style.
* Test your changes before submitting them.
* Do not include unrelated changes.

## Commit Your Changes

Add your changes:

```bash
git add .
```

Create a short commit message that explains what you changed:

```bash
git commit -m "Add input component"
```

## Push Your Branch

Push your branch to GitHub:

```bash
git push origin 12/add-input-component
```

## Submit a Pull Request

After pushing your branch:

1. Open a pull request.
2. Add a short description of your changes.
3. Link the related issue.
4. Request a review from a team member.

Add this to the pull request description to link and automatically close the issue:

```text
Closes #12
```

Replace `12` with the correct issue number.

## Be Respectful

Be kind, patient, and respectful when working with other contributors. Ask questions when something is unclear.
