---
title: Terms and vocabularies
source: external OData: oasis-csdl@v4.01-os 14.1; retrieved 2026-10-02
summary: How a Term is defined in a metadata document (Name, Type, BaseTerm, AppliesTo, DefaultValue) and which model elements AppliesTo can name.
---
# Terms and vocabularies

In Service Layer: reference/consuming-service-layer/metadata-document.md

## Term

A term allows annotating a CSDL element or OData resource representation with additional data.

- The term's name is a simple identifier that MUST be unique within its schema.
- The term's type MUST be a type in scope, or a collection of a type in scope.

Element `edm:Term`:

- MUST contain the attributes `Name` and `Type`. MAY contain the attributes `BaseTerm` and `AppliesTo`.
- MAY specify values for the `Nullable`, `MaxLength`, `Precision`, `Scale`, or `SRID` facet attributes, as well as the `Unicode` facet attribute for 4.01 and greater payloads. These facets and their implications are described in Type Facets.
- If its `Type` attribute specifies a primitive or enumeration type, it MAY define a value for the `DefaultValue` attribute.
- MAY contain `edm:Annotation` elements.

### Attributes

- `Name`: the term's name.
- `Type`: for single-valued properties, the qualified name of the property's type. For collection-valued properties, the character sequence `Collection(` followed by the qualified name of the property's item type, followed by a closing parenthesis `)`.
- `DefaultValue`: determines the value of the term when applied in an `edm:Annotation` without providing an expression.
  - Default values of type `Edm.String` MUST be represented according to the XML escaping rules for character data in attribute values.
  - Values of other primitive types MUST be represented according to the appropriate alternative in the `primitiveValue` rule defined in [OData-ABNF], i.e. `Edm.Binary` as `binaryValue`, `Edm.Boolean` as `booleanValue` etc.
  - If no value is specified, the `DefaultValue` attribute defaults to `null`.
- `BaseTerm`: the qualified name of the base term.
- `AppliesTo`: a whitespace-separated list of symbolic values from the table below that identify model elements the term is intended to be applied to.

## Specialized term

A term MAY specialize another term in scope by specifying it as its base term (`BaseTerm`).

When applying a term with a base term, the base term MUST also be applied with the same qualifier, and so on until a term without a base term is reached.

## Applicability

The applicability of a term MAY be restricted to a list of model elements. If no list is supplied, the term is not intended to be restricted in its application. The list of model elements MAY be extended in future versions of the vocabulary. As the intended usage may evolve over time, clients SHOULD be prepared for any term to be applied to any model element and SHOULD be prepared to handle unknown values within the `AppliesTo` attribute. Applicability is expressed using the following symbolic values:

| Symbolic Value | Model Element |
|---|---|
| `Action` | Action |
| `ActionImport` | Action Import |
| `Annotation` | Annotation |
| `Apply` | Application of a client-side function in an annotation |
| `Cast` | Type Cast annotation expression |
| `Collection` | Entity Set or collection-valued Property or Navigation Property |
| `ComplexType` | Complex Type |
| `EntityContainer` | Entity Container |
| `EntitySet` | Entity Set |
| `EntityType` | Entity Type |
| `EnumType` | Enumeration Type |
| `Function` | Function |
| `FunctionImport` | Function Import |
| `If` | Conditional annotation expression |
| `Include` | Reference to an Included Schema |
| `IsOf` | Type Check annotation expression |
| `LabeledElement` | Labeled Element expression |
| `Member` | Enumeration Member |
| `NavigationProperty` | Navigation Property |
| `Null` | Null annotation expression |
| `OnDelete` | On-Delete Action of a navigation property |
| `Parameter` | Action of Function Parameter |
| `Property` | Property of a structured type |
| `PropertyValue` | Property value of a Record annotation expression |
| `Record` | Record annotation expression |
| `Reference` | Reference to another CSDL document |
| `ReferentialConstraint` | Referential Constraint of a navigation property |
| `ReturnType` | Return Type of an Action or Function |
| `Schema` | Schema |
| `Singleton` | Singleton |
| `Term` | Term |
| `TypeDefinition` | Type Definition |
| `UrlRef` | UrlRef annotation expression |

Example 39: the `IsURL` term can be applied to properties and terms that are of type `Edm.String` (the `Core.Tag` type and the two `Core` terms are defined in [OData-VocCore])

```xml
<Term Name="IsURL" Type="Core.Tag" Nullable="false" DefaultValue="true"
       AppliesTo="Property Term"> 
   <Annotation Term="Core.Description">
     <String>
       Properties and terms annotated with this term MUST contain a valid URL
    </String>
   </Annotation>
  <Annotation Term="Core.RequiresType" String="Edm.String" />
</Term>
```
