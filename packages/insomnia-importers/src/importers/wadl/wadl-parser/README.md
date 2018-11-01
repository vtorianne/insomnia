# WADL Parser #

This module takes WADL xml input text and extracts request information, returning it as a js object. 
It is designed with REST API testing in mind.

## Setup ##
Node.js is required.

## Input ##

## Output ##

## Usage ##

## WADL Coverage ##
This module processes WADL following the [W3C WADL specs](https://www.w3.org/Submission/wadl/).
Many areas, element types, and attributes are covered in this module. However, currently some are 
not supported, have limited support, or are ignored (i.e. not used for generating the output). 

While WADL supports both intra-document and inter-document [cross-referencing](https://www.w3.org/Submission/wadl/#x3-60002.1), this module only supports the former. Therefore, if you wish to use this module and your WADL is spread across multiple documents, you would need to have your own logic beforehand for combining the documents and updating element href attributes to ID's instead of URI's.

[Documentation] elements are not used for parsing the requests and thus are ignored.

Regarding the [grammars](https://www.w3.org/Submission/wadl/#x3-90002.4) element, the specs indicate that a broad range of formats could be used. Currently, this module is limited to the formats it supports.
