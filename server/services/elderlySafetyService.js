// ==========================================
// ELDERLY MODE SAFETY SERVICE
// ==========================================

// Calculate user's protection score
const calculateProtectionScore = (settings) => {
  let score = 40;

  // AI Guardian
  if (settings.aiGuardianEnabled) {
    score += 20;
  }

  // Scam Protection
  if (settings.scamProtection) {
    score += 15;
  }

  // Call Protection
  if (settings.callProtection) {
    score += 15;
  }

  // Fraud Alerts
  if (settings.fraudAlerts) {
    score += 10;
  }

  // Deduct points for active threats
  const activeThreats = settings.activeThreats || 0;

  score -= activeThreats * 10;

  // Score must stay between 0 and 100
  return Math.max(0, Math.min(100, score));
};


// Get protection status text
const getProtectionStatus = (score) => {
  if (score >= 90) {
    return "Excellent";
  }

  if (score >= 75) {
    return "Good";
  }

  if (score >= 50) {
    return "Moderate";
  }

  return "At Risk";
};


// Build complete safety overview
const buildSafetyOverview = (settings) => {
  const protectionScore =
    calculateProtectionScore(settings);

  const protectionStatus =
    getProtectionStatus(protectionScore);

  return {
    protectionScore,
    protectionStatus,

    aiGuardian: settings.aiGuardianEnabled,
    scamProtection: settings.scamProtection,
    callProtection: settings.callProtection,
    fraudAlerts: settings.fraudAlerts,

    activeThreats: settings.activeThreats || 0,

    isProtected:
      settings.aiGuardianEnabled &&
      protectionScore >= 75,

    lastSafetyCheck:
      settings.lastSafetyCheck || new Date(),
  };
};


module.exports = {
  calculateProtectionScore,
  getProtectionStatus,
  buildSafetyOverview,
};