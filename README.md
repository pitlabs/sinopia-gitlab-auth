# Sinopia TFS Auth Plugin

[![travis badge](https://api.travis-ci.org/pitlabs/sinopia-gitlab-auth.svg?branch=master)](https://travis-ci.org/pitlabs/sinopia-gitlab-auth)

Authenticates the user using a gitlab PAT as password. The username entered is
checked against the gitlab username.

The groups of the user are returned as groups.

## Installation

```sh
$ npm install sinopia
$ npm install sinopia-gitlab-auth
```

## Config

Add to your `config.yaml`:

```yaml
auth:
  gitlab-auth:
    url: https://gitlab.com/api

packages:
  '@groupName/*':
    access: 'groupName'
    publish: admin
```