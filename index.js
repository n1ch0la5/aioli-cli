#!/usr/bin/env node

const { program } = require('commander');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

program
  .name('aioli')
  .description('CLI to create new Aioli projects (Laravel backend + Electron frontend)')
  .version('1.0.0');

program
  .command('start')
  .description('Start the development server for an Aioli project')
  .option('-p, --project <name>', 'Project name (defaults to current directory name)')
  .action((options) => {
    // Determine project name
    let projectName = options.project;
    
    if (!projectName) {
      // If no project name provided, use the current directory name
      const currentDir = process.cwd();
      projectName = path.basename(currentDir);
      
      // Check if we're in a project subdirectory
      if (projectName.endsWith('api') || projectName.endsWith('app')) {
        projectName = projectName.slice(0, -3); // Remove 'api' or 'app' suffix
      }
    }
    
    console.log(`Starting development server for project: ${projectName}`);

    // Determine if we're in a project directory
    const currentDir = process.cwd();
    const possibleApiDir = path.join(currentDir, `${projectName}api`);
    const inProjectRoot = fs.existsSync(possibleApiDir);
    
    let apiDir;
    
    if (inProjectRoot) {
      // We're in the project root
      apiDir = possibleApiDir;
    } else if (path.basename(currentDir) === `${projectName}api`) {
      // We're already in the API directory
      apiDir = currentDir;
    } else {
      // Look up one directory to see if we're in the app directory
      const parentDir = path.dirname(currentDir);
      apiDir = path.join(parentDir, `${projectName}api`);
      
      if (!fs.existsSync(apiDir)) {
        console.error(`❌ Could not locate the ${projectName}api directory`);
        console.error('Please run this command from the project root or a project subdirectory');
        process.exit(1);
      }
    }
    
    // Check if startdev.js exists
    const startdevPath = path.join(apiDir, 'startdev.js');
    if (!fs.existsSync(startdevPath)) {
      console.error(`❌ Could not find startdev.js in ${apiDir}`);
      process.exit(1);
    }
    
    // Run the startdev.js script
    try {
      console.log(`Running node startdev.js in ${apiDir}...`);
      execSync(`cd ${apiDir} && node startdev.js`, { stdio: 'inherit' });
    } catch (error) {
      console.error(`❌ Failed to start development server: ${error.message}`);
      process.exit(1);
    }
  });

