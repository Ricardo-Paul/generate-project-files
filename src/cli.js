import arg from 'arg'; //two objects as arguments
import inquirer from 'inquirer';
import { createProject } from './main';

function parseArgumentsIntoOptions(rawArgs){
    const requiredArgs = { //first object takes the args we accept and their aliases
        '--git': Boolean, // need to initialize git?
        '--yes': Boolean, //will you skip prompts?
        '--install': Boolean,
        '-g': '--git',
        '-y': '--yes',
        '-i': '--install' //will you runInstall?
    }
    const passedArgs = { argv: rawArgs.slice(2)} // second object

    const args = arg(requiredArgs)
    return { // return an object of options based on argument
        skipPrompts: args['--yes'] || false,
        git: args['--git'] || false,
        template: args._[0], //the first args that doesnt start with --
        runInstall: args['--install'] || false
    }
}

async function promptForMissingOption(options){
    // if the user skip the promp we set the template to Javascript
    // in case he provides one, we'll use it
    let defaultTemplate = 'JavaScript'
    if(options.skipPrompts){
        return {...options, template: options.template || defaultTemplate}
    }

    // in case the user provides no arg for skipPrompt
    // we won't have value for template either. So we're prompting
    const questions = [];
    if(!options.template){
        questions.push({
            type: 'list',
            choices: ['JavaScript', 'TypeScript'],
            name: 'template',
            message: 'Please choose a template',
            default: defaultTemplate
        })
    }

    if(!options.git){
        questions.push({
            type: 'confirm',
            name: 'git',
            message: 'Do you want to initialize a git repo ?',
            default: false
        })
    }

    const answers = await inquirer.prompt(questions);
    return {
        ...options,
        template: options.template || answers.template,
        git: options.git || answers.git
    }
}


export async function cli(args){
    let options = parseArgumentsIntoOptions(args)
    options = await (promptForMissingOption(options));
    console.log(options)
    await createProject(options)
}

// what args return
// args:{
//     _:[]
// }