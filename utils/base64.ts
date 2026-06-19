export function base64Encode(value: string): string {
  if (typeof globalThis.btoa === 'function') {
    return globalThis.btoa(value);
  }

  const bytes = new TextEncoder().encode(value);
  const binary = Array.from(bytes, (byte) => String.fromCodePoint(byte)).join('');
  return globalThis.btoa(binary);
}
