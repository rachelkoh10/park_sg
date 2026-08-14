export type AnalyticsEventName =
  | 'destination_search'
  | 'location_permission_granted'
  | 'parking_search'
  | 'parking_card_clicked'
  | 'best_parking_clicked'
  | 'cheapest_parking_clicked'
  | 'nearest_parking_clicked'
  | 'navigation_clicked'
  | 'carpark_saved'
  | 'deal_clicked'
  | 'priority_changed'
  | 'duration_changed'
  | 'radius_changed';

export interface AnalyticsEvent {
  eventName: AnalyticsEventName;
  properties?: Record<string, any>;
  timestamp: string;
}

const analyticsLog: AnalyticsEvent[] = [];

export function trackEvent(eventName: AnalyticsEventName, properties?: Record<string, any>) {
  const event: AnalyticsEvent = {
    eventName,
    properties,
    timestamp: new Date().toISOString()
  };

  analyticsLog.unshift(event);
  if (analyticsLog.length > 100) {
    analyticsLog.pop();
  }

  // Also log to console in non-production
  console.log(`[Analytics] ${eventName}:`, properties);

  // Send to server if available
  try {
    fetch('/api/analytics/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(event),
    }).catch(() => {
      // Non-blocking telemetry
    });
  } catch {
    // Non-blocking
  }
}

export function getRecentAnalyticsLogs(): AnalyticsEvent[] {
  return [...analyticsLog];
}
