function mapRowToTrace(row) {
    return {
        id: row.id,
        requestId: row.request_id,
        sessionId: row.session_id,
        provider: row.provider,
        requestedModel: row.requested_model,
        routedModel: row.routed_model,
        statusCode: row.status_code,
        inputTokens: row.input_tokens,
        outputTokens: row.output_tokens,
        costUsd: row.cost_usd,
        durationMs: row.duration_ms,
        ttftMs: row.ttft_ms,
        stream: row.stream === 1,
        errorMessage: row.error_message,
        timestamp: row.timestamp,
        createdAt: row.created_at,
    };
}
export class TraceRepository {
    writer;
    reader;
    insertStmt;
    constructor(connections) {
        this.writer = connections.writer;
        this.reader = connections.reader;
        this.insertStmt = this.writer.prepare(`
      INSERT INTO local_traces (
        id, request_id, session_id, provider, requested_model, routed_model,
        status_code, input_tokens, output_tokens, cost_usd, duration_ms,
        ttft_ms, stream, error_message, timestamp, created_at
      ) VALUES (
        ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?
      )
    `);
    }
    getConnections() {
        return { writer: this.writer, reader: this.reader, close: () => { } };
    }
    /**
     * Commits a trace to SQLite with WAL concurrency.
     */
    insert(trace) {
        this.insertStmt.run(trace.id, trace.requestId, trace.sessionId, trace.provider, trace.requestedModel, trace.routedModel, trace.statusCode, trace.inputTokens, trace.outputTokens, trace.costUsd, trace.durationMs, trace.ttftMs ?? null, trace.stream ? 1 : 0, trace.errorMessage ?? null, trace.timestamp, trace.createdAt);
    }
    /**
     * Retrieves recent traces ordered by timestamp DESC for sub-millisecond UI hydration.
     */
    getRecent(limit = 50, offset = 0, sessionId) {
        let rows;
        if (sessionId) {
            const stmt = this.reader.prepare(`
        SELECT * FROM local_traces
        WHERE session_id = ?
        ORDER BY timestamp DESC
        LIMIT ? OFFSET ?
      `);
            rows = stmt.all(sessionId, limit, offset);
        }
        else {
            const stmt = this.reader.prepare(`
        SELECT * FROM local_traces
        ORDER BY timestamp DESC
        LIMIT ? OFFSET ?
      `);
            rows = stmt.all(limit, offset);
        }
        return rows.map(mapRowToTrace);
    }
    /**
     * High-performance cursor-based pagination and multi-dimensional filtering.
     * Zero duplication/missed items during high-insert agent activity.
     */
    queryTraces(opts = {}) {
        const limit = Math.min(Math.max(opts.limit || 50, 1), 200);
        const whereClauses = [];
        const params = [];
        if (opts.cursor !== undefined && opts.cursor > 0) {
            whereClauses.push('timestamp < ?');
            params.push(opts.cursor);
        }
        if (opts.sessionId) {
            whereClauses.push('session_id = ?');
            params.push(opts.sessionId);
        }
        if (opts.provider) {
            whereClauses.push('provider = ?');
            params.push(opts.provider);
        }
        if (opts.model) {
            whereClauses.push('(requested_model = ? OR routed_model = ?)');
            params.push(opts.model, opts.model);
        }
        if (opts.status === 'error') {
            whereClauses.push('(status_code >= 400 OR error_message IS NOT NULL)');
        }
        else if (opts.status === 'success') {
            whereClauses.push('(status_code >= 200 AND status_code < 400 AND error_message IS NULL)');
        }
        if (opts.search) {
            whereClauses.push('(requested_model LIKE ? OR routed_model LIKE ? OR error_message LIKE ?)');
            const pattern = `%${opts.search}%`;
            params.push(pattern, pattern, pattern);
        }
        const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';
        // Query limit + 1 to detect hasMore without a second COUNT(*) query
        const sql = `
      SELECT * FROM local_traces
      ${whereSql}
      ORDER BY timestamp DESC, id DESC
      LIMIT ?
    `;
        params.push(limit + 1);
        const stmt = this.reader.prepare(sql);
        const rows = stmt.all(...params);
        const hasMore = rows.length > limit;
        if (hasMore) {
            rows.pop(); // Remove the extra peek row
        }
        const traces = rows.map(mapRowToTrace);
        const nextCursor = hasMore && traces.length > 0 ? traces[traces.length - 1].timestamp : null;
        return {
            traces,
            nextCursor,
            hasMore,
        };
    }
    /**
     * Aggregates session metrics for the Odometer and financial budget gauges.
     */
    getSessionSummary(sessionId) {
        let row;
        if (sessionId) {
            const stmt = this.reader.prepare(`
        SELECT
          COUNT(*) as total_requests,
          COALESCE(SUM(input_tokens), 0) as total_input_tokens,
          COALESCE(SUM(output_tokens), 0) as total_output_tokens,
          COALESCE(SUM(cost_usd), 0.0) as total_cost_usd,
          COALESCE(SUM(CASE WHEN status_code >= 400 THEN 1 ELSE 0 END), 0) as error_count,
          COALESCE(AVG(duration_ms), 0.0) as avg_duration_ms
        FROM local_traces
        WHERE session_id = ?
      `);
            row = stmt.get(sessionId);
        }
        else {
            const stmt = this.reader.prepare(`
        SELECT
          COUNT(*) as total_requests,
          COALESCE(SUM(input_tokens), 0) as total_input_tokens,
          COALESCE(SUM(output_tokens), 0) as total_output_tokens,
          COALESCE(SUM(cost_usd), 0.0) as total_cost_usd,
          COALESCE(SUM(CASE WHEN status_code >= 400 THEN 1 ELSE 0 END), 0) as error_count,
          COALESCE(AVG(duration_ms), 0.0) as avg_duration_ms
        FROM local_traces
      `);
            row = stmt.get();
        }
        if (!row) {
            return {
                totalRequests: 0,
                totalInputTokens: 0,
                totalOutputTokens: 0,
                totalCostUsd: 0,
                errorCount: 0,
                avgDurationMs: 0,
            };
        }
        return {
            totalRequests: Number(row.total_requests),
            totalInputTokens: Number(row.total_input_tokens),
            totalOutputTokens: Number(row.total_output_tokens),
            totalCostUsd: Number(Number(row.total_cost_usd).toFixed(6)),
            errorCount: Number(row.error_count),
            avgDurationMs: Math.round(Number(row.avg_duration_ms)),
        };
    }
    getTraceById(id) {
        const stmt = this.reader.prepare(`
      SELECT * FROM local_traces WHERE id = ? LIMIT 1
    `);
        const row = stmt.get(id);
        return row ? mapRowToTrace(row) : null;
    }
}
