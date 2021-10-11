---
type: docs
title: "completion CLI command reference"
linkTitle: "completion"
description: "Detailed information on the completion CLI command"
---

### Description

Generates shell completion scripts

### Usage

```bash
dapr completion [flags]
dapr completion [command]
```

### Flags

| Name           | Environment Variable | Default | Description              |
| -------------- | -------------------- | ------- | ------------------------ |
| `--help`, `-h` |                      |         | Prints this help message |

### Examples

#### Installing bash completion on macOS using Homebrew

If running Bash 3.2 included with macOS:

```bash
brew install bash-completion
```

Or, if running Bash 4.1+:

```bash
brew install bash-completion@2
```

Add the completion to your completion directory:

```bash
dapr completion bash > $(brew --prefix)/etc/bash_completion.d/dapr
source ~/.bash_profile
```

#### Installing bash completion on Linux

If bash-completion is not installed on Linux, please install the bash-completion' package via your distribution's package manager.

Load the dapr completion code for bash into the current shell:

```bash
source <(dapr completion bash)
```

Write bash completion code to a file and source if from .bash_profile:

```bash
dapr completion bash > ~/.dapr/completion.bash.inc
printf "source '$HOME/.dapr/completion.bash.inc'" >> $HOME/.bash_profile
source $HOME/.bash_profile
```

#### Installing zsh completion on macOS using homebrew

If zsh-completion is not installed on macOS, please install the 'zsh-completion' package:

```bash
brew install zsh-completions
```

Set the dapr completion code for zsh[1] to autoload on startup:
```bash
dapr completion zsh > "${fpath[1]}/_dapr"
source ~/.zshrc
```

#### Installing zsh completion on Linux

If zsh-completion is not installed on Linux, please install the 'zsh-completion' package via your distribution's package manager.

Load the dapr completion code for zsh into the current shell:

```bash
source <(dapr completion zsh)
```

Set the dapr completion code for zsh[1] to autoload on startup:

```bash
dapr completion zsh > "${fpath[1]}/_dapr"
```

#### Installing Powershell completion on Windows

Create $PROFILE if it not exists:

```bash
if (!(Test-Path -Path $PROFILE )){ New-Item -Type File -Path $PROFILE -Force }
```

Add the completion to your profile:

```bash
dapr completion powershell >> $PROFILE
```

### Available Commands

```txt
bash        Generates bash completion scripts
powershell  Generates powershell completion scripts
zsh         Generates zsh completion scripts
```
