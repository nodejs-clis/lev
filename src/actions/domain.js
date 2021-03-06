/**
 * 文件描述
 * @author ydr.me
 * @create 2018-08-17 17:40
 * @update 2018-08-17 17:40
 */


'use strict';

var console = require('blear.node.console');
var path = require('blear.node.path');
var object = require('blear.utils.object');
var typeis = require('blear.utils.typeis');
var string = require('blear.utils.string');

var constant = require('../settings/constant');
var defaults = require('../settings/example.com.json');
var domainConfigs = require('../utils/domain-configs');
var getDomains = require('../utils/get-domains');
var shell = require('../utils/shell');

var domainRE = /^.+(\..{2,})+$/;

/**
 * 生成配置文件
 * @param args
 * @param args.debug
 * @param args.reference
 * @param args.force
 * @param args.delete
 * @param args.smtp
 * @param params
 */
module.exports = function (args, params) {
    var domain = domainCheck(args, params[0]);

    if (!domain) {
        listDomain();
        return;
    }

    if (args.delete) {
        try {
            domainConfigs.remove(domain);
            console.warnWithTime('域名配置文件删除成功');
        } catch (err) {
            // ignore
            console.errorWithTime('域名配置文件删除失败');
            console.errorWithTime(err.message);
        }
        return;
    }

    var file = domainConfigs.file(domain);
    var editMode = path.isExist(file);
    var reference = null;
    var force = args.force;

    console.logWithTime(file);

    // 参考配置
    if (args.reference) {
        if (editMode && !force) {
            console.errorWithTime('当前域名配置文件已存在');
            console.errorWithTime('如需覆盖请添加 `--force, -f` 参数');
            return;
        }

        console.logWithTime('参考域名', args.reference);

        if (!domainRE.test(args.reference)) {
            console.errorWithTime('参考域名似乎不是一个合法的域名');
            return;
        }

        try {
            reference = domainConfigs.get(args.reference);
        } catch (err) {
            console.errorWithTime('参考域名的配置文件获取失败');
            console.errorWithTime(err.message);
            return;
        }
    }

    // 编辑模式 && 无覆盖
    if (editMode && !force) {
        vim(file);
        return;
    }

    generate(args, domain, reference);
};


/**
 * 域名检查
 * @param args
 * @param domain
 */
function domainCheck(args, domain) {
    domain = domain || args.delete;

    if (!domain) {
        return;
    }

    console.logWithTime('当前域名', domain);

    if (!domainRE.test(domain)) {
        console.errorWithTime('当前域名似乎不是一个合法的域名');
        process.exit(1);
    }

    return domain.toLowerCase();
}


/**
 * 来自
 * @param to
 * @param from
 * @param list
 */
function from(to, from, list) {
    list.forEach(function (key) {
        to[key] = from[key];
    });
}

/**
 * vim 打开编辑
 * @param file
 */
function vim(file) {
    console.infoWithTime('即将进入编辑模式');

    setTimeout(function () {
        try {
            shell('vim ' + file, {
                stdio: 'inherit'
            });
        } catch (err) {
            console.errorWithTime('进入编辑模式失败，请手动编辑');
            console.errorWithTime(err.message);
        }
    }, 1000);
}


/**
 * 列出域名
 */
function listDomain() {
    var list = getDomains();
    var length = list.length;
    var size = Math.max(length.toString().length, 2);
    var table = [
        ['#', 'domain']
    ];

    list.forEach(function (domain, index) {
        var key = string.padStart(index + 1, size, '0');
        table.push([
            key,
            domain
        ]);
    });
    console.logWithTime('当前已配置的域名');
    console.table(table, {
        thead: true
    });
}


/**
 * 生成配置文件
 * @param args
 * @param domain
 * @param reference
 */
function generate(args, domain, reference) {
    var configs = object.assign(true, {}, defaults, args, {
        base: {
            domain: domain
        }
    });

    configs.base.certificateKeyFileName = string.assign(configs.base.certificateKeyFileName, {
        domain: domain
    });
    configs.base.certificateCertFileName = string.assign(configs.base.certificateCertFileName, {
        domain: domain
    });

    if (reference) {
        from(configs.base, reference.base, [
            'emailAddress',
            'dnsServerName',
            'dnsServerAccessKey',
            'dnsServerAccessSecret',
            'saveDirname',
            'afterSaveCommand'
        ]);
        from(configs.smtp, reference.smtp, [
            'from',
            'to',
            'subject',
            'host',
            'port',
            'secure',
            'user',
            'pass'
        ]);
    }

    try {
        domainConfigs.set(domain, configs);
    } catch (err) {
        console.errorWithTime('配置文件生成失败');
        console.errorWithTime(err.message);
        return;
    }

    vim(domainConfigs.file(domain));
}
