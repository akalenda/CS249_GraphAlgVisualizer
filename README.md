A project I'm working on for school.

It has a long way to go...

Here are some questions I've been asked about it:

### WAT?

This project is intended for visualizing distributed algorithms, specifically those described in "Distributed Algorithms: An Intuitive Approach" by Wan Fokkink. 

### Distributed algorithms, WAT?

These are algorithms that span multiple processes. This may be through shared memory, where independent processes can read and write to the same memory. An example of this would be [Dwarf Fortress][1]+[Dwarf Therapist][2].

The other way is through message passing, where two processes communicate through a port, perhaps on a local- or wide-area network. Message passing is the kind of distributed algorithm this project is concerned with.

### So how does this thing help?

You can download it and open `index.html` in a web browser. Click on the buttons and canvas to put together a graph representing a process network. Then you can type or paste an algorithm into the code text area, and click Run. You can watch messages as they get passed from one process to another, parents getting set, processes terminating, and so on.

It helps because these algorithms are inherently asynchronous and nondeterministic. Messages sent across channels are not necessarily first-in-first-out, and so it can be difficult sometimes to imagine how a distributed algorithm might behave.

That said, about 80% of my motivation for doing this was that I thought it'd be really cool.

### What libraries did you use, versus what did you do yourself?

The algorithms are directly translated from the listing in the back of the book. [AngularJS][3] is used to hook Javascript into HTML elements. [RequireJS][7] is used for organizing modules. [EaselJS][4] is used to draw and animate shapes on the canvas. [CodeMirror][5] is used for the Javascript code editor (but not its evaluation). [Twitter Bootstrap][6] CSS is used for nicer looking buttons. The rest is my own.

### How do I write one of these algorithms?

In Javascript. Take a look at `sampleAlgorithms/_Template.js`; that has the general form. To see what is available to a Process `p`, take a look at `Process.js`. Beyond that, you can do all the standard Javascript stuff, setting properties as you see fit. jQuery's `$` is available too. `sampleAlgorithms/EchoAlgorithm.js` contains a good, short example. Try copying it, pasting it into the code box, and running it.

### What's in the future for this?

I don't know, but I know what I'd like to do:

- A function in Process that algorithms can use to set a `parent`, which will cause an arrow to the parent to be drawn
- A load button that lets users load code from a text file on their computer or the Internet
- A dropdown menu for quickly loading sample algorithms
- Sample algorithms from every chapter in the book
- Pause, speed up, slow down the simulation
- Hovering the mouse over a process, channel, or message displays a tooltip containing information about it
- Fix all the TODOs littering the code
- Figure out proper Javascript packaging

### Can I contribute?

Yes! (・▽・)

### Bro, do you even lift?

...Yes (ﾟヘﾟ)？

[1]: http://www.bay12games.com/dwarves/
[2]: https://github.com/splintermind/Dwarf-Therapist
[3]: https://angularjs.org/
[4]: http://www.createjs.com/EaselJS
[5]: https://codemirror.net/
[6]: http://getbootstrap.com/
[7]: http://requirejs.org/
