const path = require('path');
const shell = require('shelljs');

const mashupsPathVariable = 'TARGETPROCESS_MASHUPS_PATH';
const mashupsPath = shell.env[mashupsPathVariable];
if (!mashupsPath) {
    throw new Error(`Please define ${mashupsPathVariable} env variable`);
}
const buildPath = path.join(mashupsPath, shell.env.npm_package_name);

shell.rm('-rf', buildPath);
shell.exec(`NODE_ENV=development webpack --config webpack/development.config.js --watch --output-path ${buildPath}`);
