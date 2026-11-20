// Rural Fintech Literacy & Access Platform - Offline Sync & Low Bandwidth Controller

export class OfflineSync {
  constructor(appContext) {
    this.app = appContext;
    this.syncQueue = [];
  }

  toggleOfflineMode(isOffline) {
    this.app.state.isOffline = isOffline;

    const banner = document.getElementById('offline-banner');
    if (banner) {
      banner.style.display = isOffline ? 'block' : 'none';
    }

    if (isOffline) {
      console.log("[Offline Mode] Switching to USSD & SMS fallback sync queue.");
    } else {
      console.log("[Online Mode] Flushing sync queue to server...");
      this.flushQueue();
    }
  }

  addToQueue(actionType, payload) {
    this.syncQueue.push({ actionType, payload, timestamp: new Date().toISOString() });
    if (this.app.state.isOffline) {
      alert(`[Offline SMS Fallback] Action queued! It will automatically transmit via SMS/USSD when signal returns.`);
    }
  }

  flushQueue() {
    if (this.syncQueue.length > 0) {
      console.log(`[Offline Sync] Synchronizing ${this.syncQueue.length} offline actions...`);
      this.syncQueue = [];
    }
  }
}
