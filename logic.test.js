const { calculateStats, filterRecords, sanitize, safeAdd } = require('./logic');

// 模拟数据
const mockData = [
    '<tr><td>1</td><td>TestUser1</td><td>100.00</td><td>收入</td><td>Desc1</td><td>2025-01-01</td></tr>',
    '<tr><td>2</td><td>TestUser2</td><td>50.50</td><td>支出</td><td>Desc2</td><td>2025-01-02</td></tr>',
    '<tr><td>3</td><td>TestUser1</td><td>20.00</td><td>支出</td><td>Desc3</td><td>2025-01-03</td></tr>'
];

describe('单元测试 (Unit Tests)', () => {

    // 子功能 1: 统计计算 (测试 safeAdd 和 calculateStats)
    test('calculateStats 应正确计算收入和支出', () => {
        const stats = calculateStats(mockData);
        // 收入: 100.00
        expect(stats.totalIn).toBe('100.00');
        // 支出: 50.50 + 20.00 = 70.50
        expect(stats.totalOut).toBe('70.50');
        expect(stats.count).toBe(3);
    });

    test('safeAdd 应修复浮点数精度问题', () => {
        expect(safeAdd(0.1, 0.2)).toBe(0.3);
        expect(0.1 + 0.2).not.toBe(0.3); // 证明原生 JS 存在该问题
    });

    // 子功能 2: 过滤搜索
    test('filterRecords 应能按名称模糊搜索', () => {
        const result = filterRecords(mockData, { index: 1, value: 'User1' });
        expect(result.length).toBe(2);
        expect(result[0]).toContain('TestUser1');
    });

    test('filterRecords 应能按金额精确搜索', () => {
        const result = filterRecords(mockData, { index: 2, value: '50.50' });
        expect(result.length).toBe(1);
        expect(result[0]).toContain('TestUser2');
    });

    // 边界测试
    test('calculateStats 处理空数组应返回 0', () => {
        const stats = calculateStats([]);
        expect(stats.totalIn).toBe('0.00');
    });

    test('sanitize 应防止基础 XSS', () => {
        const input = '<script>alert(1)</script>';
        expect(sanitize(input)).toBe('&lt;script&gt;alert(1)&lt;/script&gt;');
    });
});

describe('集成测试 (Integration Tests)', () => {
    // 模拟场景 1: 先过滤，再计算统计 (例如：用户搜索“TestUser1”后看他的总收支)
    test('搜索后统计功能集成', () => {
        // 1. 过滤
        const filtered = filterRecords(mockData, { index: 1, value: 'TestUser1' });
        // 2. 统计过滤后的结果
        const stats = calculateStats(filtered);

        expect(filtered.length).toBe(2);
        // User1 有一笔 100 收入，一笔 20 支出
        expect(stats.totalIn).toBe('100.00');
        expect(stats.totalOut).toBe('20.00');
    });

    // 模拟场景 2: 数据流测试 (添加 -> 计算)
    test('数据添加与统计流集成', () => {
        // 假设当前数据
        let currentData = [...mockData];
        // 模拟用户添加新数据 (HTML 格式)
        const newRecord = '<tr><td>4</td><td>NewUser</td><td>200.00</td><td>收入</td><td>New</td><td>2025-01-04</td></tr>';
        currentData.push(newRecord);

        // 计算新统计
        const stats = calculateStats(currentData);

        // 原收入 100 + 新收入 200 = 300
        expect(stats.totalIn).toBe('300.00');
        expect(stats.count).toBe(4);
    });
});