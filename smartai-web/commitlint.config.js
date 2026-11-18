import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

/** 可选 scope：smartai-web/src 下的一级目录（小写） */
const scopes = fs
  .readdirSync(path.resolve(path.dirname(fileURLToPath(import.meta.url)), 'src'))
  .map((item) => item.toLowerCase());

/** 从已暂存的变更路径推断默认 scope，减少手动输入 */
const gitStatus = execSync('git status --porcelain || true').toString().trim().split('\n');

const scopeComplete = gitStatus
  .find((r) => ~r.indexOf('M  src'))
  ?.replace(/(\/)/g, '%%')
  ?.match(/src%%((\w|-)*)/)?.[1];

const subjectComplete = gitStatus
  .find((r) => ~r.indexOf('M  src'))
  ?.replace(/\//g, '%%')
  ?.match(/src%%((\w|-)*)/)?.[1];

const Configuration = {
  extends: ['@commitlint/config-conventional'],
  prompt: {
    // 范围设置
    scopes: [...scopes, 'root'],
    // 范围是否可以多选
    enableMultipleScopes: true,
    // 多选范围后用标识符隔开
    scopeEnumSeparator: ',',
    // 设置「选择范围」中空选项和自定义选项的位置
    customScopesAlign: !scopeComplete ? 'top' : 'bottom',
    // defaultScope 与选择范围列表项中的 value 匹配时星标置顶
    defaultScope: scopeComplete,
    // 描述预设值
    defaultSubject: subjectComplete && `[${subjectComplete}] `,
  },
};

export default Configuration;
