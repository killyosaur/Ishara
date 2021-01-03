export interface AlertState {
    variant?: 'success' | 'error' | 'info' | 'warning' | undefined;
    message?: string;
    key?: number;
}