# WADL Parser #

This module takes WADL xml input text and extracts request information, returning it as a js object. 
It is designed with REST API testing in mind.

## Setup ##
Node.js is required.

## Input ##

## Output ##

## Usage ##

## WADL Coverage ##
This module parses WADL mostly following the [W3C WADL specs](https://www.w3.org/Submission/wadl/).
Most element types and their attributes are supported. However some are either not currently supported
or ignored (i.e. not used for generating output). 

While WADL supports both intra-document and inter-document [cross-referencing](https://www.w3.org/Submission/wadl/#x3-60002.1), this module only supports the former. Therefore, if your WADL is spread across multiple documents and you wish to use this module, you would need to have your own logic beforehand for combining them and updating element href attributes to ID's instead of URI's.

Regarding the [grammars](https://www.w3.org/Submission/wadl/#x3-90002.4) element, the specs indicate that a broad range of formats could be used. Currently, this module is limited to the formats it supports.
