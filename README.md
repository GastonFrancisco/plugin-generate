**NOTE: This template for sf plugins is not yet official. Please consult with the Platform CLI team before using this template.**

# plugin-generate

[![NPM](https://img.shields.io/npm/v/@salesforce/plugin-generate.svg?label=@salesforce/plugin-generate)](https://www.npmjs.com/package/@salesforce/plugin-generate) [![Downloads/week](https://img.shields.io/npm/dw/@salesforce/plugin-generate.svg)](https://npmjs.org/package/@salesforce/plugin-generate) [![License](https://img.shields.io/badge/License-BSD%203--Clause-brightgreen.svg)](https://raw.githubusercontent.com/salesforcecli/plugin-generate/main/LICENSE.txt)

## Using the template

This repository provides a template for creating a plugin for the Salesforce CLI. To convert this template to a working plugin:

1. Please get in touch with the Platform CLI team. We want to help you develop your plugin.
2. Generate your plugin:

    ```
    sf plugins install dev
    sf dev generate plugin

    git init -b main
    git add . && git commit -m "chore: initial commit"
    ```

3. Create your plugin's repo in the salesforcecli github org
4. When you're ready, replace the contents of this README with the information you want.

## Learn about `sf` plugins

Salesforce CLI plugins are based on the [oclif plugin framework](https://oclif.io/docs/introduction). Read the [plugin developer guide](https://developer.salesforce.com/docs/atlas.en-us.sfdx_cli_plugins.meta/sfdx_cli_plugins/cli_plugins_architecture_sf_cli.htm) to learn about Salesforce CLI plugin development.

This repository contains a lot of additional scripts and tools to help with general Salesforce node development and enforce coding standards. You should familiarize yourself with some of the [node developer packages](#tooling) used by Salesforce. There is also a default circleci config using the [release management orb](https://github.com/forcedotcom/npm-release-management-orb) standards.

Additionally, there are some additional tests that the Salesforce CLI will enforce if this plugin is ever bundled with the CLI. These test are included by default under the `posttest` script and it is required to keep these tests active in your plugin if you plan to have it bundled.

### Tooling

-   [@salesforce/core](https://github.com/forcedotcom/sfdx-core)
-   [@salesforce/kit](https://github.com/forcedotcom/kit)
-   [@salesforce/sf-plugins-core](https://github.com/salesforcecli/sf-plugins-core)
-   [@salesforce/ts-types](https://github.com/forcedotcom/ts-types)
-   [@salesforce/ts-sinon](https://github.com/forcedotcom/ts-sinon)
-   [@salesforce/dev-config](https://github.com/forcedotcom/dev-config)
-   [@salesforce/dev-scripts](https://github.com/forcedotcom/dev-scripts)

# Everything past here is only a suggestion as to what should be in your specific plugin's description

This plugin is bundled with the [Salesforce CLI](https://developer.salesforce.com/tools/sfdxcli). For more information on the CLI, read the [getting started guide](https://developer.salesforce.com/docs/atlas.en-us.sfdx_setup.meta/sfdx_setup/sfdx_setup_intro.htm).

We always recommend using the latest version of these commands bundled with the CLI, however, you can install a specific version or tag if needed.

## Install

```bash
sf plugins install @salesforce/plugin-generate@x.y.z
```

## Issues

Please report any issues at https://github.com/forcedotcom/cli/issues

## Contributing

1. Please read our [Code of Conduct](CODE_OF_CONDUCT.md)
2. Create a new issue before starting your project so that we can keep track of
   what you are trying to add/fix. That way, we can also offer suggestions or
   let you know if there is already an effort in progress.
3. Fork this repository.
4. [Build the plugin locally](#build)
5. Create a _topic_ branch in your fork. Note, this step is recommended but technically not required if contributing using a fork.
6. Edit the code in your fork.
7. Write appropriate tests for your changes. Try to achieve at least 95% code coverage on any new code. No pull request will be accepted without unit tests.
8. Sign CLA (see [CLA](#cla) below).
9. Send us a pull request when you are done. We'll review your code, suggest any needed changes, and merge it in.

### CLA

External contributors will be required to sign a Contributor's License
Agreement. You can do so by going to https://cla.salesforce.com/sign-cla.

### Build

To build the plugin locally, make sure to have yarn installed and run the following commands:

```bash
# Clone the repository
git clone git@github.com:salesforcecli/plugin-generate

# Install the dependencies and compile
yarn && yarn build
```

To use your plugin, run using the local `./bin/dev` or `./bin/dev.cmd` file.

```bash
# Run using local run file.
./bin/dev hello world
```

There should be no differences when running via the Salesforce CLI or using the local run file. However, it can be useful to link the plugin to do some additional testing or run your commands from anywhere on your machine.

```bash
# Link your plugin to the sf cli
sf plugins link .
# To verify
sf plugins
```

## Commands

<!-- commands -->

-   [`sf generate fields`](#sf-generate-fields)
-   [`sf hello world`](#sf-hello-world)

## `sf generate fields`

Parse your CustomFields.

```
USAGE
  $ sf generate fields -p <value> -e <value> -s <value> [--json] [--flags-dir <value>]

FLAGS
  -e, --encoding=<value>  (required) Encoding of the csv
  -p, --path=<value>      (required) The path of the csv file you would like to parse.
  -s, --project=<value>   (required) Salesforce Project path.

GLOBAL FLAGS
  --flags-dir=<value>  Import flag values from a directory.
  --json               Format output as json.

DESCRIPTION
  Parse your CustomFields.

  Parse your fields by providing a csv file and a folder with xml files will be created.

EXAMPLES
  Say hello to the world:

    $ sf generate fields

  Say hello to someone you know:

    $ sf generate fields --name Astro

FLAG DESCRIPTIONS
  -e, --encoding=<value>  Encoding of the csv

    The encoding of the csv file to parse.

  -p, --path=<value>  The path of the csv file you would like to parse.

    This path should lead to a csv file.

  -s, --project=<value>  Salesforce Project path.

    This path should lead to a folder/directory containing a Salesforce Project.
```
