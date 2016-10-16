  - Putting it all together

    Now that we know how to declare our application's structure with a JunctionSet, let's give it a try. In fact, let's use those symbols we defined for Junction and JunctionSet to sketch out our reqirements:

    * diagram

    It looks like our app is going to have 3 screens with 3 coresponding JunctionSets. Let's put together some `Screen` components for each of them with the JunctionSets attached to their `junctionSet` static property (which is a convention we'll continue to use):

    Dashboard screen
    ```
    example
    ```

    Contacts screen
    ```
    example
    ```

    App scren
    ```
    example
    ```

    Notice how we didn't have to create components for all our Routes?

    Now let's add a NavBar. We want our components to use the HTML5 History, but the standard `<a>` tag doesn't support this, so we'll use the `<Link>` tag from [react-junctions](). This compoent has nothing special like active route checking going on - it really is just like `<a>` for HTML5 History.

    ```
    example
    ```

    I've passed through the `history` object manually to make it clear what is going on, but `<Link>` will use a `history` object from the context if one is available. The `<HistoryContext>` component from [react-junctions]() helps with this.

    And there you have it - we've got an entire re-usable component, with routes! We could mount this as-is in a react-router based app with `react-router-junctions`. But for most purposes, that is overkill. So let's write a tiny `main.js` which renders it instead.

    ...






