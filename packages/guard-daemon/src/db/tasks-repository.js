function mapRowToTask(row) {
    return {
        id: row.id,
        title: row.title,
        description: row.description,
        targetDate: row.target_date,
        targetTime: row.target_time,
        tokenBudgetUsd: row.token_budget_usd,
        priority: row.priority || 'medium',
        status: row.status || 'todo',
        createdAt: row.created_at,
        updatedAt: row.updated_at,
    };
}
export class TaskRepository {
    writer;
    reader;
    insertStmt;
    updateStmt;
    deleteStmt;
    getByIdStmt;
    constructor(connections) {
        this.writer = connections.writer;
        this.reader = connections.reader;
        this.insertStmt = this.writer.prepare(`
      INSERT INTO local_tasks (
        id, title, description, target_date, target_time,
        token_budget_usd, priority, status, created_at, updated_at
      ) VALUES (
        ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?
      )
    `);
        this.updateStmt = this.writer.prepare(`
      UPDATE local_tasks
      SET title = ?, description = ?, target_date = ?, target_time = ?,
          token_budget_usd = ?, priority = ?, status = ?, updated_at = ?
      WHERE id = ?
    `);
        this.deleteStmt = this.writer.prepare(`
      DELETE FROM local_tasks WHERE id = ?
    `);
        this.getByIdStmt = this.reader.prepare(`
      SELECT * FROM local_tasks WHERE id = ?
    `);
    }
    /**
     * Creates a new local task in SQLite.
     */
    createTask(task) {
        this.insertStmt.run(task.id, task.title, task.description || null, task.targetDate, task.targetTime || null, task.tokenBudgetUsd ?? 0, task.priority || 'medium', task.status || 'todo', task.createdAt || Date.now(), task.updatedAt || Date.now());
        return task;
    }
    /**
     * Retrieves a task by its ID.
     */
    getTaskById(id) {
        const row = this.getByIdStmt.get(id);
        if (!row)
            return null;
        return mapRowToTask(row);
    }
    /**
     * Updates an existing task by ID.
     */
    updateTask(id, updates) {
        const existing = this.getTaskById(id);
        if (!existing)
            return null;
        const updated = {
            ...existing,
            ...updates,
            updatedAt: Date.now(),
        };
        this.updateStmt.run(updated.title, updated.description || null, updated.targetDate, updated.targetTime || null, updated.tokenBudgetUsd ?? 0, updated.priority, updated.status, updated.updatedAt, id);
        return updated;
    }
    /**
     * Deletes a task by ID.
     */
    deleteTask(id) {
        const existing = this.getTaskById(id);
        if (!existing)
            return false;
        this.deleteStmt.run(id);
        return true;
    }
    /**
     * Lists tasks filtered by month (YYYY-MM), specific date (YYYY-MM-DD), status, or priority.
     */
    listTasks(options = {}) {
        const conditions = [];
        const params = [];
        if (options.month) {
            conditions.push('target_date LIKE ?');
            params.push(`${options.month}%`);
        }
        else if (options.date) {
            conditions.push('target_date = ?');
            params.push(options.date);
        }
        if (options.status) {
            conditions.push('status = ?');
            params.push(options.status);
        }
        if (options.priority) {
            conditions.push('priority = ?');
            params.push(options.priority);
        }
        const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
        const sql = `SELECT * FROM local_tasks ${whereClause} ORDER BY target_date ASC, target_time ASC, created_at ASC`;
        const stmt = this.reader.prepare(sql);
        const rows = (params.length > 0 ? stmt.all(...params) : stmt.all());
        return rows.map(mapRowToTask);
    }
}
