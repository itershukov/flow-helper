import { exec }  from 'child_process';
import * as readline  from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.on('close', function () {
  console.log('\nBYE BYE !!!');
  process.exit(0);
});

function execCommand(command){
  return new Promise<string>((res, rej) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        rej(error)
        return;
      }
      if(stderr) {
        rej(error)
        return;
      }
      if(stdout) {
        res(stdout)
        return;
      }
      res();
    });
  })
}

async function ask(question: string, defaultValue?: string) {
  return new Promise<string>((res, rej) => {
    try {
      rl.question(question, function(answer) {
        res(answer);
      });
      if (defaultValue){
        rl.write(defaultValue);
      }
    } catch (e){
      rej(e)
    }
  })
}

const workTypes: string[] = ['FEATURE', 'FIX', 'REFACTOR'];
const workStates: string[] = ['In progress', 'Peer review'];

(async ()=>{
  const currentBranch = await execCommand('git rev-parse --abbrev-ref HEAD')
  const prevComment = await execCommand('git log -1 | grep -o "[A-Z]: [A-Za-z ]*[^ #]" | cut -c 4-')
  let targetBranch = 'dev'
  let stateIndex = '1'

  const comment = await ask('Comment: ', prevComment);
  const spent = await ask('Spent time (30m|h): ', '');
  const typeIndex = await ask('Work type (0 - FIX, 1 - FEATURE, 2 - REFACTOR): ', '1');
  const type = workTypes[typeIndex] || workTypes[0]
  stateIndex = await ask('State (0 - In progress, 1 - Peer review): ', stateIndex);
  const state = workStates[stateIndex] || workStates[1];
  const branch = await ask('Current branch: ', currentBranch.slice(0, -1));
  targetBranch = await ask('Target branch: ', targetBranch);
  const mrTitle = await ask('MR title (fill if need create a new request or update an exist): ', '');

  if (targetBranch != currentBranch && branch != currentBranch){
    await execCommand('git pull')
    await execCommand(`git checkout ${targetBranch}`)
  }

  if (currentBranch != branch){
    await execCommand(`git checkout -b ${branch} || git checkout ${branch}`)
  }

  if (currentBranch != branch){
    await execCommand(`git checkout -b ${branch} || git checkout ${branch}`)
  }

  await execCommand(`git commit -a -m"${type}: ${comment} #${branch} State ${state} work Development ${spent}"`)

  if (mrTitle){
    await execCommand(`git push --set-upstream origin ${branch}`)
  } else {
    await execCommand(`git push -o merge_request.create -o merge_request.title="#${branch}: ${mrTitle}" -o merge_request.target=${targetBranch} --set-upstream origin ${branch}`)
  }

// # Auto sync with target branch
// #if [[${TARGET_BRANCH} != ${BRANCH}]]
// #then
// #    git pull origin ${TARGET_BRANCH}
// #    git push
// #fi
  rl.close();
})()


////////////////////////////////////
// OLD VERSION//////////////////////
// #!/bin/bash
// function readinput() {
//   local CLEAN_ARGS=""
//   while [[ $# -gt 0 ]]; do
//     local i="$1"
// case "$i" in
//   "-i")
//   if read -i "default" 2>/dev/null <<< "test"; then
//   CLEAN_ARGS="$CLEAN_ARGS -i \"$2\""
//   fi
//   shift
//   shift
//   ;;
//   "-p")
//   CLEAN_ARGS="$CLEAN_ARGS -p \"$2\""
//   shift
//   shift
//   ;;
// *)
//   CLEAN_ARGS="$CLEAN_ARGS $1"
//   shift
//   ;;
//   esac
//   done
//   eval read $CLEAN_ARGS
// }
//
// CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
// PREV_COMMENT=$(git log -1 | grep -o "[A-Z]: [A-Za-z ]*[^ #]" | cut -c 4-)
// TARGET_BRANCH="dev"
// STATE="PR"
//
// readinput -e -p "Comment: " -i "${PREV_COMMENT}" COMMENT
// readinput -e -p "Spent time (30m|h): " SPENT
// readinput -e -p "Work type (FEATURE, FIX, REFACTOR): " -i "FEATURE" TYPE
// readinput -e -p "State (IP - In progress, PR - Peer review): " -i "${STATE}" STATE
// readinput -e -p "Branch: " -i ${CURRENT_BRANCH} BRANCH
// readinput -e -p "MR title (fill if need create a new request or update an exist): " MR_TITLE
// readinput -e -p "Target branch: " -i ${TARGET_BRANCH} TARGET_BRANCH
//
// if [[ ${TARGET_BRANCH} != ${CURRENT_BRANCH} ]] && [[ ${BRANCH} != ${CURRENT_BRANCH} ]]
// then
// git pull
// git checkout ${TARGET_BRANCH}
// fi
//
// if [[ ${CURRENT_BRANCH} != ${BRANCH} ]]
// then
// git checkout -b ${BRANCH} || git checkout ${BRANCH}
// fi
//
// if [[ ${STATE} == "IP" ]]
// then
// STATE='In progress'
// else
// STATE='Peer review'
// fi
//
// git commit -a -m"$TYPE: $COMMENT #$BRANCH State ${STATE} work Development $SPENT"
//
// if [[ -z ${MR_TITLE} ]]
//   then
// git push --set-upstream origin ${BRANCH}
// else
// git push -o merge_request.create -o merge_request.title="#$BRANCH: $MR_TITLE" -o merge_request.target=${TARGET_BRANCH} --set-upstream origin ${BRANCH}
// fi
//
// # Auto sync with target branch
// #if [[${TARGET_BRANCH} != ${BRANCH}]]
// #then
// #    git pull origin ${TARGET_BRANCH}
// #    git push
// #fi
