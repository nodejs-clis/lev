/**
 * 文件描述
 * @author ydr.me
 * @create 2018-08-17 17:40
 * @update 2018-08-17 17:40
 */


'use strict';

var console = require('blear.node.console');
var path = require('blear.node.path');
var fse = require('fs-extra');

var constant = require('../settings/constant');

/**
 * 生成配置文件
 * @param args
 * @param args.debug
 * @param args.domain
 * @param method
 */
module.exports = function (args, method) {
    var json = JSON.stringify(args, null, 4) + '\n';
    var file = path.join(
        constant.DOMAINS_DIRNAME,
        args.domain + '.json'
    );

    if (args.debug) {
        console.logWithTime('配置信息');
        console.logWithTime(args);
    }

    console.infoWithTime(file);

    try {
        fse.outputFileSync(file, json);
        console.infoWithTime('配置文件生成成功');
    } catch (err) {
        console.errorWithTime('配置文件生成失败');
        console.errorWithTime(err.message);
        process.exit(1);
    }
};


