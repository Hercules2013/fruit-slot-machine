// This adds TypeScript support for Parcel's URL schemes.
// https://parceljs.org/features/dependency-resolution/#url-schemes
declare module 'bundle-text:*' {
  const value: string;
  export default value;
}
