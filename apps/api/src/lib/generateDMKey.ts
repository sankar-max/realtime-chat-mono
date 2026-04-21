export function generateDMKey(a: string, b: string) {
  return [a, b].sort().join(':')
}
