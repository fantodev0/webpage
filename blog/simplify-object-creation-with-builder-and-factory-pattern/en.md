---
slug: simplify-object-creation-with-builder-and-factory-pattern
title: Simplify object creation with the Builder and Factory patterns
description: A practical introduction to the Builder and Factory patterns for creating objects in a clear and maintainable way.
date: 2026-03-21
draft: false
---

The Builder and Factory patterns are two creational design patterns. Both simplify object creation, but they solve different problems.

# 1. Builder pattern: structured creation

The Builder pattern makes the creation of a complex object more structured and fluent.

Instead of initializing many properties in a constructor or object initializer, a builder lets us configure the object step by step.

Let's say we have a `Person` class:

```csharp
public class Person
{
    public string FirstName { get; set; }
    public string LastName { get; set; }
    public int Age { get; set; }
    public double Size { get; set; }
}
```

Creating an instance can look like this:

```csharp
var person = new Person
{
    FirstName = "John",
    LastName = "Doe",
    Age = 24,
    Size = 180.3
};
```

There is nothing wrong with this approach. However, as `Person` becomes more complex and gains more properties, the initialization can become difficult to read and maintain.

The same object can be created with a Builder:

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

The builder is responsible for assembling the object:

```csharp
var person = new PersonBuilder()
    .WithFirstName("John")
    .WithLastName("Doe")
    .WithAge(25)
    .WithSize(185.6)
    .Build();
```

This syntax is readable and maintainable. The builder can also validate parameters before creating the final object.

# 2. Factory pattern: hidden creation

The Factory pattern abstracts the creation of a complex object by hiding the creation logic behind a dedicated method.

Suppose we have an `IAnimal` interface:

```csharp
public interface IAnimal
{
    void Speak();
}
```

Two classes implement the interface:

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

The factory hides which concrete class must be instantiated:

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

Creating an animal is now simple:

```csharp
IAnimal dog = AnimalFactory.Create("dog");
dog.Speak(); // Woof woof
```

The Factory pattern hides the complexity of object creation. It is particularly useful when the correct implementation depends on a configuration value or another runtime decision.

# Summary

The Builder and Factory patterns both simplify object creation. The Builder structures the creation of a complex object, while the Factory hides which concrete object is created.

The Factory pattern focuses on **"What should I create?"** The Builder focuses on **"How do I create this complex object?"**