program
  .command('new <projectName>')
  .description('Create a new Aioli project')
  .option('-p, --path <path>', 'Path where the project should be created', '.')
  .action((projectName, options) => {
    const projectPath = path.join(options.path, projectName);
    
    console.log(`Creating new Aioli project: ${projectName}`);
    
    // Create project directory
    try {
      fs.mkdirSync(projectPath, { recursive: true });
      console.log(`✅ Created project directory: ${projectPath}`);
    } catch (error) {
      console.error(`❌ Failed to create project directory: ${error.message}`);
      process.exit(1);
    }
    
    // Clone the backend repository
    try {
      console.log('Cloning backend (Laravel) repository...');
      execSync(`git clone git@github.com:n1ch0la5/aioli-laravel.git ${path.join(projectPath, `${projectName}api`)}`, { stdio: 'inherit' });
      console.log('✅ Backend repository cloned successfully');
    } catch (error) {
      console.error(`❌ Failed to clone backend repository: ${error.message}`);
      process.exit(1);
    }
    
    // Clone the frontend repository
    try {
      console.log('Cloning frontend (Electron) repository...');
      execSync(`git clone git@github.com:n1ch0la5/aioli-electron.git ${path.join(projectPath, `${projectName}app`)}`, { stdio: 'inherit' });
      console.log('✅ Frontend repository cloned successfully');
    } catch (error) {
      console.error(`❌ Failed to clone frontend repository: ${error.message}`);
      process.exit(1);
    }
    
    // Run Herd commands in the backend directory
    try {
      console.log(`Setting up Laravel Herd in ${projectName}api directory...`);
      execSync(`cd ${path.join(projectPath, `${projectName}api`)} && herd link`, { stdio: 'inherit' });
      execSync(`cd ${path.join(projectPath, `${projectName}api`)} && herd secure`, { stdio: 'inherit' });
      console.log('✅ Herd setup completed successfully');
    } catch (error) {
      console.error(`❌ Failed to set up Herd: ${error.message}`);
      console.error(`Please run "herd link" and "herd secure" manually in the ${projectName}api directory`);
      // Not exiting as this is not critical to project creation
    }
    
    // Run Composer install and Artisan setup
    try {
      console.log(`Installing Composer dependencies and running setup in ${projectName}api directory...`);
      execSync(`cd ${path.join(projectPath, `${projectName}api`)} && composer install`, { stdio: 'inherit' });
      console.log('✅ Composer dependencies installed successfully');
      
      execSync(`cd ${path.join(projectPath, `${projectName}api`)} && php artisan aioli:setup`, { stdio: 'inherit' });
      console.log('✅ Aioli setup completed successfully');
      
      // Get the REVERB_APP_KEY from the Laravel .env file
      console.log('Reading REVERB_APP_KEY from Laravel .env file...');
      let reverbAppKey = '';
      try {
        const laravelEnv = fs.readFileSync(path.join(projectPath, `${projectName}api`, '.env'), 'utf8');
        const reverbKeyMatch = laravelEnv.match(/REVERB_APP_KEY=([^\r\n]+)/);
        if (reverbKeyMatch && reverbKeyMatch[1]) {
          reverbAppKey = reverbKeyMatch[1];
          console.log('✅ REVERB_APP_KEY found');
        } else {
          console.log('⚠️ REVERB_APP_KEY not found in Laravel .env');
        }
      } catch (error) {
        console.error(`⚠️ Error reading Laravel .env: ${error.message}`);
      }
      
      // Set up the Electron app's .env file
      console.log(`Setting up environment in ${projectName}app directory...`);
      try {
        // Copy .env.example to .env
        fs.copyFileSync(
          path.join(projectPath, `${projectName}app`, '.env.example'),
          path.join(projectPath, `${projectName}app`, '.env')
        );
        
        // Read the app .env file
        let appEnv = fs.readFileSync(path.join(projectPath, `${projectName}app`, '.env'), 'utf8');
        
        // Update the values
        appEnv = appEnv
          .replace(/VITE_LARAVEL_URI=.*/, `VITE_LARAVEL_URI=https://${projectName}api.test`)
          .replace(/VITE_REVERB_HOST=.*/, `VITE_REVERB_HOST=${projectName}api.test`);
        
        // Add REVERB_APP_KEY if found
        if (reverbAppKey) {
          appEnv = appEnv.replace(/VITE_REVERB_APP_KEY=.*/, `VITE_REVERB_APP_KEY=${reverbAppKey}`);
        }
        
        // Write back the modified .env file
        fs.writeFileSync(path.join(projectPath, `${projectName}app`, '.env'), appEnv);
        
        // Delete the .env.example file
        fs.unlinkSync(path.join(projectPath, `${projectName}app`, '.env.example'));
        
        console.log('✅ App environment configured successfully');
        
        // Try to run npm install in the app directory
        try {
          console.log(`Installing npm dependencies in ${projectName}app directory...`);
          execSync(`cd ${path.join(projectPath, `${projectName}app`)} && npm install`, { 
            stdio: 'inherit',
            env: { ...process.env, HOME: require('os').homedir() } // Ensure HOME is set correctly
          });
          console.log('✅ npm dependencies installed successfully');
        } catch (error) {
          console.error(`⚠️ Failed to install npm dependencies: ${error.message}`);
          console.error(`You may need to manually run "npm install" in the ${projectName}app directory`);
          console.error('If you encounter permission errors, try running with sudo or fixing directory permissions');
        }
      } catch (error) {
        console.error(`❌ Failed to configure app environment: ${error.message}`);
        console.error(`You may need to manually configure the .env file in the ${projectName}app directory`);
      }
    } catch (error) {
      console.error(`❌ Failed during Composer/Artisan setup: ${error.message}`);
      console.error(`You may need to run "composer install" and "php artisan aioli:setup" manually in the ${projectName}api directory`);
      // Not exiting as this is not critical to project creation
    }
    
    // Initialize a new git repository for the overall project
    try {
      console.log('Initializing new git repository for the project...');
      
      // Remove the .git directories from the cloned repos
      execSync(`rm -rf ${path.join(projectPath, `${projectName}api/.git`)}`, { stdio: 'inherit' });
      execSync(`rm -rf ${path.join(projectPath, `${projectName}app/.git`)}`, { stdio: 'inherit' });
      
      // Initialize a new git repository
      execSync(`cd ${projectPath} && git init`, { stdio: 'inherit' });
      execSync(`cd ${projectPath} && git add .`, { stdio: 'inherit' });
      execSync(`cd ${projectPath} && git commit -m "Initial commit for ${projectName} project"`, { stdio: 'inherit' });
      
      console.log('✅ Git repository initialized successfully');
    } catch (error) {
      console.error(`❌ Failed to initialize git repository: ${error.message}`);
      // Not exiting here as this is not critical
    }
    
    // Perform any necessary setup or configuration
    try {
      console.log('Setting up project...');
      
      // Update project name in relevant files if needed
      // This would depend on your specific project structure
      // For example:
      // - Update package.json in frontend
      // - Update .env files with project-specific values
      // - Update configuration files
      
      console.log('✅ Project setup completed');
    } catch (error) {
      console.error(`❌ Failed to set up project: ${error.message}`);
    }
    
    console.log(`\n🎉 Aioli project "${projectName}" created successfully!`);
    console.log(`\nNext steps:`);
    console.log(`1. Run aioli start in the laravel ${projectName}api terminal`);
    console.log(`2. Register a new user at ${projectName}api/register and save the password`);
    console.log(`3. Put the email and password from your newly registerd user in the electron ${projectName}app .env file (no # or $ symbols)`)
    console.log(`4. Run npm run dev in the ${projectName}app terminal`);
    
    // Prompt to open in VS Code
    const readline = require('readline').createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    readline.question('\nDo you want to open the projects in VS Code? (Y/n): ', (answer) => {
      const shouldOpen = answer.toLowerCase() !== 'n';
      
      if (shouldOpen) {
        console.log('Opening projects in VS Code...');
        try {
          // Open the API project
          execSync(`code ${path.join(projectPath, `${projectName}api`)}`, { stdio: 'inherit' });
          console.log(`✅ Opened ${projectName}api in VS Code`);
          
          // Open the App project
          execSync(`code ${path.join(projectPath, `${projectName}app`)}`, { stdio: 'inherit' });
          console.log(`✅ Opened ${projectName}app in VS Code`);
        } catch (error) {
          console.error(`❌ Failed to open projects in VS Code: ${error.message}`);
          console.error('Make sure VS Code is installed and the "code" command is in your PATH');
        }
      }
      
      readline.close();
    });
  });

program.parse(process.argv);