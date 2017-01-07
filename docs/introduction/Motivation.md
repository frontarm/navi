---
title: Motivation
---

# Motivation

- I got a request from a client - "I want my screens to be reusable. And I want the app to use react-router."
- React components are reusable. Screens are components. And react-router is pretty standard. This seemed reasonable, so I said OK

Things weren't OK

- As I tried to implement things, I started to run into issues
- Many of these issues stemmed from decisions made for me by react-router

    How do you link within screens?
    
    - How do you link if you don't know the URL until the app is mounted?
    
    Re-usable components shouldn't need access to the application root
    
    - React-router defines its routes at the top level of the application
    
    What if your screen doesn't have a URL? 
    
    - Modals don't need URLs
    - But you still might want a re-usable screen within a modal

Components should be independent

- It forces components to use its context-based interface to get information.
- It ties your components to react-router
- It steal's your components independence. They're no longer re-usable components, they're just react-router plugins

- What if you want to make real, reusable components?
- Components should be just that - React components
- Junctions is my toolbox for doing just this. And to do so, it follows three principles.
