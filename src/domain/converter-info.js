export function createConverterInfo(input) {
  const title = String(input.title ?? '').trim();
  const description = String(input.description ?? '').trim();
  const fileHint = String(input.fileHint ?? '').trim();
  const privacyNote = String(input.privacyNote ?? '').trim();

  if (!title || !description || !fileHint || !privacyNote) {
    throw new Error('Completa todos los campos de información de Video a MP3.');
  }

  return { title, description, fileHint, privacyNote };
}
