import { execSync } from 'node:child_process';
import { chmodSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const projectRoot = path.resolve(import.meta.dirname, '..');
const hookFiles = ['pre-commit', 'commit-msg'];

for (const file of hookFiles) {
  const target = path.join(projectRoot, '.husky', file);
  if (existsSync(target)) chmodSync(target, 0o755);
}

/**
 * 本项目可能位于 monorepo 子目录，husky 默认的 `.git` 在上层，
 * 因此通过 git 定位真实的 hooks 目录，并在其中写入转发脚本。
 */
function resolveHooksDir() {
  try {
    const output = execSync('git rev-parse --git-path hooks', {
      cwd: projectRoot,
      stdio: ['ignore', 'pipe', 'ignore'],
    })
      .toString()
      .trim();
    if (!output) return undefined;
    return path.resolve(projectRoot, output);
  } catch {
    return undefined;
  }
}

const hooksDir = resolveHooksDir();

if (hooksDir) {
  try {
    mkdirSync(hooksDir, { recursive: true });
    for (const file of hookFiles) {
      const wrapper = path.join(hooksDir, file);
      writeFileSync(
        wrapper,
        `#!/usr/bin/env sh\ncd "${projectRoot}" || exit 1\n./.husky/${file} "$@"\n`,
      );
      chmodSync(wrapper, 0o755);
    }
    execSync(`git config core.hooksPath "${hooksDir}"`, {
      cwd: projectRoot,
      stdio: ['ignore', 'ignore', 'ignore'],
    });
    console.log(`[prepare-hooks] git hooks 已指向 ${hooksDir}`);
  } catch (error) {
    console.warn('[prepare-hooks] 写入 git hooks 失败：', error);
  }
} else {
  console.log('[prepare-hooks] 未检测到 git 仓库，跳过 hooks 注册');
}
