export default function lookup(app, key) {
  return app.__container__.lookup(key);
}
