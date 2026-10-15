---
slug: jsend-api-response-format
title: JSend API response format
description: Simple and practical ways to format API responses.
date: 2025-01-31
draft: false
---

# JSend: REST API JSON response format

There are several standards for formatting the response to a REST API request. JSend is a simple and widely used standard for structuring JSON responses.

## What is JSend?

JSend is a format that defines how web servers should structure JSON responses. It focuses on the application level rather than the protocol or transport level, which makes it useful for REST applications and APIs.

Many web services expose data as JSON, but each service may present that data differently. As a result, frontend developers repeatedly have to interpret different response shapes. JSend aims to provide consistent response names and types, making communication between backend and frontend developers clearer.

## Structure

The basic JSend structure looks like this:

```json
{
  "status": "success",
  "result": {
    "post": { "id": 1, "title": "A blog post", "body": "Some useful content" }
  }
}
```

JSend defines three basic response types: `success`, `fail`, and `error`.

- `success`: Everything went well and, usually, some data was returned. It requires `status` and `result`.
- `fail`: The submitted data was invalid or an API precondition was not satisfied. It requires `status` and `result`.
- `error`: An error occurred while processing the request, such as an exception. It requires `status` and `result`, and can optionally include `code` and `data`.

## Response examples

### Success

When an API request succeeds, the JSend object is a wrapper around the result. It uses the `status` and `result` fields.

`GET /posts.json`

```json
{
  "status": "success",
  "result": {
    "posts": [
      { "id": 1, "title": "A blog post", "body": "Some useful content" },
      { "id": 2, "title": "Another blog post", "body": "More content" }
    ]
  }
}
```

`GET /posts/2.json`

```json
{
  "status": "success",
  "result": {
    "post": { "id": 2, "title": "Another blog post", "body": "More content" }
  }
}
```

`DELETE /posts/2.json`

```json
{
  "status": "success",
  "result": null
}
```

The required fields are:

- `status`: Always has the value `success`.
- `result`: Contains the data returned by the API request. If the request returns no data, it should be `null`.

### Fail

A `fail` response is used when a request is rejected because of invalid data or an unsatisfied client-side condition. The `result` object usually explains why the request failed.

`POST /posts.json`

```json
{
  "status": "fail",
  "result": { "title": "A title is required" }
}
```

The required fields are:

- `status`: Always has the value `fail`.
- `result`: Contains details about the invalid data or failed condition.

### Error

An `error` response is used when the request fails because of a server-side problem.

`GET /posts.json`

```json
{
  "status": "error",
  "result": "Unable to communicate with database"
}
```

The required fields are:

- `status`: Always has the value `error`.
- `result`: A meaningful message that explains the error to the user.

An error response can also include a numeric `code` and additional `data` when that information is useful to the client.

## References

- [JSend on GitHub](https://github.com/omniti-labs/jsend)
