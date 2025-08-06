import WebSocket from 'ws';
import { EventEmitter } from 'events';

export class WebSocketClient extends EventEmitter {
    private ws: WebSocket | null = null;
    private url: string;
    private timeout: number;
    // 预留重连相关变量，目前未使用
    // private reconnectAttempts: number = 0;
    // private maxReconnectAttempts: number = 3;
    // private reconnectDelay: number = 1000;

    constructor(url: string, timeout: number = 10000) {
        super();
        this.url = url;
        this.timeout = timeout;
    }

    async connect(): Promise<void> {
        return new Promise((resolve, reject) => {
            try {
                this.ws = new WebSocket(this.url);
                
                const timeoutId = setTimeout(() => {
                    reject(new Error('WebSocket连接超时'));
                }, this.timeout);

                this.ws.on('open', () => {
                    clearTimeout(timeoutId);
                    // this.reconnectAttempts = 0;
                    this.emit('connected');
                    resolve();
                });

                this.ws.on('error', (error) => {
                    clearTimeout(timeoutId);
                    reject(error);
                });

                this.ws.on('close', () => {
                    this.emit('disconnected');
                });

                this.ws.on('message', (data) => {
                    try {
                        const message = JSON.parse(data.toString());
                        this.emit('message', message);
                    } catch (error) {
                        this.emit('error', error);
                    }
                });

            } catch (error) {
                reject(error);
            }
        });
    }

    async request(method: string, params: any[] = []): Promise<any> {
        return new Promise((resolve, reject) => {
            if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
                reject(new Error('WebSocket未连接'));
                return;
            }

            const requestId = Date.now();
            const request = {
                jsonrpc: '2.0',
                method,
                params,
                id: requestId
            };

            const timeoutId = setTimeout(() => {
                reject(new Error('请求超时'));
            }, this.timeout);

            const messageHandler = (data: any) => {
                try {
                    const message = JSON.parse(data.toString());
                    if (message.id === requestId) {
                        clearTimeout(timeoutId);
                        this.ws?.removeListener('message', messageHandler);
                        
                        if (message.error) {
                            reject(new Error(message.error.message || 'RPC错误'));
                        } else {
                            resolve(message.result);
                        }
                    }
                } catch (error) {
                    // 忽略解析错误，继续等待正确的消息
                }
            };

            this.ws.on('message', messageHandler);
            this.ws.send(JSON.stringify(request));
        });
    }

    async getBlockNumber(): Promise<number> {
        const result = await this.request('eth_blockNumber');
        return parseInt(result, 16);
    }

    disconnect(): void {
        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }
    }
} 