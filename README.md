# Aioli CLI

A command-line tool for creating and managing Aioli projects (Laravel backend + Electron frontend).

## Overview

Aioli CLI streamlines the process of creating and managing projects based on the Aioli stack - a combination of Laravel (backend API) and Electron (desktop application frontend). This tool automates the setup process, allowing you to quickly scaffold new projects with a standard structure.

The Aioli stack consists of:
- [aioli-laravel](https://github.com/n1ch0la5/aioli-laravel) - The Laravel backend API
- [aioli-electron](https://github.com/n1ch0la5/aioli-electron) - The Electron desktop application frontend

## Installation

```bash
# Install globally via npm
npm install -g aioli-cli

# Or install directly from GitHub
npm install -g n1ch0la5/aioli-cli
```

## Prerequisites

- Node.js and npm
- Git
- Laravel Herd (for local development)
- Visual Studio Code (optional, for the open-in-editor feature)

## Usage

### Creating a New Project

```bash
aioli new projectname
```

This command:
1. Creates a new directory structure with `projectnameapi` (Laravel backend) and `projectnameapp` (Electron frontend)
2. Clones the repositories from GitHub
3. Sets up Laravel Herd for local development
4. Initializes a new Git repository for the project
5. Optionally opens the projects in VS Code

#### Options

- `-p, --path <path>` - Specify a custom path for project creation (default: current directory)

### Starting the Development Server

```bash
aioli start
```

This command:
1. Detects your current project (based on directory structure)
2. Locates and runs the `startdev.js` script in your API directory

#### Options

- `-p, --project <name>` - Explicitly specify which project to start

## Project Structure

When you create a new project named `myproject`, the following structure is created:

```
myproject/
├── myprojectapi/       # Laravel backend
│   └── ...            # Laravel project files
└── myprojectapp/      # Electron frontend
    └── ...            # Electron project files
```

## Development Workflow

1. Create a new project: `aioli new myproject`
2. Navigate to the project: `cd myproject`
3. Start the development environment: `aioli start`
4. Begin development in the automatically opened VS Code windows

## Customization

If you need to modify the default repositories or behavior:

1. Fork the [aioli-laravel](https://github.com/n1ch0la5/aioli-laravel) and [aioli-electron](https://github.com/n1ch0la5/aioli-electron) repositories
2. Clone the [aioli-cli](https://github.com/n1ch0la5/aioli-cli) repository
3. Modify the repository URLs in the CLI code
4. Publish your version of the CLI

## Troubleshooting

### Common Issues

- **Git SSH issues**: Ensure your SSH keys are set up correctly for GitHub
- **Herd command not found**: Make sure Laravel Herd is installed and in your PATH
- **VS Code doesn't open**: Ensure the `code` command is available in your terminal

### Getting Help

If you encounter any issues, please open an issue on the [GitHub repository](https://github.com/n1ch0la5/aioli-cli).

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.