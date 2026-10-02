---
title: Annotations in metadata
source: external OData: oasis-csdl@v4.01-os 14.2, 3.6, 15.4 + oasis-p1@v4.01-os 3.1; retrieved 2026-10-02
summary: What an Annotation element is (Term, Qualifier, Target), how annotations are uniquely identified, inherited and targeted, and how a target path is written.
---
# Annotations in metadata

In Service Layer: reference/consuming-service-layer/metadata-document.md; reference/etag/etag-entities-and-metadata.md

- [Overview](#overview)
- [Annotation element](#annotation-element)
- [Qualifier](#qualifier)
- [Target](#target)
- [Target path in other CSDL attributes](#target-path-in-other-csdl-attributes)

## Overview

Model and instance elements can be decorated with *annotations*. Annotations can be used to specify an individual fact about an element, such as whether it is read-only, or to define a common concept, such as a person or a movie.

An applied annotation consists of a *term* (the namespace-qualified name of the annotation being applied), a *target* (the model or instance element to which the term is applied), and a *value*. The value may be a static value, or an expression that may contain a path to one or more properties of an annotated entity.

Annotation terms are defined in metadata and have a name and a type. A set of related terms in a common namespace comprises a *Vocabulary*.

Annotations are identified by their term name and an optional qualifier that allows applying the same term multiple times to the same model element. A model element MUST NOT specify more than one annotation for a given combination of term and qualifier.

## Annotation element

An annotation applies a term to a model element and defines how to calculate a value for the term application. Both term and model element MUST be in scope. Applicability (see Terms and vocabularies) specifies which model elements MAY be annotated with a term.

The value of an annotation is specified as an *annotation expression*, which is either a constant expression representing a constant value, or a dynamic expression. The most common construct for assigning an annotation value is a path expression that refers to a property of the same or a related structured type.

Element `edm:Annotation`:

- MUST contain the attribute `Term`, and MAY contain the attribute `Qualifier`.
- The value of the annotation MAY be a constant expression or dynamic expression.
- If no expression is specified for a term with a primitive type, the annotation evaluates to the default value of the term definition. If no expression is specified for a term with a complex type, the annotation evaluates to a complex instance with default values for its properties. If no expression is specified for a collection-valued term, the annotation evaluates to an empty collection.
- Can be used as a child of the model element it annotates, or as the child of an `edm:Annotations` element that targets the model element to be annotated.
- MAY contain `edm:Annotation` elements that annotate the annotation.

Attribute `Term`: the qualified name of a term in scope.

Example 40: term `Measures.ISOCurrency`, once applied with a constant value, once with a path value

```xml
<Property Name="AmountInReportingCurrency" Type="Edm.Decimal">
   <Annotation Term="Measures.ISOCurrency" String="USD">
    <Annotation Term="Core.Description" 
                 String="The parent company's currency" />
  </Annotation>
</Property>
<Property Name="AmountInTransactionCurrency" Type="Edm.Decimal">
   <Annotation Term="Measures.ISOCurrency" Path="Currency" />
</Property>
<Property Name="Currency" Type="Edm.String" MaxLength="3" />
```

### Inheritance and propagation

- If an entity type or complex type is annotated with a term that itself has a structured type, an instance of the annotated type may be viewed as an "instance" of the term, and the qualified term name may be used as a term-cast segment in path expressions.
- Structured types "inherit" annotations from their direct or indirect base types. If both the type and one of its base types is annotated with the same term and qualifier, the annotation on the type completely replaces the annotation on the base type; structured or collection-valued annotation values are not merged. Similarly, properties of a structured type inherit annotations from identically named properties of a base type.
- It is up to the definition of a term to specify whether and how annotations with this term propagate to places where the annotated model element is used, and whether they can be overridden. E.g. a "Label" annotation for a UI can propagate from a type definition to all properties using that type definition and may be overridden at each property with a more specific label, whereas an annotation marking a type definition as containing a phone number will propagate to all using properties but may not be overridden.

## Qualifier

A term can be applied multiple times to the same model element by providing a qualifier to distinguish the annotations. The qualifier is a simple identifier.

The combination of target model element, term, and qualifier uniquely identifies an annotation.

Annotation elements that are children of an `edm:Annotations` element MUST NOT provide a value for the qualifier attribute if the parent `edm:Annotations` element provides a value for the qualifier attribute.

Example 41: annotation should only be applied to tablet devices

```xml
<Annotation Term="org.example.display.DisplayName" Path="FirstName"
             Qualifier="Tablet" />
```

## Target

The target of an annotation is the model element the term is applied to.

The target MAY be specified indirectly by "nesting" the annotation within the model element. Whether and how this is possible is described per model element in this specification.

The target MAY also be specified directly; this allows defining an annotation in a different schema than the targeted model element.

This external targeting is only possible for model elements that are uniquely identified within their parent, and all their ancestor elements are uniquely identified within their parent:

- Action (single or all overloads)
- Action Import
- Annotation
- Complex Type
- Entity Container
- Entity Set
- Entity Type
- Enumeration Type
- Enumeration Type Member
- Function (single or all overloads)
- Function Import
- Navigation Property (via type, entity set, or singleton)
- Parameter of an action or function (single overload or all overloads defining the parameter)
- Property (via type, entity set, or singleton)
- Return Type of an action or function (single or all overloads)
- Singleton
- Type Definition

These are the direct children of a schema with a unique name (i.e. except actions and functions whose overloads to not possess a natural identifier), and all direct children of an entity container.

External targeting is possible for actions, functions, their parameters, and their return type, either in a way that applies to all overloads of the action or function or all parameters of that name across all overloads, or in a way that identifies a single overload.

External targeting is also possible for properties and navigation properties of singletons or entities in a particular entity set. These annotations override annotations on the properties or navigation properties targeted via the declaring structured type.

The allowed path expressions are:

- qualified name of schema child
- qualified name of schema child followed by a forward slash and name of child element
- qualified name of structured type followed by zero or more property, navigation property, or type-cast segments, each segment starting with a forward slash
- qualified name of an entity container followed by a segment containing a singleton or entity set name and zero or more property, navigation property, or type-cast segments
- qualified name of an action followed by parentheses containing the binding parameter *type* of a bound action overload to identify that bound overload, or by empty parentheses to identify the unbound overload
- qualified name of a function followed by parentheses containing the comma-separated list of the parameter *types* of a bound or unbound function overload in the order of their definition in the function overload
- qualified name of an action or function, optionally followed by parentheses as described in the two previous bullet points to identify a single overload, followed by a forward slash and either a parameter name or `$ReturnType`
- qualified name of an entity container followed by a segment containing an action or function import name, optionally followed by a forward slash and either a parameter name or `$ReturnType`
- One of the preceding, followed by a forward slash, an at (`@`), the qualified name of a term, and optionally a hash (`#`) and the qualifier of an annotation

All qualified names used in a target path MUST be in scope.

Example 42: Target expressions

```text
MySchema.MyEntityType
MySchema.MyEntityType/MyProperty
MySchema.MyEntityType/MyNavigationProperty
MySchema.MyComplexType
MySchema.MyComplexType/MyProperty
MySchema.MyComplexType/MyNavigationProperty
MySchema.MyEnumType
MySchema.MyEnumType/MyMember
MySchema.MyTypeDefinition
MySchema.MyTerm
MySchema.MyEntityContainer
MySchema.MyEntityContainer/MyEntitySet
MySchema.MyEntityContainer/MySingleton
MySchema.MyEntityContainer/MyActionImport
MySchema.MyEntityContainer/MyFunctionImport
MySchema.MyAction
MySchema.MyAction(MySchema.MyBindingType)
MySchema.MyAction(Collection(MySchema.MyBindingType))
MySchema.MyAction()
MySchema.MyFunction
MySchema.MyFunction(MySchema.MyBindingParamType,First.NonBinding.ParamType)
MySchema.MyFunction(First.NonBinding.ParamType,Second.NonBinding.ParamType)
MySchema.MyFunction/MyParameter
MySchema.MyEntityContainer/MyEntitySet/MyProperty
MySchema.MyEntityContainer/MyEntitySet/MyNavigationProperty
MySchema.MyEntityContainer/MyEntitySet/MySchema.MyEntityType/MyProperty
MySchema.MyEntityContainer/MyEntitySet/MySchema.MyEntityType/MyNavProperty
MySchema.MyEntityContainer/MyEntitySet/MyComplexProperty/MyProperty
MySchema.MyEntityContainer/MyEntitySet/MyComplexProperty/MyNavigationProperty
MySchema.MyEntityContainer/MySingleton/MyComplexProperty/MyNavigationProperty
```

## Target path in other CSDL attributes

Target paths are used in attributes of CSDL elements to refer to other CSDL elements or their nested child elements.

The allowed path expressions are:

- The qualified name of an entity container, followed by a forward slash and the name of a container child element
- The target path of a container child followed by a forward slash and one or more forward-slash separated property, navigation property, or type-cast segments

Example 88: Target expressions

```text
MySchema.MyEntityContainer/MyEntitySet
MySchema.MyEntityContainer/MySingleton
MySchema.MyEntityContainer/MySingleton/MyContainmentNavigationProperty
MySchema.MyEntityContainer/MySingleton/My.EntityType/MyContainmentNavProperty
MySchema.MyEntityContainer/MySingleton/MyComplexProperty/MyContainmentNavProp
```
