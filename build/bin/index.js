#!/usr/bin/env node
const { sync: spawnSync } = require("cross-spawn");
const detect = require("detect-port");

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

("use strict");

// Makes the script crash on unhandled rejections instead of silently
// ignoring them. In the future, promise rejections that are not handled will
// terminate the Node.js process with a non-zero exit code.
process.on("unhandledRejection", err => {
  throw err;
});

const args = process.argv.slice(2);

const scriptIndex = args.findIndex(x => x === "build" || x === "build:analyze" || x === "start" || x === "dev" || x === "test");
const script = scriptIndex === -1 ? args[0] : args[scriptIndex];
let nodeArgs = scriptIndex >= 0 ? args.slice(scriptIndex + 1) : [];
// console.log(nodeArgs);

switch (script) {
  case "start":
  case "dev": {
    function detectPort(port) {
      detect(port)
        .then(_port => {
          if (port == _port) {
            console.log(`port: ${port} is not occupied, spawning...`);
            const devProcess = spawnSync(
              "./node_modules/.bin/webpack-dev-server",
              ["--hot", "--config", "./build/webpack/webpack.config.js", `--env.devserverPort=${port}`],
              {
                stdio: "inherit"
              }
            );
          } else {
            console.log(`port: ${port} is occupied, try port: ${_port}`);
            detectPort(port + 1);
          }
        })
        .catch(err => {
          console.log(err);
          process.exit(1);
        });
    }
    detectPort(8080);
    break;
  }

  case "build": {
    process.env.NODE_ENV = "production";
    const envArr = nodeArgs.map(arg => {
      const [argName, argValue] = arg.replace(/^\-\-?/, "").split("=");
      // const argValue = arg.match
      return `--env.${argName}=${argValue}`;
    });
    const devProcess = spawnSync(
      "./node_modules/.bin/webpack",
      ["--config", "./build/webpack/webpack.config.js", ...envArr],
      {
        stdio: "inherit"
      }
    );
    // const devProcess = spawnSync(
    //   "../node_modules/.bin/webpack",
    //   ["--config", ".../webpack/webpack.config.js", ...envArr],
    //   {
    //     stdio: "inherit"
    //   }
    // );
    break;
  }

  case "build:analyze": {
    process.env.NODE_ENV = "production";
    const devProcess = spawnSync(
      "./node_modules/.bin/webpack",
      ["--config", "./build/webpack/webpack.config.js", "--env.analyze=true"],
      {
        stdio: "inherit"
      }
    );
    break;
  }
  // case "test": {
  // const result = spawn.sync(
  //   "node",
  //   nodeArgs
  //     .concat(require.resolve("../scripts/" + script))
  //     .concat(args.slice(scriptIndex + 1)),
  //   { stdio: "inherit" }
  // );
  // if (result.signal) {
  //   if (result.signal === "SIGKILL") {
  //     console.log(
  //       "The build failed because the process exited too early. " +
  //         "This probably means the system ran out of memory or someone called " +
  //         "`kill -9` on the process."
  //     );
  //   } else if (result.signal === "SIGTERM") {
  //     console.log(
  //       "The build failed because the process exited too early. " +
  //         "Someone might have called `kill` or `killall`, or the system could " +
  //         "be shutting down."
  //     );
  //   }
  //   process.exit(1);
  // }
  // process.exit(result.status);
  // break;
  // }
  default:
    console.log('Unknown script "' + script + '".');
    console.log("Perhaps you need to update react-scripts?");
    console.log(
      "See: https://github.com/facebook/create-react-app/blob/master/packages/react-scripts/template/README.md#updating-to-new-releases"
    );
    break;
}

// const inquirer = require("inquirer");
// const chalk = require("chalk");
// const fs = require("fs-extra");
// const path = require("path");
// const { spawn } = require("child_process");
// const commander = require("commander");

// console.log(process.cwd());

