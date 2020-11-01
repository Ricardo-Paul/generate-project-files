import { promisify } from 'util' //convert cb-based APIs to promises
import ncp from 'ncp';
import path from 'path'; //path.resolve() will connect path segments
import chalk from 'chalk';

import fs from 'fs';
// we need fs.access to check if the path exists
// fs has an object (fs.constants) that contains fs.constants.R_OK
// fs.constant.R_OK lets us know if we have read permission on the path

import execa from 'execa';
import Listr from 'listr';
import { projectInstall } from 'pkg-install'; //to trigger yarn install or npm install

const copy = promisify(ncp);
const access = promisify(fs.access);

async function copyTemplateFiles(options){ // we need to attach these two keys to the options object
    return copy(options.templateDirectory, options.targetDirectory, {
        clobber: false
    })
}

async function initGit(options){ //will need options.targetDirectory to put git file
   const result = await execa('git', ['init'], {
        cwd: options.targetDirectory
    })
    if(result.failed){
        return Promise.reject(new Error(' Cannot initialize git'));
    }
console.log(`${chalk.green('Git initialized using cwd')} :${options.targetDirectory}`)
return;
}
// git status to verify
// rm -rf .git to force remove .git folder

export async function createProject(options){
    options = {
        ...options,
        targetDirectory: options.targetDirectory || process.cwd(),
    }
    //import.meta is an object that exposes the curr file url
    // new URL(import.meta.url) return a URL object with pathname
    const currentFileUrl = import.meta.url;
    const pathname = new URL(currentFileUrl).pathname; // => '/home/ricardo/Desktop/Node/CLI/create-project/src/main.js'
    const chosenTemplate = options.template.toLowerCase();
    const tempDir = path.resolve(pathname, '../../templates', chosenTemplate);

    options.templateDirectory = tempDir;

    // check if we have read access to that directory
    try {
        await access(tempDir, fs.constants.R_OK)
    } catch(error){
        console.error('%s Invalid', chalk.red(error));
        process.exit();
    }

    // copy the files to cwd(currently working dir)


    const tasks = new Listr([{
        title: 'Copy template files in cwd',
        task: () => console.log('passively disable file copy')
        // enabled: () => options.git 
    },{
        title: 'Initialize git repo',
        task: () => console.log('passively disable git init')
    },{
        title: 'Install dependencies',
        task: () => projectInstall({
            cwd: options.targetDirectory
        }),
        skip: () => !options.runInstall?'Use --install to automatically install your packages':undefined
    }]);

    try{
        await tasks.run()
    } catch(error){
        console.log(error)
    }
    
    // await copyTemplateFiles(options); 
    console.log(chalk.green('Passively dissable files copying!'));
    // console.log('options from create project', options)
}