# WADL Parser #

This module takes WADL xml input text and extracts request information, returning it as a js object. 
It is designed with REST API testing in mind.

## Setup ##
Node.js is required.

## Input ##

## Output ##

## Usage ##

## WADL Coverage ##
This module processes WADL following the [W3C WADL specs](https://www.w3.org/Submission/wadl/). Many areas, element types, and attributes are covered in this module. However, currently some are not supported, have limited support, or are ignored (i.e. not used for generating the output). 

### Limited Areas ###
One limited area is [cross-referencing](https://www.w3.org/Submission/wadl/#x3-60002.1). While the WADL specification supports both intra-document and inter-document, this module only supports the former. Therefore, if you wish to use this module and your WADL is spread across multiple documents, you would need to have your own logic beforehand for combining the documents and updating element href attributes to ID's instead of URI's.

Another is the [grammars](https://www.w3.org/Submission/wadl/#x3-90002.4) element. Currently, this module only supports a limited subset of XML schema for complex types and no other types of grammars. Specifically, the supported XML elements are: Schema, ComplexType, All, Sequence, and Element. Additionally, it is also limited in that the root element must be a Schema element and its direct chilren must be ComplexType elements.

### Non-Supported Elements & Attributes ### 
This module does not parse all elements and attributes and thus some are ignored. These ignored items either do not affect the extracted request information or are simply not supported.

Below is the list of ignored attributes organized by their parent element. (Note the parent elements and their other non-listed attributes *are* supported).

- Grammars
  - Include
- Representation
  - Element
  - Profile
- Resource
  - QueryType
- Param
  - Path
  - Required
  - Repeating
- Option
  - MediaType

And here are the ignored elements.
  
- Doc
- Link
_ Response

