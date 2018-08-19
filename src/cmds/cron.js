/**
 * cron
 * @author ydr.me
 * @create 2018-08-16 08:32
 * @update 2018-08-16 08:32
 */


'use strict';

var cli = require('/Users/cloudcome/development/github-blearjs/blear.node.cli');

cli
    .command('cron', '定时任务相关')
    .helper()

    .method('start', '每月 1 日凌晨 3 点启动定时任务')
    .method('status', '查看定时任务状态')
    .method('stop', '停止定时任务')
    .method('work', '查看定时任务工作记录')
    .usage('elev work <ind' + '' + 'ex>', '查看指定索引的工作记录')

    .action(require('../actions/cron'))
    .action('start', require('../actions/cron-start'))
    .action('status', require('../actions/cron-status'))
    .action('stop', require('../actions/cron-stop'))
    .action('work', require('../actions/cron-work'));

