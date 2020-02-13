export default function isValidAddress(address) {
  return address.match(/^0x[a-z0-9]{40}$/i);
}
