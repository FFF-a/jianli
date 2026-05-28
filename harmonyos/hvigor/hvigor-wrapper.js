#!/usr/bin/env node

// hvigor wrapper - 命令行入口，用于 CI 构建
const { hvigor } = require('@ohos/hvigor');
const { hapTasks, ohosHapTasks } = require('@ohos/hvigor-ohos-plugin');

const config = {
  mode: process.env.BUILD_MODE || 'debug',
  projectDir: __dirname + '/../',
  nodeArgs: []
};

async function main() {
  const args = process.argv.slice(2);
  const taskName = args[0] || 'assembleHap';

  console.log(`[hvigor] Building with task: ${taskName}, mode: ${config.mode}`);

  try {
    await hvigor.run({
      mode: config.mode,
      rootDir: config.projectDir,
      tasks: [taskName]
    });
    console.log('[hvigor] Build succeeded');
  } catch (e) {
    console.error('[hvigor] Build failed:', e);
    process.exit(1);
  }
}

main();
