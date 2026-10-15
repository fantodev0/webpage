---
slug: jsend-api-response-format
title: JSend-Format für API-Antworten
description: Einfache und praktische Möglichkeiten, API-Antworten zu strukturieren.
date: 2025-01-31
draft: false
---

# JSend: JSON-Format für REST-API-Antworten

Es gibt mehrere Standards für die Formatierung der Antwort auf eine REST-API-Anfrage. JSend ist ein einfacher und weit verbreiteter Standard zur Strukturierung von JSON-Antworten.

## Was ist JSend?

JSend ist ein Format, das festlegt, wie Webserver JSON-Antworten strukturieren sollten. Es konzentriert sich auf die Anwendungsebene und nicht auf das Protokoll oder den Transport. Dadurch eignet es sich gut für REST-Anwendungen und APIs.

Viele Webdienste stellen Daten als JSON bereit, präsentieren sie aber jeweils etwas anders. Deshalb müssen Frontend-Entwickler immer wieder unterschiedliche Antwortstrukturen interpretieren. JSend soll für einheitliche Antwortnamen und Antworttypen sorgen und damit die Kommunikation zwischen Backend und Frontend klarer machen.

## Struktur

Die grundlegende JSend-Struktur sieht so aus:

```json
{
  "status": "success",
  "result": {
    "post": { "id": 1, "title": "A blog post", "body": "Some useful content" }
  }
}
```

JSend definiert drei grundlegende Antworttypen: `success`, `fail` und `error`.

- `success`: Alles ist erfolgreich verlaufen und normalerweise wurden Daten zurückgegeben. Erfordert `status` und `result`.
- `fail`: Die übermittelten Daten waren ungültig oder eine Voraussetzung der API wurde nicht erfüllt. Erfordert `status` und `result`.
- `error`: Bei der Verarbeitung ist ein Fehler aufgetreten, zum Beispiel eine Exception. Erfordert `status` und `result` und kann zusätzlich `code` und `data` enthalten.

## Beispiele für Antworten

### Erfolg

Wenn eine API-Anfrage erfolgreich ist, dient das JSend-Objekt als Wrapper für das Ergebnis. Es verwendet die Felder `status` und `result`.

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

Die erforderlichen Felder sind:

- `status`: Hat immer den Wert `success`.
- `result`: Enthält die von der API-Anfrage zurückgegebenen Daten. Wenn keine Daten zurückgegeben werden, sollte der Wert `null` sein.

### Fehlgeschlagene Anfrage

Eine `fail`-Antwort wird verwendet, wenn eine Anfrage wegen ungültiger Daten oder einer nicht erfüllten clientseitigen Bedingung abgelehnt wird. Das `result`-Objekt erklärt normalerweise, warum die Anfrage fehlgeschlagen ist.

`POST /posts.json`

```json
{
  "status": "fail",
  "result": { "title": "A title is required" }
}
```

Die erforderlichen Felder sind:

- `status`: Hat immer den Wert `fail`.
- `result`: Enthält Details zu den ungültigen Daten oder der nicht erfüllten Bedingung.

### Fehler

Eine `error`-Antwort wird verwendet, wenn die Anfrage wegen eines serverseitigen Problems fehlschlägt.

`GET /posts.json`

```json
{
  "status": "error",
  "result": "Unable to communicate with database"
}
```

Die erforderlichen Felder sind:

- `status`: Hat immer den Wert `error`.
- `result`: Eine verständliche Nachricht, die den Fehler für den Benutzer erklärt.

Eine Fehlerantwort kann zusätzlich einen numerischen `code` und weitere `data` enthalten, wenn diese Informationen für den Client hilfreich sind.

## Referenz

- [JSend auf GitHub](https://github.com/omniti-labs/jsend)
