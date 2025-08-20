declare module 'qrcode' {
  // Minimal surface we use
  const QRCode: {
    toBuffer: (text: string, opts?: any) => Promise<Buffer>;
    toDataURL: (text: string, opts?: any) => Promise<string>;
    toString: (text: string, opts?: any) => Promise<string>;
  };
  export default QRCode;
}
