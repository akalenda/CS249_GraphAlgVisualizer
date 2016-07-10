![8](https://github.com/akalenda/CS249_GraphAlgVisualizer/blob/master/screenshot.gif)

A project I did for school. [Try it here.][8]

Here are some questions I've been asked about it:

### WAT?

This project is intended for visualizing distributed algorithms, 
specifically those described in "Distributed Algorithms: 
An Intuitive Approach" by Wan Fokkink. 

### Distributed algorithms, WAT?

These are algorithms that span multiple processes. This may be through 
shared memory, where independent processes can read and write to the 
same memory. An example of this would 
be [Dwarf Fortress][1]+[Dwarf Therapist][2].

The other way is through message passing, where two processes 
communicate through a port, perhaps on a local- or wide-area 
network. Message passing is the kind of distributed algorithm 
this project is concerned with.

### Okay, what does this thing do?

[Try it and see!][8] Click on Load Samples. Try Echo; load the sample
code, and the sample graph, click the run button, and see how a
spanning tree of a network is built.

### So how does this thing help?

You can watch messages as they get passed from 
one process to another, parents getting set, processes terminating, 
and so on.

It helps because these algorithms are inherently asynchronous and 
nondeterministic. Messages sent across channels are not necessarily 
first-in-first-out, and so it can be difficult sometimes to imagine 
how a distributed algorithm might behave.

That said, about 80% of my motivation for doing this was that I thought 
it'd be cool.

### What libraries did you use, versus what did you do yourself?

The algorithms are directly translated from the listing in the back of 
the book. [AngularJS][3] is used to hook Javascript into HTML elements. 
[RequireJS][7] is used for organizing modules. [EaselJS][4] is used to 
draw and animate shapes on the canvas. [CodeMirror][5] is used for the 
Javascript code editor (but not its evaluation). [Twitter Bootstrap][6] 
CSS is used for nicer looking buttons. [AngularJS][9] and 
[Angular UI][10] are also in use.

### How do I write one of these algorithms?

In Javascript. Take a look at the samples. To see what is available to 
a Process `p`, take a look at `Process.js`. Beyond that, you can do all 
the standard Javascript stuff, setting properties as you see fit. 
jQuery's `$` is available too.

### What's in the future for this?

I don't know, but I know what I'd like to do:

- Sample algorithms from every chapter in the book
- Pause, speed up, slow down the simulation
- Hovering the mouse over a process, channel, or message displays a tooltip containing information about it
- Track the life of a particular signal as it travels through the network
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
[8]: http://akalenda.github.io/CS249_GraphAlgVisualizer/
[9]: https://angularjs.org
[10]: https://angular-ui.github.io/
