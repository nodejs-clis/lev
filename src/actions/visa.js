/**
 * 签证
 * @author ydr.me
 * @create 2018-08-17 17:23
 * @update 2018-08-17 17:23
 */


'use strict';

var plan = require('blear.utils.plan');
var console = require('blear.node.console');

var issue = require('../libs/issue');
var save = require('../libs/save');
var exec = require('../libs/exec');


/**
 * 签证
 * @param args
 * @param args.config
 * @param args.debug
 * @param method
 */
module.exports = function (args, method) {
    args = require(args.config);

    if (args.debug) {
        console.logWithTime('配置信息');
        console.logWithTime(args);
    }

    plan
        .task(function (next) {
            issue(args, next);
        })
        .taskSync(function (com) {
            save(args, com[0], com[1]);
        })
        .taskSync(function () {
            exec(args);
        })
        .serial();
};



