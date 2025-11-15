/**
 * Dashboard Utility Functions
 * Helper functions for formatting and calculating dashboard metrics
 */

/**
 * Format a number as currency
 * @param amount - The amount to format
 * @param compact - Use compact notation for large numbers (default: true)
 * @returns Formatted currency string
 */
export function formatCurrency(amount: number, compact: boolean = true): string {
  if (compact) {
    if (amount >= 1000000000) {
      return `$${(amount / 1000000000).toFixed(1)}B`;
    } else if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(1)}M`;
    } else if (amount >= 1000) {
      return `$${(amount / 1000).toFixed(0)}K`;
    }
  }
  return `$${amount.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;
}

/**
 * Format a number as a percentage
 * @param value - The value to format (e.g., 0.85 or 85)
 * @param asDecimal - Whether the input is a decimal (0.85) or whole number (85)
 * @param decimals - Number of decimal places to show
 * @returns Formatted percentage string
 */
export function formatPercent(
  value: number,
  asDecimal: boolean = false,
  decimals: number = 1
): string {
  const percentage = asDecimal ? value * 100 : value;
  return `${percentage.toFixed(decimals)}%`;
}

/**
 * Calculate trend percentage between two values
 * @param current - Current value
 * @param previous - Previous value
 * @returns Percentage change (positive or negative)
 */
export function calculateTrend(current: number, previous: number): number {
  if (previous === 0) return 0;
  return ((current - previous) / previous) * 100;
}

/**
 * Get color class for health status
 * @param health - Health status
 * @returns Tailwind color class
 */
export function getHealthColor(health: "good" | "warning" | "critical"): string {
  switch (health) {
    case "good":
      return "text-green-600 bg-green-50 border-green-200";
    case "warning":
      return "text-yellow-600 bg-yellow-50 border-yellow-200";
    case "critical":
      return "text-red-600 bg-red-50 border-red-200";
    default:
      return "text-gray-600 bg-gray-50 border-gray-200";
  }
}

/**
 * Format days until as human-readable string
 * @param days - Number of days
 * @returns Formatted string
 */
export function formatDaysUntil(days: number): string {
  if (days < 0) {
    return `${Math.abs(days)} days overdue`;
  } else if (days === 0) {
    return "Today";
  } else if (days === 1) {
    return "Tomorrow";
  } else if (days < 7) {
    return `${days} days`;
  } else if (days < 30) {
    const weeks = Math.floor(days / 7);
    return `${weeks} week${weeks > 1 ? "s" : ""}`;
  } else if (days < 365) {
    const months = Math.floor(days / 30);
    return `${months} month${months > 1 ? "s" : ""}`;
  } else {
    const years = Math.floor(days / 365);
    return `${years} year${years > 1 ? "s" : ""}`;
  }
}

/**
 * Format large numbers in compact notation
 * @param num - Number to format
 * @returns Formatted number string
 */
export function formatNumber(num: number): string {
  if (num >= 1000000000) {
    return `${(num / 1000000000).toFixed(1)}B`;
  } else if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  } else if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  return num.toLocaleString();
}

/**
 * Calculate savings percentage
 * @param savings - Savings amount
 * @param total - Total amount
 * @returns Percentage as number
 */
export function calculateSavingsPercent(savings: number, total: number): number {
  if (total === 0) return 0;
  return (savings / total) * 100;
}

/**
 * Get priority color class
 * @param priority - Priority level
 * @returns Tailwind color class
 */
export function getPriorityColor(priority: "low" | "medium" | "high" | "critical"): string {
  switch (priority) {
    case "low":
      return "text-blue-600 bg-blue-50 border-blue-200";
    case "medium":
      return "text-yellow-600 bg-yellow-50 border-yellow-200";
    case "high":
      return "text-orange-600 bg-orange-50 border-orange-200";
    case "critical":
      return "text-red-600 bg-red-50 border-red-200";
    default:
      return "text-gray-600 bg-gray-50 border-gray-200";
  }
}

/**
 * Calculate utilization percentage
 * @param active - Active count
 * @param total - Total count
 * @returns Percentage
 */
export function calculateUtilization(active: number, total: number): number {
  if (total === 0) return 0;
  return (active / total) * 100;
}

/**
 * Get utilization status
 * @param utilization - Utilization percentage
 * @returns Status level
 */
export function getUtilizationStatus(
  utilization: number
): "good" | "warning" | "critical" {
  if (utilization >= 80) return "good";
  if (utilization >= 60) return "warning";
  return "critical";
}

/**
 * Format date to readable string
 * @param date - Date to format
 * @returns Formatted date string
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/**
 * Calculate ROI percentage
 * @param savings - Savings amount
 * @param investment - Investment amount
 * @returns ROI percentage
 */
export function calculateROI(savings: number, investment: number): number {
  if (investment === 0) return 0;
  return ((savings - investment) / investment) * 100;
}

/**
 * Get chart color by index
 * @param index - Index for color selection
 * @returns Hex color code
 */
export function getChartColor(index: number): string {
  const colors = [
    "#0066FF", // Primary Blue
    "#00C896", // Success Green
    "#FF9500", // Warning Orange
    "#AF52DE", // Purple
    "#5AC8FA", // Teal
    "#FF3B30", // Danger Red
    "#FFD60A", // Yellow
    "#68BC00", // BioRad Green
  ];
  return colors[index % colors.length];
}

/**
 * Validate if value is within budget
 * @param actual - Actual value
 * @param budget - Budget value
 * @param threshold - Warning threshold percentage (default: 90)
 * @returns Status level
 */
export function getBudgetStatus(
  actual: number,
  budget: number,
  threshold: number = 90
): "good" | "warning" | "critical" {
  const percentage = (actual / budget) * 100;
  if (percentage >= 100) return "critical";
  if (percentage >= threshold) return "warning";
  return "good";
}

/**
 * Calculate variance between two values
 * @param actual - Actual value
 * @param target - Target value
 * @returns Variance object with amount and percentage
 */
export function calculateVariance(
  actual: number,
  target: number
): { amount: number; percentage: number; status: "over" | "under" | "on-target" } {
  const amount = actual - target;
  const percentage = target === 0 ? 0 : (amount / target) * 100;
  let status: "over" | "under" | "on-target" = "on-target";

  if (amount > 0) status = "over";
  else if (amount < 0) status = "under";

  return { amount, percentage, status };
}

/**
 * Group array by key
 * @param array - Array to group
 * @param key - Key to group by
 * @returns Grouped object
 */
export function groupBy<T>(array: T[], key: keyof T): Record<string, T[]> {
  return array.reduce((result, item) => {
    const groupKey = String(item[key]);
    if (!result[groupKey]) {
      result[groupKey] = [];
    }
    result[groupKey].push(item);
    return result;
  }, {} as Record<string, T[]>);
}

/**
 * Calculate average of array of numbers
 * @param numbers - Array of numbers
 * @returns Average
 */
export function average(numbers: number[]): number {
  if (numbers.length === 0) return 0;
  return numbers.reduce((sum, num) => sum + num, 0) / numbers.length;
}

/**
 * Get status emoji
 * @param status - Status level
 * @returns Emoji character
 */
export function getStatusEmoji(status: "good" | "warning" | "critical"): string {
  switch (status) {
    case "good":
      return "🟢";
    case "warning":
      return "🟡";
    case "critical":
      return "🔴";
    default:
      return "⚪";
  }
}
