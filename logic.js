// logic.js - 核心逻辑层

// 辅助函数：从HTML字符串中提取数据（为了兼容你现有的localStorage存储格式）
function parseRecord(htmlStr) {
    // 简单的正则提取，模拟浏览器解析 DOM
    const tds = htmlStr.match(/<td>(.*?)<\/td>/g);
    if (!tds) return null;
    return {
        id: tds[0].replace(/<\/?td>/g, ''),
        name: tds[1].replace(/<\/?td>/g, ''),
        money: parseFloat(tds[2].replace(/<\/?td>/g, '')),
        type: tds[3].replace(/<\/?td>/g, ''),
        details: tds[4].replace(/<\/?td>/g, ''),
        time: tds[5].replace(/<\/?td>/g, '')
    };
}

// 修复缺陷1：简单的 XSS 过滤
function sanitize(str) {
    if (typeof str !== 'string') return str;
    return str.replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

// 修复缺陷2：浮点数运算精度问题
function safeAdd(num1, num2) {
    return (Math.round(num1 * 100) + Math.round(num2 * 100)) / 100;
}

// 核心功能 1：计算收支统计 (用于单元测试)
function calculateStats(recordsHtmlArray) {
    let myin = 0;
    let myout = 0;

    recordsHtmlArray.forEach(html => {
        const data = parseRecord(html);
        if (data) {
            if (data.type === '收入') {
                myin = safeAdd(myin, data.money);
            } else {
                myout = safeAdd(myout, data.money);
            }
        }
    });

    return {
        totalIn: myin.toFixed(2),
        totalOut: myout.toFixed(2),
        count: recordsHtmlArray.length
    };
}

// 核心功能 2：搜索/过滤逻辑 (用于单元测试)
function filterRecords(recordsHtmlArray, criteria) {
    const { index, value } = criteria;

    return recordsHtmlArray.filter(html => {
        const data = parseRecord(html);
        if (!data) return false;

        // 对应原代码的 index 映射: 0:id, 1:name, 2:money, 3:type, 4:details, 5:time
        const fields = [data.id, data.name, data.money, data.type, data.details, data.time];

        const targetVal = fields[index];

        // 精确匹配 (ID 和 金额)
        if (index === 0 || index === 2) {
            return targetVal == value;
        }
        // 模糊匹配
        else {
            return String(targetVal).includes(value);
        }
    });
}

// 导出供测试使用 (CommonJS 兼容性处理)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { calculateStats, filterRecords, sanitize, safeAdd, parseRecord };
}