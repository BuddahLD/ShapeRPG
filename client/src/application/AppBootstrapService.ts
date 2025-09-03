/**
 * Application Service: AppBootstrap Singleton
 * Provides single instance of AppBootstrap to all components
 */

import { AppBootstrap } from './AppBootstrap';

class AppBootstrapService {
  private static instance: AppBootstrap | null = null;

  static getInstance(): AppBootstrap {
    if (!this.instance) {
      this.instance = AppBootstrap.createDevelopmentApp();
    }
    return this.instance;
  }

  static reset(): void {
    this.instance = null;
  }
}

export { AppBootstrapService };
