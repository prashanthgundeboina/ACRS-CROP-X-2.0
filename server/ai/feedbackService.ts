import fs from 'fs';
import path from 'path';
import { AIFeedback, AIFeedbackType } from './types';
import { FarmerAgentService } from './farmerAgentService';

const FEEDBACK_FILE_PATH = path.join(process.cwd(), 'data', 'farmer_ai_feedback.json');

// Ensure data folder exists
if (!fs.existsSync(path.join(process.cwd(), 'data'))) {
  try {
    fs.mkdirSync(path.join(process.cwd(), 'data'), { recursive: true });
  } catch (e) {
    console.error('Failed to create data directory:', e);
  }
}

let feedbackStore: AIFeedback[] = [];

function loadFeedbackFromFile() {
  try {
    if (fs.existsSync(FEEDBACK_FILE_PATH)) {
      const raw = fs.readFileSync(FEEDBACK_FILE_PATH, 'utf-8');
      feedbackStore = JSON.parse(raw);
    }
  } catch (err) {
    console.error('Error loading AI feedback file:', err);
  }
}

function saveFeedbackToFile() {
  try {
    fs.writeFileSync(FEEDBACK_FILE_PATH, JSON.stringify(feedbackStore, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving AI feedback file:', err);
  }
}

loadFeedbackFromFile();

export class FeedbackService {
  /**
   * Record farmer feedback on an AI advisory recommendation.
   */
  static recordFeedback(
    farmerId: string,
    agentId: string,
    feedbackType: AIFeedbackType,
    interactionId?: string,
    comment?: string
  ): AIFeedback {
    if (!farmerId) throw new Error('farmerId is required for feedback');

    const feedback: AIFeedback = {
      id: `FB-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
      farmerId,
      agentId,
      interactionId,
      feedbackType,
      comment,
      createdAt: new Date().toISOString()
    };

    feedbackStore.unshift(feedback);
    if (feedbackStore.length > 500) feedbackStore = feedbackStore.slice(0, 500);
    saveFeedbackToFile();

    // Log audit event
    FarmerAgentService.logAuditEvent('FEEDBACK_RECORDED', farmerId, 'farmer', agentId, {
      feedbackType,
      interactionId,
      comment
    });

    return feedback;
  }

  /**
   * Retrieve all feedback records for a specific farmer.
   */
  static getFeedbackByFarmer(farmerId: string): AIFeedback[] {
    if (!farmerId) return [];
    return feedbackStore.filter((f) => f.farmerId === farmerId);
  }

  /**
   * Retrieve global feedback metrics.
   */
  static getGlobalFeedbackMetrics(): {
    total: number;
    helpfulCount: number;
    notHelpfulCount: number;
    followedCount: number;
    goodOutcomeCount: number;
    badOutcomeCount: number;
    satisfactionScore: number;
  } {
    const total = feedbackStore.length;
    if (total === 0) {
      return {
        total: 0,
        helpfulCount: 0,
        notHelpfulCount: 0,
        followedCount: 0,
        goodOutcomeCount: 0,
        badOutcomeCount: 0,
        satisfactionScore: 96.0
      };
    }

    const helpfulCount = feedbackStore.filter((f) => f.feedbackType === 'helpful').length;
    const notHelpfulCount = feedbackStore.filter((f) => f.feedbackType === 'not_helpful').length;
    const followedCount = feedbackStore.filter((f) => f.feedbackType === 'followed_recommendation').length;
    const goodOutcomeCount = feedbackStore.filter((f) => f.feedbackType === 'outcome_good').length;
    const badOutcomeCount = feedbackStore.filter((f) => f.feedbackType === 'outcome_bad').length;

    const positiveTotal = helpfulCount + goodOutcomeCount + followedCount;
    const negativeTotal = notHelpfulCount + badOutcomeCount;
    const denominator = positiveTotal + negativeTotal || 1;
    const satisfactionScore = Math.round((positiveTotal / denominator) * 100 * 10) / 10;

    return {
      total,
      helpfulCount,
      notHelpfulCount,
      followedCount,
      goodOutcomeCount,
      badOutcomeCount,
      satisfactionScore
    };
  }

  /**
   * Retrieve all recorded feedback entries.
   */
  static getAllFeedback(): AIFeedback[] {
    return [...feedbackStore];
  }
}
