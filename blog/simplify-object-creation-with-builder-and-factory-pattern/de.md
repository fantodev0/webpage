---
slug: simplify-object-creation-with-builder-and-factory-pattern
title: Objekterstellung mit den Builder- und Factory-Patterns vereinfachen
description: Eine praktische Einführung in die Builder- und Factory-Patterns für eine klare und wartbare Objekterstellung.
date: 2026-03-21
draft: false
---

Builder und Factory sind zwei erzeugende Design-Patterns. Beide vereinfachen die Erstellung von Objekten, lösen aber unterschiedliche Probleme.

# 1. Builder-Pattern: Strukturierte Erstellung

Das Builder-Pattern macht die Erstellung eines komplexen Objekts strukturierter und ermöglicht eine flüssige Schreibweise.

Statt viele Eigenschaften im Konstruktor oder in einem Objektinitialisierer zu setzen, kann ein Builder das Objekt Schritt für Schritt konfigurieren.

Nehmen wir an, wir haben eine Klasse `Person`:

```csharp
public class Person
{
    public string FirstName { get; set; }
    public string LastName { get; set; }
    public int Age { get; set; }
    public double Size { get; set; }
}
```

Eine Instanz kann so erstellt werden:

```csharp
var person = new Person
{
    FirstName = "John",
    LastName = "Doe",
    Age = 24,
    Size = 180.3
};
```

Daran ist nichts falsch. Wenn `Person` jedoch komplexer wird und weitere Eigenschaften erhält, kann die Initialisierung schwer lesbar und wartbar werden.

Mit einem Builder kann dasselbe Objekt so erstellt werden:

```csharp
public class PersonBuilder
{
    private readonly Person person = new();

    public PersonBuilder WithFirstName(string name)
    {
        person.FirstName = name;
        return this;
    }

    public PersonBuilder WithLastName(string name)
    {
        person.LastName = name;
        return this;
    }

    public PersonBuilder WithAge(int age)
    {
        person.Age = age;
        return this;
    }

    public PersonBuilder WithSize(double size)
    {
        person.Size = size;
        return this;
    }

    public Person Build() => person;
}
```

Der Builder ist für den Aufbau des Objekts zuständig:

```csharp
var person = new PersonBuilder()
    .WithFirstName("John")
    .WithLastName("Doe")
    .WithAge(25)
    .WithSize(185.6)
    .Build();
```

Diese Schreibweise ist gut lesbar und wartbar. Der Builder kann außerdem Parameter prüfen, bevor das fertige Objekt erstellt wird.

# 2. Factory-Pattern: Verborgene Erstellung

Das Factory-Pattern kapselt die Erstellung eines komplexen Objekts in einer eigenen Methode. Dadurch bleibt die konkrete Erstellungslogik verborgen.

Nehmen wir ein `IAnimal`-Interface:

```csharp
public interface IAnimal
{
    void Speak();
}
```

Zwei Klassen implementieren dieses Interface:

```csharp
public class Dog : IAnimal
{
    public void Speak()
    {
        Console.WriteLine("Woof woof");
    }
}

public class Cat : IAnimal
{
    public void Speak()
    {
        Console.WriteLine("Meow meow");
    }
}
```

Die Factory verbirgt, welche konkrete Klasse instanziiert werden muss:

```csharp
public static class AnimalFactory
{
    public static IAnimal Create(string type)
    {
        return type.ToLower() switch
        {
            "dog" => new Dog(),
            "cat" => new Cat(),
            _ => throw new ArgumentException("Invalid animal type")
        };
    }
}
```

Die Erstellung eines Tieres ist nun einfach:

```csharp
IAnimal dog = AnimalFactory.Create("dog");
dog.Speak(); // Woof woof
```

Das Factory-Pattern verbirgt die Komplexität der Objekterstellung. Es ist besonders nützlich, wenn die richtige Implementierung von einer Konfiguration oder einer anderen Entscheidung zur Laufzeit abhängt.

# Zusammenfassung

Builder und Factory vereinfachen beide die Objekterstellung. Der Builder strukturiert den Aufbau eines komplexen Objekts, während die Factory verbirgt, welches konkrete Objekt erstellt wird.

Das Factory-Pattern konzentriert sich auf **"Was soll ich erstellen?"** Der Builder konzentriert sich auf **"Wie erstelle ich dieses komplexe Objekt?"**
