# Modifying data

## [Create an entity](create-entity.md)
Use when: POSTing a new entity, deep-inserting related entities, or linking to existing entities on create.
Terms: `POST`, deep insert, `@odata.bind`, `201 Created`, `Location`
Not here: update/upsert → [update-entity](update-entity.md); Prefer return values → [modification-semantics](modification-semantics.md)

## [Update an entity (PATCH, PUT, upsert)](update-entity.md)
Use when: PATCHing or PUTting an entity, deep-updating, or upserting with `If-Match` / `If-None-Match`.
Terms: `PATCH`, `PUT`, upsert, deep update, `If-Match`, `If-None-Match`
Not here: delete → [delete-entity](delete-entity.md); relationship `$ref` changes → [modify-relationships](modify-relationships.md)

## [Delete an entity](delete-entity.md)
Use when: DELETEing an entity and understanding the `204` response and relation cleanup.
Terms: `DELETE`, `204 No Content`
Not here: removing a navigation reference only → [modify-relationships](modify-relationships.md)

## [Returning results and common modification semantics](modification-semantics.md)
Use when: choosing `Prefer: return=minimal`/`representation`, applying query options to a create/update response, or shared modification rules (ETags, integrity).
Terms: `Prefer`, `return=minimal`, `return=representation`, `Preference-Applied`, integrity constraints
Not here: Prefer header catalogue → [headers-and-versioning](../headers-and-versioning/index.md)

## [Modify relationships between entities](modify-relationships.md)
Use when: adding, removing, changing or replacing references with POST/DELETE/PUT on navigation properties or `/$ref`.
Terms: `/$ref`, `@odata.bind`, collection-valued navigation, single-valued navigation
Not here: creating related entities in one POST → [create-entity](create-entity.md)
