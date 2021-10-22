# Altador-Telescope-HTML
Recreation of the Neopets Altador's plot telescope in HTML, CSS and JS.
----

Notes of Interest:

--------------------

- Sounds recorded from flash on firefox with Audacity since JPEXS Free Flash Decompiler exported the sounds a bit too low volume.
- Images are low res exported from JPEXS Free Flash Decompiler.
- `this.overlays` offsets are copied from swf and modified by hand if seen too out of place when compared to flash version
- I don't store negative Y coords on stars as `Y * -1` and `real_Y` or whatever was being done on the SWF.
- `.scroll-popup-text`, `.scroll-popup-text-top` and `.scroll-popup-text-bottom` are html classes instead of an html ids because I print them all and then choose which one to show.

--------------------

Maybe can be made prettier with custom elements?
```js
  class Star extends HTMLElement {}
  class Line extends HTMLElement {}
  class Constellation extends HTMLElement {}

  customElements.define('telescope-star', Star);
  customElements.define('telescope-line', Line);
  customElements.define('telescope-constellation', Constellation);
```
--------------------

Ctrl + Shift + Arrows to move 100 px instead of 5?
Ctrl         + Arrows to move 10 px instead of 5?
Shift        + Arrows to move 1 px instead of 5?

--------------------

I used a python script to change the old swf telescope for the new html5 telescope.
I don't know how it would go on MacOS or Linux.

--------------------

On assets/js/unsued/ is javascript from when I first tried using canvas, I couldn't figure it out. Feel free to ignore.

--------------------

# Comparison between Flash and HTML

![Comparison GIF](/near_perfect_stars_positions.gif?raw=true "Comparison between Flash and HTML")

--------------------

# Showcase Video

https://user-images.githubusercontent.com/92926549/138456055-6f1a8e9e-e7f0-4915-9fc3-b6981609ba5d.mp4

