# Aioli CLI

A command-line tool for creating and managing Aioli projects (Laravel backend + Electron frontend).

## Overview

Aioli CLI streamlines the process of creating and managing projects based on the Aioli stack - a combination of Laravel (backend API) and Electron (desktop application frontend). This tool automates the setup process, allowing you to quickly scaffold new projects with a standard structure.

The Aioli stack consists of:
- [aioli-laravel](https://github.com/n1ch0la5/aioli-laravel) - The Laravel backend API
- [aioli-electron](https://github.com/n1ch0la5/aioli-electron) - The Electron desktop application frontend

## Installation

```bash
# Clone the repository
git clone https://github.com/n1ch0la5/aioli-cli.git

# Change to the directory
cd aioli-cli

# Install dependencies
npm install

# Link the CLI tool globally
npm link
```

After running these commands, the `aioli` command will be available globally in your terminal.

## Prerequisites

- Node.js and npm
- Git
- Laravel Herd (for local development)
- Visual Studio Code (optional, for the open-in-editor feature)
- "Open Terminal Programmatically" VS Code extension

## Usage

### Creating a New Project

```bash
aioli new projectname
```

This command:
1. Creates a new directory structure with `projectnameapi` (Laravel backend) and `projectnameapp` (Electron frontend)
2. Clones the repositories from GitHub
3. Sets up Laravel Herd for local development
4. Runs `composer install` in the API directory
5. Runs `php artisan aioli:setup` to configure the Laravel application
6. Configures the Electron app's environment file with correct values:
   - Creates .env from .env.example
   - Sets Laravel URI to https://projectnameapi.test
   - Sets Reverb host to projectnameapi.test
   - Copies the Reverb app key from the Laravel .env
   - Deletes the .env.example file
7. Attempts to install npm dependencies in the app directory
8. Initializes a new Git repository for the project
9. Optionally opens the projects in VS Code

#### Options

- `-p, --path <path>` - Specify a custom path for project creation (default: current directory)

### Starting the Development Server (Laravel)

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
2. Navigate to the project directory: `cd myproject`
3. Start the Laravel API: `aioli start` in the myprojectapi directory
4. Register a new user at https://myprojectapi.test/register
5. Add the user credentials to the myprojectapp/.env file:
   ```
   VITE_USER_EMAIL=your_email@example.com
   VITE_USER_PASSWORD=your_password
   ```
6. Start the Electron app: Run `npm run dev` in the myprojectapp directory
7. Begin development in the VS Code windows

## Customization

If you need to modify the default repositories or behavior:

1. Fork the [aioli-laravel](https://github.com/n1ch0la5/aioli-laravel) and [aioli-electron](https://github.com/n1ch0la5/aioli-electron) repositories
2. Clone the [aioli-cli](https://github.com/n1ch0la5/aioli-cli) repository
3. Modify the repository URLs in the CLI code
4. Publish your version of the CLI

# Windows Compatibility

Aioli CLI now supports both macOS and Windows. Here are some important notes for Windows users:

## Windows-specific Setup

1. **No Herd Support**: Laravel Herd is macOS-specific, so on Windows you'll need to:
   - Set up a local development environment using Laragon, XAMPP, or Laravel Sail
   - Configure your hosts file manually to point `projectnameapi.test` to your local server

2. **Command Line Differences**: 
   - Windows uses different path separators and command syntax
   - The CLI handles these differences automatically

3. **URL Opening**: 
   - Windows uses `start` instead of `open` to launch URLs
   - The updated startdev.js script now handles this automatically

## Troubleshooting on Windows

### Common Issues

1. **SSL Certificate Issues**: 
   - You may need to manually trust the SSL certificate for your local development environment
   - Look for options in your local development tool to generate and trust certificates

2. **Path Issues**:
   - If you encounter path-related errors, try using forward slashes (/) instead of backslashes (\\)
   - Avoid spaces in your project path

3. **Permission Errors**: 
   - Run command prompt or PowerShell as Administrator if you encounter permission issues
   - On Windows, avoid running the CLI from a network drive

4. **Terminal Integration**:
   - Make sure VS Code's "Open Terminal Programmatically" extension is installed
   - If terminals don't open automatically, you can manually start the required processes

### Required Software on Windows

- Git for Windows
- Node.js and npm
- PHP 8.1+ (available in your PATH)
- Composer
- Visual Studio Code with "Open Terminal Programmatically" extension

If you encounter any Windows-specific issues, please report them on the GitHub repository.

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