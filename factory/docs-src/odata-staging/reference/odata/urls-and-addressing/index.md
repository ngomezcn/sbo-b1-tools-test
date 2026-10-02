# URLs and addressing

## [OData URL structure and syntax](url-structure-and-syntax.md)
Use when: splitting a URL into service root, resource path and query options, or checking percent-encoding and quotes in keys.
Terms: service root, resource path, query options, percent-encoding, `'` in keys
Not here: which path reaches an entity or collection → [addressing-entities](addressing-entities.md)

## [Addressing entities and collections](addressing-entities.md)
Use when: writing a path to an entity set, a key, a singleton, a related entity or collection, or a contained navigation.
Terms: entity set, key predicate, singleton, navigation property, `$ref`, `$count`, `$value`
Not here: key predicate grammar and canonical URLs → [key-predicates-and-canonical-urls](key-predicates-and-canonical-urls.md)

## [Key predicates and canonical URLs](key-predicates-and-canonical-urls.md)
Use when: building the canonical URL of an entity or a key predicate under a referential constraint.
Terms: canonical URL, key predicate, referential constraint, named key
Not here: general path composition → [addressing-entities](addressing-entities.md)
