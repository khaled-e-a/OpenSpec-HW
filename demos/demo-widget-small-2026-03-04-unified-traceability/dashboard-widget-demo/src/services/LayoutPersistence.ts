import LayoutStorage, { LayoutData } from './LayoutStorage';

interface SaveQueueItem {
  layout: LayoutData;
  retries: number;
  timestamp: number;
}

class LayoutPersistence {
  private saveQueue: SaveQueueItem[] = [];
  private isProcessing = false;
  private maxRetries = 3;
  private retryDelay = 1000; // 1 second

  async saveLayout(layout: LayoutData): Promise<void> {
    // Add to queue for offline support
    this.saveQueue.push({
      layout,
      retries: 0,
      timestamp: Date.now(),
    });

    // Process queue
    this.processQueue();
  }

  async loadLayout(userId: string): Promise<LayoutData | null> {
    try {
      const layout = await LayoutStorage.loadLayout(userId);
      return layout;
    } catch (error) {
      console.error('Failed to load layout:', error);
      return null;
    }
  }

  async deleteLayout(userId: string): Promise<void> {
    try {
      await LayoutStorage.deleteLayout(userId);
    } catch (error) {
      console.error('Failed to delete layout:', error);
      throw error;
    }
  }

  private async processQueue(): Promise<void> {
    if (this.isProcessing || this.saveQueue.length === 0) {
      return;
    }

    this.isProcessing = true;

    while (this.saveQueue.length > 0) {
      const item = this.saveQueue[0];

      try {
        await this.saveToStorage(item.layout);
        this.saveQueue.shift(); // Remove successful item
      } catch (error) {
        item.retries++;

        if (item.retries >= this.maxRetries) {
          console.error('Max retries reached for layout save:', error);
          this.saveQueue.shift(); // Remove failed item
          this.notifySaveFailure(item.layout.id);
        } else {
          // Wait before retry
          await this.delay(this.retryDelay * item.retries);
          break; // Exit loop, will retry on next processQueue call
        }
      }
    }

    this.isProcessing = false;

    // Process remaining items
    if (this.saveQueue.length > 0) {
      this.processQueue();
    }
  }

  private async saveToStorage(layout: LayoutData): Promise<void> {
    await LayoutStorage.saveLayout(layout);
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private notifySaveFailure(userId: string): void {
    // Emit event or call callback to notify UI of save failure
    window.dispatchEvent(new CustomEvent('layoutSaveFailed', { detail: { userId } }));
  }

  async validateLayout(layout: LayoutData): Promise<boolean> {
    // Basic validation
    if (!layout.id || !layout.widgetPositions) {
      return false;
    }

    // Check for overlapping widgets
    const positions = Object.values(layout.widgetPositions);
    for (let i = 0; i < positions.length; i++) {
      for (let j = i + 1; j < positions.length; j++) {
        const pos1 = positions[i];
        const pos2 = positions[j];

        if (
          pos1.x < pos2.x + pos2.width &&
          pos1.x + pos1.width > pos2.x &&
          pos1.y < pos2.y + pos2.height &&
          pos1.y + pos1.height > pos2.y
        ) {
          return false; // Overlapping widgets
        }
      }
    }

    return true;
  }
}

export default new LayoutPersistence();