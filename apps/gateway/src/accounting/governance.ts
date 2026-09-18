import { virtualKeyCache } from '../middleware/cache';
import type { WebhookAlertPayload } from './types';

export type WebhookDispatcher = (payload: WebhookAlertPayload) => Promise<void>;

interface MilestoneState {
  alerted80: boolean;
  alerted100: boolean;
}

/**
 * Automated Governance & Milestone Webhook Engine.
 * Monitors budget utilization thresholds and dispatches de-duplicated alerts
 * to team communication channels (Slack, Discord, PagerDuty, or HTTP webhooks).
 */
export class GovernanceEngine {
  private milestones = new Map<string, MilestoneState>();
  private dispatcher: WebhookDispatcher;

  constructor(dispatcher?: WebhookDispatcher) {
    this.dispatcher = dispatcher ?? (async () => {});
  }

  private getOrCreateMilestone(keyId: string): MilestoneState {
    let state = this.milestones.get(keyId);
    if (!state) {
      state = { alerted80: false, alerted100: false };
      this.milestones.set(keyId, state);
    }
    return state;
  }

  /**
   * Evaluates key spend against financial governance milestones.
   * Ensures alerts fire strictly ONCE per threshold crossing.
   */
  public async checkMilestones(options: {
    organizationId: string;
    virtualKeyId: string;
    keyHash: string;
    keyPrefix: string;
    currentSpendUsd: number;
    monthlyLimitUsd: number;
  }): Promise<{ alerted80: boolean; alerted100: boolean }> {
    const {
      organizationId,
      virtualKeyId,
      keyHash,
      keyPrefix,
      currentSpendUsd,
      monthlyLimitUsd,
    } = options;

    if (monthlyLimitUsd <= 0) {
      return { alerted80: false, alerted100: false };
    }

    const ratio = currentSpendUsd / monthlyLimitUsd;
    const percentage = Math.min(100, Math.round(ratio * 100));
    const state = this.getOrCreateMilestone(virtualKeyId);

    let didAlert80 = false;
    let didAlert100 = false;

    // 1. Evaluate 80% Warning Milestone
    if (ratio >= 0.8 && !state.alerted80) {
      state.alerted80 = true;
      didAlert80 = true;

      const payload: WebhookAlertPayload = {
        event: 'key_milestone_80',
        organizationId,
        virtualKeyId,
        keyPrefix,
        currentSpendUsd,
        monthlyLimitUsd,
        utilizationPercentage: percentage,
        timestamp: new Date().toISOString(),
      };

      try {
        await this.dispatcher(payload);
      } catch (err) {
        console.error('[GovernanceEngine] Failed to dispatch 80% milestone webhook:', err);
      }
    }

    // 2. Evaluate 100% Budget Freeze Milestone
    if (ratio >= 1.0 && !state.alerted100) {
      state.alerted100 = true;
      didAlert100 = true;

      // Ensure key is purged from hot-path cache immediately
      virtualKeyCache.invalidate(keyHash);

      const payload: WebhookAlertPayload = {
        event: 'key_budget_frozen_100',
        organizationId,
        virtualKeyId,
        keyPrefix,
        currentSpendUsd,
        monthlyLimitUsd,
        utilizationPercentage: 100,
        timestamp: new Date().toISOString(),
      };

      try {
        await this.dispatcher(payload);
      } catch (err) {
        console.error('[GovernanceEngine] Failed to dispatch 100% freeze webhook:', err);
      }
    }

    return { alerted80: didAlert80, alerted100: didAlert100 };
  }

  /**
   * Resets milestone tracking state (e.g. on new billing cycle rollover).
   */
  public resetMilestone(keyId: string): void {
    this.milestones.delete(keyId);
  }

  public setDispatcher(dispatcher: WebhookDispatcher): void {
    this.dispatcher = dispatcher;
  }
}

// Global singleton governance engine
export const governanceEngine = new GovernanceEngine();
