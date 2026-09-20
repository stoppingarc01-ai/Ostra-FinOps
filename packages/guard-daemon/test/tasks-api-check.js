import assert from 'node:assert';
import { initializeDatabase } from '../src/db/connection.js';
import { TraceRepository } from '../src/db/repository.js';
import { TaskRepository } from '../src/db/tasks-repository.js';
import { createDaemonServer } from '../src/server/http-server.js';
import { loadConfig } from '../src/config.js';
async function runTaskTests() {
    console.log('--- Testing Local Tasks Repository & API Endpoints ---');
    // 1. Direct Repository Unit Checks
    const db = initializeDatabase(':memory:');
    const traceRepo = new TraceRepository(db);
    const taskRepo = new TaskRepository(db);
    const testTask = taskRepo.createTask({
        id: 'task_test_1',
        title: 'Refactor auth middleware with Cursor',
        description: 'Use Claude 3.7 Sonnet for reasoning',
        targetDate: '2026-09-15',
        targetTime: '14:30',
        tokenBudgetUsd: 1.5,
        priority: 'high',
        status: 'todo',
        createdAt: Date.now(),
        updatedAt: Date.now(),
    });
    assert.strictEqual(testTask.id, 'task_test_1');
    assert.strictEqual(testTask.status, 'todo');
    console.log('✔ TaskRepository.createTask passed.');
    // List by month
    const monthTasks = taskRepo.listTasks({ month: '2026-09' });
    assert.strictEqual(monthTasks.length, 1);
    assert.strictEqual(monthTasks[0].id, 'task_test_1');
    console.log('✔ TaskRepository.listTasks (month filter) passed.');
    // Update status to in_progress
    const updated = taskRepo.updateTask('task_test_1', { status: 'in_progress', tokenBudgetUsd: 2.0 });
    assert.ok(updated);
    assert.strictEqual(updated?.status, 'in_progress');
    assert.strictEqual(updated?.tokenBudgetUsd, 2.0);
    console.log('✔ TaskRepository.updateTask passed.');
    // 2. HTTP Server API Integration Check
    const config = loadConfig();
    const daemon = createDaemonServer({
        config,
        repository: traceRepo,
        tasksRepository: taskRepo,
        token: 'test_token_12345',
    });
    const { port } = await daemon.listen(0, '127.0.0.1');
    const baseUrl = `http://127.0.0.1:${port}`;
    const headers = {
        'Content-Type': 'application/json',
        'X-OstraOps-Daemon-Token': 'test_token_12345',
    };
    // GET /api/tasks?month=2026-09
    const resGet = await fetch(`${baseUrl}/api/tasks?month=2026-09`, { headers });
    assert.strictEqual(resGet.status, 200);
    const jsonGet = await resGet.json();
    assert.strictEqual(jsonGet.count, 1);
    assert.strictEqual(jsonGet.tasks[0].id, 'task_test_1');
    console.log('✔ GET /api/tasks?month=2026-09 returned 200 with task list.');
    // POST /api/tasks
    const resPost = await fetch(`${baseUrl}/api/tasks`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
            title: 'Analyze Token Burn Rates',
            targetDate: '2026-09-16',
            priority: 'medium',
            tokenBudgetUsd: 0.75,
        }),
    });
    assert.strictEqual(resPost.status, 201);
    const jsonPost = await resPost.json();
    assert.ok(jsonPost.task?.id);
    assert.strictEqual(jsonPost.task?.title, 'Analyze Token Burn Rates');
    console.log('✔ POST /api/tasks created new task.');
    const createdId = jsonPost.task.id;
    // PATCH /api/tasks/:id
    const resPatch = await fetch(`${baseUrl}/api/tasks/${createdId}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ status: 'completed' }),
    });
    assert.strictEqual(resPatch.status, 200);
    const jsonPatch = await resPatch.json();
    assert.strictEqual(jsonPatch.task.status, 'completed');
    console.log('✔ PATCH /api/tasks/:id updated task status to completed.');
    // DELETE /api/tasks/:id
    const resDelete = await fetch(`${baseUrl}/api/tasks/${createdId}`, {
        method: 'DELETE',
        headers,
    });
    assert.strictEqual(resDelete.status, 200);
    console.log('✔ DELETE /api/tasks/:id deleted task.');
    await daemon.close();
    db.close();
    console.log('\n=============================================');
    console.log('ALL TASKS REPOSITORY & API CHECKS PASSED! 🚀');
    console.log('=============================================\n');
}
runTaskTests().catch((err) => {
    console.error('Task tests failed:', err);
    process.exit(1);
});
