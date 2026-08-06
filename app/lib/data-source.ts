export type DashboardDataMode = "static" | "api";

export interface DashboardDataStatus {
  mode: DashboardDataMode;
  source: string;
  lastUpdated: string;
  hasLiveData: boolean;
}

export const dashboardDataStatus: DashboardDataStatus = {
  mode: "static",
  source: "Markdown v1.0",
  lastUpdated: "05 AUG 2026",
  hasLiveData: false,
};

// API adapters can implement this contract without changing the dashboard UI.
export interface DashboardDataSource {
  getStatus(): Promise<DashboardDataStatus>;
}

export const staticDataSource: DashboardDataSource = {
  async getStatus() {
    return dashboardDataStatus;
  },
};

