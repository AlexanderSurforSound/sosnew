import { createClient } from '@sanity/client';

const client = createClient({
  projectId: 'wymhjmyo',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
});

const data = await client.fetch(`{
  "total": count(*[_type == "property"]),
  "withImages": count(*[_type == "property" && defined(images) && count(images) > 0]),
  "withoutImages": count(*[_type == "property" && (!defined(images) || count(images) == 0)]),
  "propsWithoutImages": *[_type == "property" && (!defined(images) || count(images) == 0)]{name, trackId}
}`);

console.log('Total properties:', data.total);
console.log('With images:', data.withImages);
console.log('Without images:', data.withoutImages);

if (data.propsWithoutImages.length > 0) {
  console.log('\nProperties still missing images:');
  data.propsWithoutImages.forEach(p => console.log('  -', p.name, '(Track ID:', p.trackId + ')'));
}