// commander
//   .arguments("<dirname>")
//   .action(function(dirname) {
//     console.log(dirname, 'js!');
// if (
//   process.argv.slice(2).includes("--help") ||
//   process.argv.slice(2).includes("-h")
// ) {
//   console.log(`
//   ${chalk.bold("meact")}
//   A simple scaffolding for generating react-based apps
//   please type 'meact' + return
//   and follow the prompt...
//   `);
//   process.exit(0);
// }
// inquirer
//   .prompt([
//     {
//       type: "input",
//       name: "Name",
//       message: "Please input directory's name:"
//     },
//     {
//       type: "list",
//       name: "Type",
//       message: "What kind of template you want to be using?",
//       choices: [
//         "react-spa",
//         {
//           name: "react-mpa",
//           disabled: "Under development..."
//         },
//         {
//           name: "react-ssr",
//           disabled: "Under development..."
//         }
//       ]
//     }
//   ])
//   .then(answers => {
//     const cwd = process.cwd();
//     // console.log(process.argv);
//     console.log(cwd);

//     // fs.mkdirSync(path.resolve(cwd, answers.Name));
//     // fs.copy(
//     //   path.resolve(__dirname, `../templates/${answers.Type}/`),
//     //   path.resolve(cwd, `./${answers.Name}`),
//     //   {
//     //     recursive: true
//     //   }
//     // )
//     //   .then(res => {
//     //     const installProcess = spawn(`cd ./${answers.Name} && yarn`, {
//     //       stdio: "inherit"
//     //     });
//     //     // installProcess.spawn("yarn");
//     //     // installProcess.stdout.pipe(process.stdout);
//     //     installProcess.on("close", code => {
//     //       // console.log(`child process exited with code ${code}`);
//     //       console.log(
//     //         `\ntype 'cd ${answers.Name} && npm run dev' to start development!`
//     //       );
//     //     });
//     //     // exec(`cd ${answers.Name} && yarn`, (err, stdout, stderr) => {
//     //     // });
//     //   })
//     //   .catch(e => {
//     //     console.log(chalk.red(e.toString()));
//     //     process.exit(1);
//     //   });
//   });
// // })
// // .help(str => {
// //   console.log("\nSimple scaffolding for generating react-based apps\n");
// //   return str;
// // })
// // .parse(process.argv);

// console.log(process.cwd())

// commander
//   .arguments("<dirname>")
//   .action(function(dirname) {
//     console.log(dirname, 'js!');
// if (
//   process.argv.slice(2).includes("--help") ||
//   process.argv.slice(2).includes("-h")
// ) {
//   console.log(`
//   ${chalk.bold("meact")}
//   A simple scaffolding for generating react-based apps
//   please type 'meact' + return
//   and follow the prompt...
//   `);
//   process.exit(0);
// }
// inquirer
//   .prompt([
//     {
//       type: "input",
//       name: "Name",
//       message: "Please input directory's name:"
//     },
//     {
//       type: "list",
//       name: "Type",
//       message: "What kind of template you want to be using?",
//       choices: [
//         "react-spa",
//         {
//           name: "react-mpa",
//           disabled: "Under development..."
//         },
//         {
//           name: "react-ssr",
//           disabled: "Under development..."
//         }
//       ]
//     }
//   ])
//   .then(answers => {
//     const cwd = process.cwd();
//     // console.log(process.argv);
//     console.log(cwd);

//     // fs.mkdirSync(path.resolve(cwd, answers.Name));
//     // fs.copy(
//     //   path.resolve(__dirname, `../templates/${answers.Type}/`),
//     //   path.resolve(cwd, `./${answers.Name}`),
//     //   {
//     //     recursive: true
//     //   }
//     // )
//     //   .then(res => {
//     //     const installProcess = spawn(`cd ./${answers.Name} && yarn`, {
//     //       stdio: "inherit"
//     //     });
//     //     // installProcess.spawn("yarn");
//     //     // installProcess.stdout.pipe(process.stdout);
//     //     installProcess.on("close", code => {
//     //       // console.log(`child process exited with code ${code}`);
//     //       console.log(
//     //         `\ntype 'cd ${answers.Name} && npm run dev' to start development!`
//     //       );
//     //     });
//     //     // exec(`cd ${answers.Name} && yarn`, (err, stdout, stderr) => {
//     //     // });
//     //   })
//     //   .catch(e => {
//     //     console.log(chalk.red(e.toString()));
//     //     process.exit(1);
//     //   });
//   });
// // })
// // .help(str => {
// //   console.log("\nSimple scaffolding for generating react-based apps\n");
// //   return str;
// // })
// // .parse(process.argv);
