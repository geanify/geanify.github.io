#!/usr/bin/env bun

import { spawn } from "child_process";
import { createInterface } from "readline";

process.env.NODE_ENV = 'production';

interface ProcessManagerConfig {
  script: string;
  maxRestarts: number;
  restartDelay: number;
  logPrefix: string;
}

class ProcessManager {
  private config: ProcessManagerConfig;
  private restartCount: number = 0;
  private childProcess: any = null;
  private isShuttingDown: boolean = false;

  constructor(config: ProcessManagerConfig) {
    this.config = config;
  }

  start() {
    console.log(`${this.config.logPrefix} Starting process manager...`);
    this.spawnProcess();
    this.setupGracefulShutdown();
  }

  private spawnProcess() {
    if (this.isShuttingDown) return;

    console.log(`${this.config.logPrefix} Starting ${this.config.script} (attempt ${this.restartCount + 1})`);
    
    this.childProcess = spawn("bun", ["run", this.config.script], {
      stdio: ["inherit", "inherit", "inherit"],
      env: { ...process.env }
    });

    this.childProcess.on("exit", (code: number, signal: string) => {
      if (this.isShuttingDown) {
        console.log(`${this.config.logPrefix} Process stopped due to shutdown`);
        return;
      }

      console.log(`${this.config.logPrefix} Process exited with code ${code} and signal ${signal}`);
      
      if (this.restartCount >= this.config.maxRestarts) {
        console.error(`${this.config.logPrefix} Max restarts (${this.config.maxRestarts}) reached. Stopping process manager.`);
        process.exit(1);
      }

      this.restartCount++;
      console.log(`${this.config.logPrefix} Restarting in ${this.config.restartDelay}ms...`);
      
      setTimeout(() => {
        this.spawnProcess();
      }, this.config.restartDelay);
    });

    this.childProcess.on("error", (error: Error) => {
      console.error(`${this.config.logPrefix} Process error:`, error.message);
    });
  }

  private setupGracefulShutdown() {
    const shutdown = (signal: string) => {
      console.log(`\n${this.config.logPrefix} Received ${signal}. Shutting down gracefully...`);
      this.isShuttingDown = true;
      
      if (this.childProcess) {
        this.childProcess.kill("SIGTERM");
        
        // Force kill after 10 seconds if process doesn't exit gracefully
        setTimeout(() => {
          if (this.childProcess) {
            console.log(`${this.config.logPrefix} Force killing process...`);
            this.childProcess.kill("SIGKILL");
          }
          process.exit(0);
        }, 10000);
      } else {
        process.exit(0);
      }
    };

    process.on("SIGINT", () => shutdown("SIGINT"));
    process.on("SIGTERM", () => shutdown("SIGTERM"));
  }
}

// Configuration
const config: ProcessManagerConfig = {
  script: "prod-server.ts",
  maxRestarts: 10,
  restartDelay: 2000, // 2 seconds
  logPrefix: "[PROCESS-MANAGER]"
};

// Start the process manager
const manager = new ProcessManager(config);
manager.start();

console.log(`${config.logPrefix} Process manager started. Press Ctrl+C to stop.`); 